import { Server as HttpServer, IncomingMessage } from "http";
import { Socket } from 'net'
import WebSocket, { Server, Data } from "ws";
import {
    buildUserConnectedPayload,
    buildUserDisconnectedPayload,
    buildMessageSentPayload,
    buildErrorReplyPayload,
    buildSuccessReplyPayload
} from "./payload-builders";
import basicAuth from "basic-auth";
import { Logger } from "pino";

interface UserClient {
    username: string,
    socket: WebSocket,
}

interface AuthenticatedMessage extends IncomingMessage {
    username?: string,
    ip?: string,
}

class MessagingWebsocketServer {
    clients: {[username: string]: UserClient}
    wsServer: Server
    logger: Logger

    constructor(httpServer: HttpServer, logger: Logger) {
        this.logger = logger;
        this.clients = {};

        this.logger.info('Starting messaging server.');
        this.wsServer = new Server({ clientTracking: false, noServer: true });

        httpServer.on('upgrade', this.handleUpgrade.bind(this));
        this.wsServer.on('connection', this.handleConnection.bind(this));
    }

    handleUpgrade(request: AuthenticatedMessage, socket: Socket, head: any) {
        const username = MessagingWebsocketServer.authenticateBasic(request);

        if (username === null) {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();

            this.logger.warn(`Client tried to connect without credentials from IP ${request.ip}`);
            return;
        }

        if (username in this.clients) {
            socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
            socket.destroy();

            this.logger.warn(`Client was rejected for logging on with` +
                `already active user '${username}' connected from IP ${request.ip}.`);
            return;
        }

        request.username = username;
        request.ip = socket.remoteAddress;

        this.wsServer.handleUpgrade(request, socket, head, (socket) => {
            this.wsServer.emit('connection', socket, request);
        });
    }

    handleConnection(socket: WebSocket, request: AuthenticatedMessage) {
        const userClient = {
            username: request.username,
            socket,
        }

        this.clients[userClient.username] = userClient;
        socket.on('close', () => this.handleDisconnected(userClient.username));
        socket.on('message', (data: Data) => this.handleIncomingMessage(userClient.username, data));

        this.sendPayloadToAll(buildUserConnectedPayload(userClient.username, Date.now()));
        this.logger.info(`Client with username '${userClient.username}' connected from IP ${request.ip}.`);
    }

    handleDisconnected(username: string) {
        if (!(username in this.clients)) {
            this.logger.error(`Disconnecting client with username ${username} that was not tracked.`);
            return;
        }

        delete this.clients[username];
        
        this.sendPayloadToAll(buildUserDisconnectedPayload(username, Date.now()));
        this.logger.info(`Disconnected client with username '${username}'.`);
    }

    handleIncomingMessage(username: string, payloadRaw: Data) {
        if (!(username in this.clients)) {
            this.logger.error(`Got message from username '${username}' that is not tracked.`);
            return;
        }

        let payload: ClientPayload;
        try {
            payload = JSON.parse(payloadRaw as string);
        } catch (e) {
            this.logger.warn(`Got non-JSON payload from username '${username}', payload was ${payloadRaw}`);
            this.sendPayloadToUser(username, buildErrorReplyPayload(null, "malformed_payload"));
            return;
        }

        if (typeof payload.type === "undefined" || typeof payload.payload_id === "undefined") {
            this.sendPayloadToUser(username, buildErrorReplyPayload(null, "malformed_payload"));
            return;
        }

        switch (payload.type) {
            case 'send_message':
                this.handleSendMessagePayload(username, payload);
                break;
            default:
                this.logger.warn(`Got unknown payload type '${payload.type}' from user '${username}'`);
                this.sendPayloadToUser(username, buildErrorReplyPayload(null, "malformed_payload"));
                break;
        }
    }

    handleSendMessagePayload(username: string, payload: SendMessagePayload) {
        const { message, payload_id } = payload;
        if (typeof message !== 'string') {
            this.sendPayloadToUser(username, buildErrorReplyPayload(payload_id, "malformed_payload"));
        }

        this.sendPayloadToAll(buildMessageSentPayload(username, message, Date.now()));

        this.sendPayloadToUser(username, buildSuccessReplyPayload(payload_id));
        this.logger.info(`User '${username}' sent message '${message}'`);
    }

    close() {
        this.logger.info('Shutting down messaging server.')
        Object.values(this.clients).forEach(client => {
            client.socket.terminate();
        });
    }

    sendPayloadToUser(username: string, payload: ServerPayload) {
        if (!(username in this.clients)) {
            this.logger.error(`Tried to send payload to non-tracked user '${username}'.`);
            return;
        }
        const { socket } = this.clients[username];
        this.sendPayloadToSocket(socket, payload);
    }

    sendPayloadToAll(payload: ServerPayload) {
        Object.values(this.clients).forEach(client => {
            this.sendPayloadToSocket(client.socket, payload);
        });
    }

    sendPayloadToSocket(clientSocket: WebSocket, payload: ServerPayload) {
        clientSocket.send(JSON.stringify(payload));
    }

    static authenticateBasic(request: IncomingMessage): string | null {
        const credentials = basicAuth(request);

        if (typeof credentials === 'undefined') {
            return null;
        }

        return credentials.name;
    }
}

export default MessagingWebsocketServer
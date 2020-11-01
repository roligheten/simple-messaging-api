import { Server as HttpServer, IncomingMessage } from "http";
import { Socket } from 'net'
import WebSocket, { Server, Data } from "ws";
import { buildUserConnectedPayload } from "./payload-builders";
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

        this.logger.info('Starting messaging server.')
        this.wsServer = new Server({ clientTracking: false, noServer: true });

        httpServer.on('upgrade', this.handleUpgrade.bind(this));
        this.wsServer.on('connection', this.handleConnection.bind(this));
    }

    handleUpgrade(request: AuthenticatedMessage, socket: Socket, head: any) {
        const username = MessagingWebsocketServer.authenticateBasic(request)

        if (username === null) {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();

            this.logger.warn(`Client tried to connect without credentials from IP ${request.ip}`)
            return;
        }

        if (username in this.clients) {
            socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
            socket.destroy();

            this.logger.warn(`Client was rejected for logging on with
                already active user '${username}' connected from IP ${request.ip}.`);
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

        this.logger.info(`Client with username '${userClient.username}' connected from IP ${request.ip}.`)
        this.sendPayloadToAll(buildUserConnectedPayload(userClient.username, Date.now()));
    }

    close() {
        this.logger.info('Shutting down messaging server.')
        Object.values(this.clients).forEach(client => {
            client.socket.terminate()
        });
    }

    sendPayloadToSocket(clientSocket: WebSocket, payload: ServerPayload) {
        clientSocket.send(JSON.stringify(payload))
    }

    sendPayloadToAll(payload: ServerPayload) {
        Object.values(this.clients).forEach(client => {
            this.sendPayloadToSocket(client.socket, payload)
        });
    }

    static authenticateBasic(request: IncomingMessage): string | null {
        const credentials = basicAuth(request);

        if (typeof credentials === 'undefined') {
            return null;
        }

        return credentials.name
    }
}

export default MessagingWebsocketServer
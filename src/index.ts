import { createServer } from 'http';
import MessagingWebSocketServer from './MessagingWebsocketServer'
import pino from 'pino';

const logger = pino();

const server = createServer();

const messagingServer = new MessagingWebSocketServer(server, logger);


process.on('SIGTERM', () => {
    logger.info('Got SIGTERM.');
    server.close();
    messagingServer.close();
});

logger.info('Starting HTTP server on port 8081');

server.listen(8081);
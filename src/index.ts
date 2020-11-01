import { createServer } from 'http';
import MessagingWebSocketServer from './MessagingWebsocketServer'
import pino from 'pino';

const logger = pino();

const server = createServer();

const messagingServer = new MessagingWebSocketServer(server, logger);

logger.info('Starting HTTP server on port 8080');
server.listen(8080);
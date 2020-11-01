import { createServer } from 'http';
import MessagingWebsocketServer from '../MessagingWebsocketServer';
import WebSocket from 'ws'
import pino from 'pino';

Date.now = jest.fn(() => 1111)

describe('MessagingWebSocketServer', function() {
    let httpServer = undefined;
    let wsServer = undefined;
    const logger = pino({level: 'error'});


    beforeEach(function(done) {
        httpServer = createServer();

        wsServer = new MessagingWebsocketServer(httpServer, logger)

        httpServer.listen(7655, () => {
            done();
        });
    });

    afterEach(function(done) {
        httpServer.close(function() { done() })
        wsServer.close();
    });


    it('should send user_connected payload to all connected clients on new connection', function(done) {
        const user1ConnectPayload = "{\"type\":\"user_connected\",\"timestamp\":1111,\"username\":\"user1\"}"
        const user2ConnectPayload = "{\"type\":\"user_connected\",\"timestamp\":1111,\"username\":\"user2\"}"
        
        const ws1 = new WebSocket('ws://user1@localhost:7655');

        // Expect user1 to get their own connected message
        ws1.once('message', function incoming(data) {
            expect(data).toBe(user1ConnectPayload);
            
            const ws2 = new WebSocket('ws://user2@localhost:7655');

            // Expect both users to get user2's connected message
            let ws1GotMessage = false
            let ws2GotMessage = false
            ws1.once('message', function incoming(data) {
                expect(data).toBe(user2ConnectPayload);
                ws1GotMessage = true;
                if (ws1GotMessage && ws2GotMessage) {
                    done(); 
                }
            });
            ws2.once('message', function incoming(data) {
                expect(data).toBe(user2ConnectPayload);
                ws2GotMessage = true;
                if (ws1GotMessage && ws2GotMessage) {
                    done(); 
                }
            });
        });
    })

    it('should not accept connections missing credentials', function(done) {
        const ws = new WebSocket('ws://localhost:7655');
            ws.on('error', function(e) {
                expect(e.message).toBe('Unexpected server response: 401')
                done();
            })
    })

    it('should not accept connection if someone is already connected with same user', function(done) {
        const ws1 = new WebSocket('ws://user1@localhost:7655');
            ws1.once('open', function(e) {
                const ws2 = new WebSocket('ws://user1@localhost:7655');
                ws2.on('error', function(e) {
                    expect(e.message).toBe('Unexpected server response: 403')
                    done();
                })
            })
    })
});
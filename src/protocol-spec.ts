type ServerPayload = UserConnectedPayload | UserDisconnectedPayload | MessageSentPayload | ReplyPayload

type ClientPayload = SendMessagePayload

interface UserConnectedPayload {
    type: 'user_connected',
    timestamp: number,
    username: string,
}

interface UserDisconnectedPayload {
    type: 'user_disconnected',
    timestamp: number,
    username: string,
}

interface MessageSentPayload {
    type: 'message_sent',
    message: string,
    username: string,
    timestamp: number,
}


interface SendMessagePayload {
    type: 'send_message',
    payload_id: string,
    message: string,
}

type ReplyErrorCode = 'malformed_payload'

interface ReplyPayload {
    type: 'reply',
    payload_id: string | null,
    error: ReplyErrorCode | null,
}
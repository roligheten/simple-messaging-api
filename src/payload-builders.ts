function buildUserConnectedPayload(username: string, timestamp: number): UserConnectedPayload  {
    return {
        type: 'user_connected',
        timestamp,
        username,
    }
};

function buildUserDisconnectedPayload(username: string, timestamp: number): UserDisconnectedPayload  {
    return {
        type: 'user_disconnected',
        timestamp,
        username,
    }
};

function buildMessageSentPayload(username: string, message: string, timestamp: number): MessageSentPayload  {
    return {
        type: 'message_sent',
        message,
        timestamp,
        username,
    }
};

function buildSuccessReplyPayload(payload_id: string): ReplyPayload {
    return {
        type: 'reply',
        payload_id,
        error: null,
    }
};

function buildErrorReplyPayload(payload_id: string, error: ReplyErrorCode): ReplyPayload {
    return {
        type: 'reply',
        payload_id,
        error,
    }
};



export {
    buildUserConnectedPayload,
    buildUserDisconnectedPayload,
    buildMessageSentPayload,
    buildSuccessReplyPayload,
    buildErrorReplyPayload
};
function buildUserConnectedPayload(username: string, timestamp: number): UserConnectedPayload  {
    return {
        type: 'user_connected',
        timestamp,
        username,
    }
}

function buildUserDisconnectedPayload(username: string, timestamp: number): UserDisconnectedPayload  {
    return {
        type: 'user_disconnected',
        timestamp,
        username,
    }
}


export {
    buildUserConnectedPayload,
    buildUserDisconnectedPayload
}
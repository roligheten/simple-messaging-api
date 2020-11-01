type ServerPayload = UserConnectedPayload | UserDisconnectedPayload

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
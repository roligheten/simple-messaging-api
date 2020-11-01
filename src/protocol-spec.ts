type ServerPayload = UserConnectedPayload

interface UserConnectedPayload {
    type: 'user_connected',
    timestamp: number,
    username: string,
}
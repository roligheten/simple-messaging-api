function buildUserConnectedPayload(username: string, timestamp: number): UserConnectedPayload  {
    return {
        type: 'user_connected',
        timestamp,
        username,
    }
}

export {
    buildUserConnectedPayload
}
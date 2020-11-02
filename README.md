# Simple Messaging API
This repository contains the code and documentation for the "Simple Messaging" realtime API.

## Simple Messaging Specification
This is the specification of the realtime messaging protocol used by the API. 

See [Simple Messaging Specification](./spec.md) for details.

## Simple Messaging Server
This is an implementation of a WebSocket based server for the aformentioned "Simple Messaging Specification" in Node.JS.

Once running, the server will accept WebSocket connections and handle requests / respond to events in a manner consistant with the [Simple Messaging Specification](./spec.md).

### Requirements
This code has been tested on v13.8.0 of Node.JS. It should work on earlier versions but try running this one if you have problems.

### Installing and running

Install the required dependencies with:
```
npm install
```

Transpile TypeScript with:
```
npm build
```

Check that all tests pass by running:
```
npm test
```

Then start the server by running:
```
npm start
```

That's it 🎉 The server should now be running on port 8080

## Interacting with the messaging server

Connecting to the messaging server is relatively simple: Using a Websocket client connect to `ws://<username>@<host of server>:8080`.

The server currently requires clients to authenticate with Basic HTTP authentication, so you need to provide either `<username>@` in the connection URL, or provide the appropriate Authentication headers manually. No password is required, and any username is accepted as long as it is not already in use by another client. Not providing basic auth header will result in a `401 Unauthorized` response.

You will need a WebSocket client to interact with the messaging server. Since no "real" client exists for interacting with the messaging server, I recommend you use [Websocat](https://github.com/vi/websocat).

Connecting to a locally running server is then done by 
```
websocat ws://username@localhost:8080
```

You can now copy-paste payloads into the running client for example:
```
{"type":"send_message","payload_id":"1","message":"hello"}
```
to send a "hello" message.
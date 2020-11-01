# Simple Messaging API
This repository contains the specification and server implementation of the "Simple Messaging" realtime API.

## Simple Messaging Specification
See [Simple Messaging Specification](./spec.md) for details.

## Simple Messaging Server
This is an implementation of a WebSocket based server for the aformentioned "Simple Messaging Specification" in Node.JS.

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
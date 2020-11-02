## Simple Messaging Specification
The Simple Messaging protocol is a realtime messaging protocol meant to be implemented using WebSockets.

The Simple Messaging protocol allows messaging between a set of clients that are connected to the same messaging server.

A client communicates with the messaging server by sending and receiving payloads.
Each payload is a JSON string that must contain a field named "type". The value of this field defines the type of the payload and what other fields can be expected in the JSON payload. 

## Server -> Client payloads
Below are the possible payload types that can be received by a client from the server:

**message_sent**

A message was sent by a user.

| field name | description                                                      | type           |
|------------|------------------------------------------------------------------|----------------|
| type       | Always "message_sent".                                           | string         |
| username   | Username of the user which sent the message or null if server.   | string \| null |
| message    | Message that was sent                                            | string         |
| timestamp  | Unix Timestamp when the message was posted.                      | number         |

**user_connected**

A user connected to the server.

| field name | description                             | type   |
|------------|-----------------------------------------|--------|
| type       | Always "user_connected".                | string |
| username   | Username of the user that connected.    | string |
| timestamp  | Unix Timestamp when the user connected. | number |

**user_disconnected**

A user disconnected from the server.

| field name | description                                | type   |
|------------|--------------------------------------------|--------|
| type       | Always "user_disconnected".                | string |
| username   | Username of the user that disconnected.    | string |
| timestamp  | Unix Timestamp when the user disconnected. | number |


**reply**

Special payload sent to a client after it sent a payload to either acknowledge the payload was processed successfully, or that an error occured.

| field name | description                                                                         | type           |
|------------|-------------------------------------------------------------------------------------|----------------|
| type       | Always "reply".                                                                     | string         |
| payload_id | Id corresponding to the payload_id sent by the client or null if payload_id missing | string \| null |
| error      | Error code if an error occurred processing the sent payload, or null if successful  | string \| null |

If an error occured the error field will contain an error code, below is a table of possible error codes.

| error code        | description                                                                                                                           |
|-------------------|---------------------------------------------------------------------------------------------------------------------------------------|
| malformed_payload | The payload sent by the client was malformed. Either it was not a valid JSON, or the JSON contained unexpected fields / field values. |


## Client -> Server payloads
All client payloads need to contain a payload_id field to identify the payload. The payload_id is a freeform string which is only required to be unique from all other payload_ids sent from the same client.

The server will always respond with a "reply" payload to any payload received. See "Server -> Client payloads" for a description of this payload.

Below are the possible payload types that can be received by a client from the server:

**send_message**

Send a message to other users on the server.
Upon receiving this payload all connected clients will receive the event as a "message_sent" payload.

| field name | description                             | type   |
|------------|-----------------------------------------|--------|
| type       | Always "send_message".                  | string |
| payload_id | Payload unique id. (See section header) | string |
| message    | The message to send                     | string |
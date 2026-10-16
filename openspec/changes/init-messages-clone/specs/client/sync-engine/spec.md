## Purpose
The Sync Engine capability manages bidirectional real-time communication between the client application and a self-hosted backend, handling message delivery, delivery/read receipts, typing indicators, presence, and reconnection with cursor recovery.

## ADDED Requirements

### Requirement: Real-Time Bidirectional WebSocket Protocol
The sync engine MUST establish and maintain a persistent WebSocket connection to the configured self-hosted server URL using JSON-RPC or structured event payloads for sending and receiving messages.

#### Scenario: Server connection and authentication
- **WHEN** the application opens with valid authentication credentials
- **THEN** a secure WebSocket connection is established and authenticated with the self-hosted backend.

### Requirement: Delivery and Read Receipts
The sync engine MUST transmit delivery receipts when incoming messages are processed, and read receipts when the active conversation transcript view renders the incoming messages.

#### Scenario: Sending read receipt
- **WHEN** the user views unread messages in the active conversation
- **THEN** the client sends a `read_receipt` event to the server with the latest message timestamp.

### Requirement: Typing Indicators and Presence
The sync engine MUST debounce and dispatch typing status events when the user inputs characters in the composer, and handle incoming typing events by triggering live animated typing bubble indicators on the sender's avatar.

#### Scenario: Displaying incoming typing indicator
- **WHEN** a typing event is received for an active conversation participant
- **THEN** an animated 3-dot typing bubble appears in the conversation row and transcript view.

### Requirement: Offline Reconnection and Sync Resumption
The sync engine MUST detect connection drops, perform exponential backoff reconnection, and request delta synchronization using the last stored message cursor upon reconnecting.

#### Scenario: Connection recovery
- **WHEN** network connectivity is restored after an outage
- **THEN** the client reconnects, sends its last synced cursor, and receives all missed messages without duplicate records.

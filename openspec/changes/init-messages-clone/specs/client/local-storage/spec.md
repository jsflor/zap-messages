## Purpose
The Local Storage capability provides offline-first persistent caching of conversations, messages, contacts, reactions, and synchronization metadata using an embedded pure-Go SQLite database engine.

## ADDED Requirements

### Requirement: Embedded SQLite Persistence
The application MUST initialize a local SQLite database in Write-Ahead Logging (WAL) mode using the pure-Go `modernc.org/sqlite` driver, storing tables for conversations, messages, participants, reactions, and sync cursors without requiring external C compiler dependencies.

#### Scenario: Database initialization
- **WHEN** the application starts up
- **THEN** it connects to the local database file, executes migrations if needed, and enables WAL mode and foreign key constraints.

### Requirement: Offline-First Message Querying and Caching
The application MUST query conversations and messages directly from local SQLite storage to provide instant cold-start rendering. Newly received or drafted messages MUST be saved locally prior to network transmission.

#### Scenario: Offline message drafting and queuing
- **WHEN** a message is sent while the client is disconnected from the server
- **THEN** the message is saved locally with status `pending_send` and queued for transmission upon network reconnection.

### Requirement: Full-Text Search
The local storage layer MUST support fast search indexing across message text and participant names.

#### Scenario: Search message history
- **WHEN** the user types a query into the sidebar search bar
- **THEN** matching conversations and messages are retrieved from the local store and returned within 100 milliseconds.

## Purpose
The UI Shell capability provides the visual presentation layer replicating the macOS Messages native user interface, responsive layout adaptation for mobile viewports, message transcript streaming, tapback reactions, and input controls.

## ADDED Requirements

### Requirement: Split View and Responsive Navigation
The client application MUST display a two-pane layout on desktop displays (width >= 768px) consisting of a resizable sidebar (260px–320px) and a main conversation transcript. On compact viewports (< 768px, including mobile devices), the application MUST display a stack navigation where selecting a conversation pushes the transcript view with a back navigation button.

#### Scenario: Desktop launch layout
- **WHEN** the application launches on a desktop window with standard dimensions (>= 880px width)
- **THEN** the sidebar and the active conversation transcript are displayed side-by-side.

#### Scenario: Mobile viewport adaptation
- **WHEN** the application runs on a mobile device or window width below 768px
- **THEN** only the conversation list is visible initially, and selecting a conversation transitions to a full-screen transcript view.

### Requirement: Conversation Sidebar Presentation
The sidebar MUST contain a search bar with filter affordances, a compose message button (`new-compose`), a pinned conversation grid showing circular avatars with unread badges, and a scrollable conversation list showing sender name, timestamp, message preview, and unread indicator dots (`#007AFF`).

#### Scenario: Unread indicator display
- **WHEN** a conversation has unread incoming messages
- **THEN** an 8px circular blue dot (`#007AFF`) is displayed on the left margin of the conversation row.

#### Scenario: Pinned conversation rendering
- **WHEN** a conversation is marked as pinned
- **THEN** it appears in the top pinned grid as a 64x64px circular avatar with name label beneath.

### Requirement: Message Bubble Transcript and Clustering
The transcript MUST cluster consecutive messages from the same sender with 2px vertical spacing and 12px spacing between different senders. Outgoing bubbles MUST be colored with Apple blue gradient (`#007AFF` to `#0062E0`) with white text and directional speech tail on the final message of the cluster. Incoming bubbles MUST be colored neutral gray (`#E9E9EB` light / `#26252A` dark) with speech tail oriented to the sender.

#### Scenario: Outgoing message bubble clustering
- **WHEN** the local user sends multiple messages consecutively within 2 minutes
- **THEN** the messages are visually clustered with 2px vertical spacing, and only the bottom bubble renders a directional tail.

#### Scenario: Tapback reaction rendering
- **WHEN** a participant adds a tapback reaction to a message
- **THEN** a floating pill containing the reaction emoji icon (❤️, 👍, 👎, 😂, ‼️, ❓) is rendered anchored to the top corner of the target bubble.

### Requirement: Message Composer Input Bar
The composer MUST present an expanding capsule input field with placeholder "iMessage", an action menu button (`+`), and an interactive action button that displays an audio recording microphone when empty and smoothly transforms into a circular blue arrow up button when text is present.

#### Scenario: Send button transformation
- **WHEN** the user inputs text into the composer
- **THEN** the send button changes from the microphone icon to the blue send arrow up button.

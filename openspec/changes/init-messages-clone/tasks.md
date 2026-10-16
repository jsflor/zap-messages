## 1. Project Scaffolding & Wails v3 Setup

- [ ] 1.1 Initialize Go module (`go mod init zap-messages`) and add Wails v3 dependencies (`github.com/wailsapp/wails/v3`).
- [ ] 1.2 Scaffold frontend directory with Vite, React 19, TypeScript, Tailwind CSS, and `@wailsio/runtime`.
- [ ] 1.3 Create `main.go` entry point with desktop window configuration (880x720px, minimum 640x480px, macOS titlebar styling).
- [ ] 1.4 Configure `Taskfile.yml` with build targets for desktop (`run`, `package`), iOS (`ios:run`), Android (`android:run`), and Web (`web:run`).

## 2. Local Storage Layer (SQLite)

- [ ] 2.1 Add `modernc.org/sqlite` pure-Go driver dependency.
- [ ] 2.2 Create database schema and migration runner in `app/storage/` (`conversations`, `messages`, `participants`, `reactions`, `sync_state`).
- [ ] 2.3 Implement conversation and message repository methods (CRUD, pagination, unread counts).
- [ ] 2.4 Add full-text search indexing and query methods for message history and contacts.

## 3. UI Design System (macOS Messages Clone)

- [ ] 3.1 Configure Tailwind CSS with macOS Messages color palette, SF Pro typography, and blur variables.
- [ ] 3.2 Build `Sidebar` component: search input with token filters, `new-compose` button, and layout split container.
- [ ] 3.3 Build `PinnedSection` component: 64x64px circular avatars, unread indicator badge, and animated typing indicator bubble.
- [ ] 3.4 Build `ConversationList` component: virtualized list with 48px avatar, contact name, timestamp, 2-line preview, and blue unread dot (`#007AFF`).
- [ ] 3.5 Build `Transcript` component: date separators, sender labels, message bubble clustering (2px intra-cluster, 12px inter-cluster).
- [ ] 3.6 Implement `MessageBubble` styling: outgoing blue gradient (`#007AFF` $\to$ `#0062E0`) with tail, incoming gray (`#E9E9EB` / `#26252A`), and delivery/read receipts.
- [ ] 3.7 Build `Tapback` reaction overlay and popover picker (❤️, 👍, 👎, 😂, ‼️, ❓).
- [ ] 3.8 Build `MessageInput` (Composer): expanding capsule textarea, attachment `+` button, and dynamic audio/send button transition.

## 4. Real-Time Sync & Go Service Bindings

- [ ] 4.1 Define Go `ChatService` with Wails bindings for frontend communication.
- [ ] 4.2 Implement WebSocket client in `app/sync/` for connecting to self-hosted server endpoints.
- [ ] 4.3 Implement real-time event dispatching: incoming message, delivery receipt, read receipt, typing indicator.
- [ ] 4.4 Implement offline queue and reconnect delta synchronization using stored message cursors.

## 5. Multi-Platform Adaptation & Packaging

- [ ] 5.1 Implement responsive layout hook: 2-pane split view on desktop/web $\leftrightarrow$ stack navigation on mobile viewports.
- [ ] 5.2 Add mobile build tags and safe-area inset handlers (`//go:build ios`, `//go:build android`).
- [ ] 5.3 Configure Wails v3 `application.PlatformServer` mode for standalone browser hosting.
- [ ] 5.4 Test build pipelines across macOS, Linux, Windows, iOS simulator, and Android emulator.

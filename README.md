# zap-messages

An open-source, self-hosted clone of Apple's macOS Messages application built with **[Wails v3](https://v3.wails.io/)** (Go + React 19 + TypeScript + Tailwind CSS).

Designed for pixel-accurate macOS aesthetics on desktop while responsively adapting to mobile devices and standard web browsers:
* **macOS, Linux, and Windows** (Native Desktop via WebKit / WebView2)
* **iOS and Android** (Mobile WebView host with Go CGo/NDK runtime)
* **Web** (Standalone headless server mode serving the SPA over HTTP/WebSocket)

---

## Features

* **macOS Native Aesthetic**: Translucent sidebar vibrancy (`backdrop-blur-xl`), custom titlebar with inline controls, and authentic Apple typography (`SF Pro`).
* **Message Clustering & Speech Tails**: Same-sender message grouping (2px spacing), directional speech tails on cluster ends, and Apple blue (`#007AFF`) vs. neutral gray bubbles.
* **Tapback Reactions**: Floating reaction picker and docked bubble pills (❤️, 👍, 👎, 😂, ‼️, ❓).
* **Pinned Conversations Grid**: 64x64px circular avatars with unread message badges and animated 3-dot typing indicators.
* **Offline-First SQLite**: Zero-configuration embedded SQLite database (`modernc.org/sqlite` pure-Go driver) with Write-Ahead Logging (WAL) and local full-text search.
* **Real-Time Sync**: Bidirectional WebSocket synchronization supporting delivery/read receipts, typing state, and offline delta recovery.
* **Adaptive Responsive UI**: Split 2-pane view on desktop/web; stack navigation on mobile viewports.

---

## Prerequisites

Ensure you have the following installed on your machine:
* **Go**: `1.25+` (run `go version` to check)
* **Node.js**: `20+` & **npm**
* **Task** (optional, recommended for convenient build commands):
  ```bash
  brew install go-task/tap/go-task
  ```

### Platform-Specific Prerequisites (Optional for Mobile/Linux)
* **macOS (Desktop)**: macOS 12+ (Xcode Command Line Tools installed).
* **Linux (Desktop)**: `libgtk-3-dev` and `libwebkit2gtk-4.1-dev`.
* **iOS (Mobile)**: macOS with full Xcode installed (for iOS Simulator / device deployment).
* **Android (Mobile)**: Android SDK, NDK (r26+), and JDK 17+.

---

## Setup & Installation

1. **Clone the repository and enter the directory**:
   ```bash
   cd zap-messages
   ```

2. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

3. **Verify Go dependencies**:
   ```bash
   go mod tidy
   ```

---

## Running Locally

### Option 1: Native Desktop Application (macOS, Windows, Linux)

Using `Taskfile.yml`:
```bash
task run
```

Or using standard Go / npm commands:
```bash
# 1. Build the frontend
cd frontend && npm run build && cd ..

# 2. Launch the native desktop window
go run .
```

### Option 2: Frontend Hot-Reload Development

For live UI styling with fast refresh:
```bash
cd frontend
npm run dev
```
Open `http://localhost:5173` in your browser.

### Option 3: Web Server Mode (Browser Access)

Run the backend as a standalone HTTP server without a desktop window:
```bash
task web:run
```
Or directly with Go:
```bash
cd frontend && npm run build && cd ..
go run -tags server .
```
Access the application in any web browser at **`http://localhost:8080`**.

### Option 4: Mobile Emulators (iOS / Android)

* **iOS Simulator** (macOS with full Xcode):
  ```bash
  task ios:run
  ```
* **Android Emulator** (Android SDK/NDK):
  ```bash
  task android:run
  ```

---

## Building for Production

To produce standalone release binaries:

```bash
# Package native desktop binary (placed in bin/Messages)
task package

# Package headless web server binary (placed in bin/messages-server)
task web:build

# Build iOS application bundle
task ios:build

# Build Android shared library (.so)
task android:build
```

---

## Project Structure

```
zap-messages/
├── AGENTS.md                  # Project architecture & REA inspection findings
├── Taskfile.yml               # Multi-platform build & run automation
├── main.go                    # Wails application entry point and window setup
├── app/
│   ├── chat/                  # Chat business logic & Wails frontend bindings
│   ├── storage/               # Pure-Go SQLite schema, migrations & repositories
│   ├── sync/                  # WebSocket real-time transport client & offline queue
│   └── platform/              # OS-specific handlers (desktop, iOS, Android)
├── frontend/
│   ├── src/
│   │   ├── components/        # Sidebar, PinnedSection, Transcript, MessageBubble, Composer
│   │   ├── hooks/             # Responsive layout & platform detection hooks
│   │   ├── types/             # Shared TypeScript schemas
│   │   └── App.tsx            # Main application shell
│   ├── package.json
│   └── vite.config.ts
└── openspec/                  # OpenSpec spec-driven development artifacts
```

---

## Testing

Run Go backend unit tests (covers SQLite repositories, unread counters, and search):
```bash
go test -v ./...
```

Run frontend build verification:
```bash
cd frontend && npm run build
```

---

## OpenSpec Workflow

This project adheres to **[OpenSpec](https://github.com/Fission-AI/OpenSpec)** for spec-driven development.
* Check specifications: `openspec list --specs`
* Inspect changes: `openspec list`
* Validate active change: `openspec validate <change-name>`

---

## License

Open source under the [MIT License](LICENSE).

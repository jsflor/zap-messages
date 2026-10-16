## Why

Users who appreciate Apple's macOS Messages design currently lack an open-source, self-hosted messaging alternative that can run across desktop operating systems (macOS, Windows, Linux) as well as mobile devices (iOS, Android) and the Web. Existing open-source chat applications either rely on heavyweight web-wrapper technologies or lack the distinctive visual fidelity, micro-interactions, and typography of native macOS software.

Using findings from a deep Reverse Engineering Anything (REA) inspection of macOS Messages (`/System/Applications/Messages.app`), `zap-messages` aims to build a high-fidelity clone of the Messages experience using **Wails v3** with an offline-first Go backend and a modern web frontend.

## What Changes

This change scaffolds and specifies the foundational client application architecture:
- **UI Shell**: macOS Messages visual clone including the 2-pane split layout (resizable vibrancy sidebar, pinned avatar grid, conversation list, clustered chat transcript, floating tapback reactions, and capsule composer input).
- **Local Storage Engine**: Offline-first SQLite database schema storing conversations, messages, participant metadata, and sync cursors without external C toolchain dependencies (pure-Go `modernc.org/sqlite`).
- **Real-Time Sync Engine**: Bidirectional WebSocket communication client for self-hosted server messaging, delivery/read receipts, typing indicators, and presence updates.
- **Cross-Platform Runtime (Wails v3)**: Native desktop window management (macOS, Windows, Linux), mobile host WebView integration (iOS via WKWebView / Android via WebView & NDK), and web server fallback mode.

## Capabilities

### New Capabilities
- `client/ui-shell`: Visual presentation layer matching macOS Messages Human Interface Guidelines, responsive for desktop split-view and mobile stack navigation.
- `client/local-storage`: Embedded SQLite persistent store for offline caching, fast search, message history, and conversation state.
- `client/sync-engine`: Bidirectional real-time sync layer over WebSockets connecting to a self-hosted backend.
- `client/platform-runtime`: Unified Wails v3 application lifecycle and native OS integration across macOS, Linux, Windows, iOS, Android, and Web.

### Modified Capabilities
<!-- None: Initial project scaffold -->

## Impact

- **New Codebase**: Initializes Go backend packages (`app/chat`, `app/storage`, `app/sync`, `app/platform`) and React frontend (`frontend/src`).
- **Dependencies**: Go modules for Wails v3 (`github.com/wailsapp/wails/v3`) and pure-Go SQLite (`modernc.org/sqlite`). Frontend packages: React 19, TypeScript, Tailwind CSS, Vite, Lucide Icons, and `@wailsio/runtime`.
- **Target OS Integration**: AppKit on macOS, GTK on Linux, Win32 on Windows, UIKit on iOS, Android Activity/NDK on Android.

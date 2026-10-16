# zap-messages — Agent Guide & Architecture

`zap-messages` is an open-source, self-hosted clone of Apple's macOS Messages app built with **Wails v3** (Go backend + Web frontend) targeting **macOS, Linux, Windows, iOS, Android, and Web**.

---

## 1. REA Inspection Findings: macOS Messages App

A deep inspection of `/System/Applications/Messages.app` using Reverse Engineering Anything (REA) revealed the following foundational architecture and UI specifications:

### 1.1 Binary Architecture & Frameworks
* **Runtime**: Mac Catalyst application (`platform: MACCATALYST`, built with SDK 26.6, bundle ID `com.apple.MobileSMS`, principal class `SMSApplication`).
* **Core Private Frameworks**:
  * **`ChatKit.framework`**: Manages the entire visual presentation layer — conversation list items, message transcript view, balloon rendering, attachments, sticker/app plugins, reactions (tapbacks), and composer input bar.
  * **`IMCore.framework`**: Manages underlying message transport, conversation models, participant identity, read receipts, delivery state, and typing indicators.
  * **`IMSharedUtilities.framework`**: Utilities for file transfers, media decoding, and Uniform Type Identifiers (UTIs).
  * **`MessagesAppKitBridge.bundle`**: Native AppKit bridge providing macOS title bar integrations, preferences dialogs (`CKPreferencesWindow.nib`, `CKPrefsGeneral.nib`, `CKPrefsAccounts.nib`), and dock badges.

### 1.2 Layout, Dimensions & Visual Tokens
* **Default Window Geometry**: `880px` width $\times$ `720px` height (`UILaunchPlacementParameters`).
* **Sidebar (Left Pane)**:
  * Width: `260px` to `320px` (resizable on desktop, translucent vibrancy blur `backdrop-blur-xl`).
  * Header: Search input with token filter pills + `new-compose` icon button (pencil in square vector, 30x30pt from `Assets.car`).
  * Pinned Section: 64x64px circular avatars arranged in a grid, showing participant names, unread indicator badges, and real-time typing indicator bubble overlays.
  * Conversation List:
    * Row height: ~72px.
    * Avatar: 48px circle (single contact) or multi-contact composite circle (group chat).
    * Unread Dot: 8px circular accent (`#007AFF`) on the left edge.
    * Typography: Primary contact name (SemiBold, 15px), message timestamp (right-aligned, Regular, 12px, secondary gray), 2-line truncated preview (Regular, 13px, secondary text).
* **Transcript (Right Pane)**:
  * Header: Centered 36px contact avatar, title with navigation chevron, call/FaceTime shortcuts, and info `(i)` button.
  * Date Separators: Centered timestamp labels (`.AppleSystemUIFont` 12px, `#8E8E93`).
  * Message Clustered Layout:
    * Same sender consecutive messages: 2px vertical spacing.
    * Different sender messages: 12px vertical spacing.
    * Sender name above cluster (group conversations only).
  * Message Bubbles:
    * Outgoing (Blue): Gradient `#007AFF` to `#0062E0`, 18px border radius, white text. Last message in cluster has the classic directional speech tail.
    * Incoming (Gray): `#E9E9EB` (Light mode) / `#26252A` (Dark mode), 18px border radius, `#000000` / `#FFFFFF` text. Last message has speech tail towards sender.
    * Delivery & Read Status: Text label below outgoing cluster ("Delivered", "Read 10:45 AM").
  * Tapback Reactions:
    * Floating pill docked to bubble corner with shadow and border.
    * Supported reactions: Heart (❤️), Thumbs Up (👍), Thumbs Down (👎), HaHa (😂), Exclamation (‼️), Question (❓).
  * Input Bar (Composer):
    * Action button (`+` icon for media, photos, attachments).
    * Expanding capsule input textarea (`placeholder="iMessage"`).
    * Action button: Audio recording microphone when empty $\to$ Blue circular up-arrow send button when non-empty.

---

## 2. Cross-Platform Target Strategy (Wails v3)

Wails v3 provides unified cross-platform support across desktop, mobile, and server:

| Target Platform | Runtime Technology | Output |
| :--- | :--- | :--- |
| **macOS** | WKWebView + AppKit Host | `.app` bundle |
| **Linux** | WebKitGTK Host | Native ELF executable |
| **Windows** | WebView2 Host | Native PE executable |
| **iOS** | WKWebView + UIKit Host (`CGO` bridge) | `.app` / `.ipa` |
| **Android** | Android WebView + `WebViewAssetLoader` (`libwails.so` via NDK) | `.apk` / `.aab` |
| **Web** | `application.PlatformServer` (Go HTTP/WebSocket server) | Browser SPA |

### 2.1 Platform Detection & Build Flags
* **Go Backend**:
  * Build tags:
    * Desktop: `//go:build desktop` or `darwin && !ios`, `linux && !android`, `windows`
    * iOS: `//go:build ios`
    * Android: `//go:build android`
  * Runtime checks: `application.System.IsMobile()`, `application.System.IsDesktop()`, `application.System.IsPlatform(...)`.
* **Frontend**:
  * Import from `@wailsio/runtime`: `System.IsMobile()`, `System.IsIOS()`, `System.IsAndroid()`, `System.IsDesktop()`.
  * Responsive layout: Split 2-pane view on Desktop/Web tablet; Stack navigation (`ConversationList` $\leftrightarrow$ `ChatView`) on Mobile.

---

## 3. Technology Stack & Directory Structure

```
zap-messages/
├── AGENTS.md                  # This specification and guide
├── Taskfile.yml               # Multi-platform build & run tasks
├── go.mod                     # Go module definitions
├── main.go                    # Wails application entry point
├── app/                       # Go backend services & bindings
│   ├── auth/                  # Authentication & session management
│   ├── chat/                  # Conversation & message service
│   ├── sync/                  # WebSocket / WebTransport real-time sync
│   └── storage/               # Local SQLite storage (modernc.org/sqlite)
├── build/                     # App icons, plists, mobile manifests
├── frontend/                  # Web Frontend (Vite + React 19 + TypeScript + Tailwind)
│   ├── src/
│   │   ├── components/        # Sidebar, Transcript, Bubbles, Tapbacks, Composer
│   │   ├── hooks/             # Platform, sync, and theme hooks
│   │   ├── services/          # Wails Go bindings & WebSocket client
│   │   └── types/             # Shared TypeScript schemas
│   └── index.html
└── openspec/                  # OpenSpec workflow specifications
    ├── config.yaml
    ├── specs/
    └── changes/
```

---

## 4. OpenSpec Development Workflow

This project uses [OpenSpec](https://github.com/Fission-AI/OpenSpec) for spec-driven development.

### 4.1 Workflow Rules
1. **Never implement major features without an approved OpenSpec change proposal.**
2. When creating a change:
   * Run or invoke `/openspec-propose` or `openspec change new <change-name>`.
   * Populate `proposal.md`, `tasks.md`, and delta specifications in `specs/`.
3. Keep changes incremental, testable, and reviewed before applying.
4. Update `AGENTS.md` whenever key architectural decisions or platform capabilities evolve.

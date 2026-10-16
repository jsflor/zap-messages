## Context

Based on the REA inspection of `/System/Applications/Messages.app`, macOS Messages is a Mac Catalyst application running `ChatKit` on top of `IMCore`. Its signature aesthetic relies on:
1. Vibrancy and backdrop blur (`NSVisualEffectView`).
2. Two-pane split view (sidebar 260–320px, transcript 560px+) with an 880x720px default placement.
3. Message bubbles clustered by sender with tailored corner radii (18px) and speech bubble tails.
4. Outgoing blue gradient (`#007AFF` to `#0062E0`) vs incoming light/dark neutral grays (`#E9E9EB` / `#26252A`).
5. Floating pill tapback reactions anchored to bubble edges.
6. Expanding capsule text input bar with reactive action buttons.

To achieve this while targeting macOS, Linux, Windows, iOS, Android, and Web in an open-source, self-hosted system, we need a cross-platform GUI architecture that does not compromise on rendering fidelity or native speed.

## Goals / Non-Goals

**Goals:**
- Provide a pixel-accurate visual replica of macOS Messages UI on desktop platforms (macOS, Linux, Windows).
- Provide an adaptive mobile UX for iOS and Android that collapses the split-view into standard navigation transitions (`ConversationList` $\to$ `ChatView`).
- Enable self-hosted connectivity via WebSockets to any compliant self-hosted chat backend (e.g. `zap-server`).
- Offline-first architecture using local SQLite storage for instant launch, conversation persistence, and message drafting.
- Single Go codebase for business logic and bindings across all platforms using Wails v3.

**Non-Goals:**
- Direct reverse engineering or emulation of Apple's proprietary closed iMessage encryption or Apple ID servers.
- SMS / cellular carrier SIM integration on desktop (SMS relay is out of scope for the initial release).
- Proprietary third-party iMessage App Store extensions.

## Decisions

### 1. Framework: Wails v3
- **Rationale**: Wails v3 is designed from the ground up for cross-platform desktop, mobile (iOS/Android), and web/server targets. It compiles native Go code with CGo/NDK for mobile and uses native WebViews (WebKit, WebView2, Android WebView), eliminating the heavy memory footprint of Electron.
- **Alternatives considered**:
  - *Tauri v2*: Rust-based. High performance, but Go backend was preferred for easy networking, standard concurrency, and self-hosted server code-sharing.
  - *Flutter*: Uses custom canvas rendering rather than native text and OS font rendering, often resulting in uncanny UI feel on desktop macOS.
  - *Electron*: No mobile support (iOS/Android) and excessive memory overhead.

### 2. Frontend: React 19 + Tailwind CSS + Lucide Icons
- **Rationale**: Tailwind CSS allows declaring exact HIG design tokens (radii, colors, shadows, gradients, and layout coordinates). React provides composable state management for complex transcript virtual scrolling and optimistic message updates.
- **Alternatives considered**:
  - *Svelte 5 / Vue 3*: Viable, but React has the widest ecosystem for virtualized lists (`@tanstack/react-virtual`) and gesture handling.

### 3. Local Storage: Pure-Go SQLite (`modernc.org/sqlite`)
- **Rationale**: CGo-free SQLite enables cross-compilation across multiple operating systems without configuring complex C cross-compilers for every architecture target.
- **Schema**: Tables for `conversations`, `messages`, `participants`, `reactions`, and `sync_state`.

### 4. Real-time Transport: WebSockets with JSON-RPC / Protobuf
- **Rationale**: Low latency, lightweight, and supported natively across desktop WebViews, mobile WebViews, and web browsers.

## Risks / Trade-offs

- **Risk: Wails v3 Mobile is in Beta**:
  - *Mitigation*: The core desktop targets (macOS, Windows, Linux) are stable. Mobile uses standard WKWebView on iOS and WebView on Android; platform-specific stubs (`//go:build ios`, `//go:build android`) keep the core architecture modular.
- **Risk: Window Vibrancy / Acrylic Across Linux and Windows**:
  - *Mitigation*: macOS supports native NSVisualEffectView vibrancy. For Linux and Windows, fallback to refined semi-transparent solid backgrounds (`rgba(30, 30, 30, 0.95)` / `rgba(246, 246, 246, 0.95)`) ensuring consistent contrast.

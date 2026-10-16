## Purpose
The Platform Runtime capability abstracts operating system lifecycle, window frame decorations, native menus, mobile insets, notifications, and platform-specific feature gating across macOS, Linux, Windows, iOS, Android, and Web using Wails v3.

## ADDED Requirements

### Requirement: Cross-Platform Desktop Window Management
The application MUST configure native window settings for desktop targets (macOS, Windows, Linux) with a default placement of 880x720px, minimum dimensions of 640x480px, and support for macOS titlebar transparency and vibrancy blur (`NSVisualEffectView`).

#### Scenario: Desktop window initialization
- **WHEN** the application launches on macOS
- **THEN** it creates a window with 880x720px dimensions, hidden titlebar style with inline traffic lights, and blurred sidebar backdrop.

### Requirement: Mobile Host Integration (iOS and Android)
The application MUST compile under `GOOS=ios` and `GOOS=android` in Wails v3, integrating with the native mobile host (WKWebView on iOS, Android WebView on Android) and respecting system safe-area insets.

#### Scenario: Mobile launch and safe areas
- **WHEN** the application runs on an iOS or Android device
- **THEN** it displays full screen, adheres to the top status bar and bottom navigation gesture safe-areas, and routes calls through the in-process bridge without opening loopback network ports.

### Requirement: Web Server Hosting Mode
The application MUST support compilation or execution in server mode (`application.PlatformServer`) where the Go backend serves the embedded frontend assets over HTTP and exposes WebSocket endpoints for standard browser clients.

#### Scenario: Web browser client access
- **WHEN** the application binary is launched with web server mode enabled
- **THEN** a remote web browser can connect, render the Messages web UI, and interact with the chat service over WebSocket.

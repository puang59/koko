## Tars

A minimal Tauri desktop app built with React, TypeScript, and Vite.

### Prerequisites
- **Node.js** 18+ and npm
- **Rust** toolchain (via [Rustup](https://www.rust-lang.org/tools/install))
- Tauri system deps (see [Tauri prerequisites](https://tauri.app/start/prerequisites/))

### Install
```bash
bun install
```

### Run (Desktop - Tauri)
```bash
bun run tauri dev
```

### Build (Web)
```bash
bun run build
bun run preview
```

### Build (Desktop - Tauri)
```bash
bun run tauri build
```

### Notes
- On first desktop run, macOS may prompt for permissions or block the app; allow it in System Settings if needed.
- If `cargo` is not found, install Rust with Rustup and reopen your terminal.

# xter-ui

A fullscreen sci-fi terminal desktop application (EDEX-UI clone MVP) built with Electron, React, TypeScript, and Tailwind CSS.

## Features Built
1. **Boot Sequence** - Animated startup screen with faux system checks.
2. **Main HUD Layout** - 3-column cyberpunk layout using CSS Grid.
3. **Real Terminal** - `xterm.js` and `node-pty` integration for actual system shell access (up to 3 tabs).
4. **System Monitor** - Live CPU, RAM, Network, and Process telemetry using `systeminformation`.
5. **File Browser** - Custom OS interface for exploring files and navigating paths.
6. **Top Bar** - Animated clock, hostname, and quick-access buttons.
7. **On-Screen Keyboard** - Simulated hardware keyboard interface.

## Tech Stack
- Electron (Node backend and IPC shell)
- React 18 + TS (Renderer)
- Vite (Bundler)
- xterm.js & node-pty
- systeminformation (Telemetry)
- electron-builder (Packager)
- Tailwind CSS

## Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- Depending on your OS, you may need native build tools for `node-pty`:
  - **Linux**: `make`, `python3`, `g++`
  - **Windows**: Visual Studio Build Tools, `python`
  - **Mac**: Xcode Command Line Tools

### Installation
1. Clone the environment or open the directory `xter-ui/`.
2. Install all dependencies:
   ```bash
   npm install
   ```

### Running Locally
To run the app in development mode:
```bash
npm run dev
```

### Building for Production
To package the app for your current operating system into an installer:
```bash
npm run build
```
Once complete, check the `release/` directory for the executable (AppImage, dmg, or nsis installer).

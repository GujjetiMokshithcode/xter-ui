# XTER-UI

A fullscreen sci-fi terminal desktop application (heavily inspired by eDEX-UI) built with **Electron**, **React**, **TypeScript**, and **CSS Grid**. 

The goal of this project is to provide a fully functional, cyberpunk-themed heads-up display (HUD) that monitors system performance, interacts with the local filesystem, and provides a real terminal emulator using `node-pty`.

---

## 🚀 Features

1. **3-Stage Boot Sequence**
   - Simulated hardware checks and initialization sequence.
   - Stage 1: Fast-scrolling raw hex/kernel logs.
   - Stage 2: Slow, deliberate system service mounting and verifications.
   - Stage 3: ASCII Art logo reveal with "ACCESS GRANTED" authentications before transitioning to the main UI.

2. **Main HUD Layout (CSS Grid)**
   - Hardcoded `100vw` / `100vh` strictly structural CSS Grid layout.
   - No flexbox-based master layouts; relies on `grid-template-areas` for precise panel sizing.
   - **Theme**: Strict "Hackerman" Green aesthetic (`#000000`, `#000a00`, `#051405` backgrounds with `#4aaa4a`, `#5aca5a` accents).
   - **Styling Rule**: Absolutely no `border-radius`, gradients, or box-shadows. Pure, sharp, utilitarian lines.

3. **Real Terminal Engine**
   - Integrates `xterm.js` and `xterm-addon-fit`.
   - Backend logic powered by `node-pty` for real system shell access natively routed via Electron IPC.
   - Tabbed interface supporting up to 5 concurrent sessions.

4. **Live System Telemetry**
   - Powered by `systeminformation`.
   - **Left Panel**: Multi-core CPU tracking with historical scrolling Canvas graphs, RAM dot-matrix occupancy rendering, Swap bars, and live top processes list.
   - **Right Panel**: Network traffic monitor with a rotating 3D wireframe Canvas globe and scrolling upload/download graphs.

5. **Hardware-Mapped On-Screen Keyboard**
   - Real-time visualization of physical hardware keystrokes mapped directly to the UI.
   - Bypasses terminal event swallowing by using `{ capture: true }` listeners.

6. **File Browser**
   - Navigates the local filesystem, mapping extensions to specific ASCII/Unicode icons.
   - Grid-based layout for dense information packaging.

---

## 🧠 For AI Context & Future Developers

This section serves as a technical context anchor for LLMs or developers continuing this project.

### 1. Project Structure
\`\`\`text
xter-ui/
├── electron/
│   ├── main.ts         # Main process: Window management & IPC handlers
│   └── preload.ts      # Exposes window.electronAPI context to the renderer
├── src/
│   ├── App.tsx         # Root layout container (CSS Grid orchestrator)
│   ├── main.tsx        # React entry point
│   ├── components/     # UI Panels (TopBar, LeftPanel, Terminal, RightPanel, Keyboard, FileBrowser, BootSequence)
│   └── styles/
│       └── hud.css     # Global variables and CSS Grid rules
└── package.json        # Build scripts and dependencies
\`\`\`

### 2. IPC Channels (Electron ↔ React)
The application strictly respects the Electron security model. The renderer never requires `fs` or `os` directly. Instead, `preload.ts` bridges them:
- **`systeminformation`**: Polled in `main.ts`, pushed to the UI via `window.electronAPI.sysinfo.onUpdate()`.
- **Terminal Management**: `window.electronAPI.terminal.start()`, `.input()`, and `.onOutput()` route keystrokes into `node-pty` and stream VT100 ANSI codes back to `xterm.js`.
- **Window Controls**: Minimize, Maximize, and Close events.

### 3. Styling Constraints
If you are an AI generating new UI components:
- **USE INLINE STYLES OR CSS CLASSES**: Tailwind is mostly abandoned in favor of explicit CSS and inline React styles.
- **NO ROUNDED CORNERS**: `border-radius: 0` is a hard rule across the entire application.
- **COLOR PALETTE**: Stick to the generated green schema.
  - Background panels: `#0a0f14` was mapped to `#051405`
  - Deep dark backgrounds: `#080c10` was mapped to `#000a00`
  - Text accents: `#2a5a2a`, `#5aca5a`, `#c9d1d9`.
  - Borders: `#0f3a0f` or `#0f4a0f` (`1px solid`).
- **CANVAS**: Extensive use of `<canvas>` elements for high-performance waveforms. Ensure `ResizeObserver` or explicit `width/height` attributes are maintained so graphs do not blur.

### 4. Component Behaviors
- `BootSequence.tsx`: Runs entirely detached from the rest of the application using localized `setTimeout` chains and CSS animations. 
- `Keyboard.tsx`: Does not actually type into the terminal; it acts purely as a visualizer. Physical keystroke mapping uses `KeyboardEvent.code` to maintain locale-agnostic bindings (e.g., `Space`, `KeyA`).
- `Terminal.tsx`: The terminal manages its own state via `xterm.js`. Custom resize logic explicitly calls `addons.fit()` when the layout grid resizes.

---

## 🛠 Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- Depending on your OS, you may need native build tools for `node-pty`:
  - **Linux**: `make`, `python3`, `g++`
  - **Windows**: Visual Studio Build Tools, `python`
  - **Mac**: Xcode Command Line Tools

### Installation
1. Clone the repository and navigate into the `xter-ui/` directory.
2. Install all dependencies:
   \`\`\`bash
   npm install
   \`\`\`

### Running Locally
Run the app in development mode using concurrent Vite and Electron loaders:
\`\`\`bash
npm run dev
\`\`\`

### Building for Production
To package the app for your current operating system into an installer (outputs to `dist/` or `release/`):
\`\`\`bash
npm run build
\`\`\`

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgPrimary: "var(--bg-primary)",
        bgPanel: "var(--bg-panel)",
        bgHover: "var(--bg-hover)",
        borderColor: "var(--border-color)",
        borderActive: "var(--border-active)",
        textPrimary: "var(--text-primary)",
        textDim: "var(--text-dim)",
        textAccent: "var(--text-accent)",
        textTerminal: "var(--text-terminal)",
        cursorColor: "var(--cursor-color)",
        greenOk: "var(--green-ok)",
        barFill: "var(--bar-fill)",
        barBg: "var(--bar-bg)",
        warning: "var(--warning)",
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Courier New"', "monospace"],
      }
    },
  },
  plugins: [],
}

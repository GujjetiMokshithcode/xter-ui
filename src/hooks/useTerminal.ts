import { useEffect, useRef } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'

export function useTerminal(id: string) {
  const containerRef = useRef<HTMLDivElement>(null)
  const termRef = useRef<Terminal | null>(null)
  const fitRef = useRef<FitAddon | null>(null)

  useEffect(() => {
    if (!containerRef.current || !window.electronAPI) return

    const term = new Terminal({
      theme: {
        background:    '#000000',
        foreground:    '#4aaa4a',
        cursor:        '#4aaa4a',
        cursorAccent:  '#000000',
        black:         '#000000',
        red:           '#7a2a2a',
        green:         '#3a7a3a',
        yellow:        '#7a6a1a',
        blue:          '#1a5a6a',
        magenta:       '#5a3a6a',
        cyan:          '#1a5a6a',
        white:         '#8aca8a',
        brightBlack:   '#1a3a1a',
        brightWhite:   '#aadaaa',
      },
      fontFamily: '"JetBrains Mono", "Courier New", monospace',
      fontSize: 13,
      cursorBlink: true
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(containerRef.current)
    fitAddon.fit()

    termRef.current = term
    fitRef.current = fitAddon

    // 1. Create native PTY
    window.electronAPI.terminal.create(id, term.cols, term.rows)

    // 2. Map PTY output -> UI
    const cleanupOutput = window.electronAPI.terminal.onOutput(id, (data) => {
      term.write(data)
    })

    // 3. Map UI input -> PTY
    const onDataDisposable = term.onData((data) => {
      window.electronAPI.terminal.input(id, data)
    })

    // 4. Handle resizing
    const handleResize = () => {
      fitAddon.fit()
      window.electronAPI.terminal.resize(id, term.cols, term.rows)
    }
    window.addEventListener('resize', handleResize)

    // Cleanup phase
    return () => {
      window.removeEventListener('resize', handleResize)
      cleanupOutput()
      onDataDisposable.dispose()
      window.electronAPI.terminal.kill(id)
      term.dispose()
    }
  }, [id])

  return { containerRef, termRef, fitRef }
}

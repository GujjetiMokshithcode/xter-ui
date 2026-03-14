import { useEffect, useRef, useState } from 'react'
import { Terminal as XTerm } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'

const TABS = [
  { id: 'term-1', label: 'MAIN SHELL' },
  { id: 'term-2', label: 'EMPTY' },
  { id: 'term-3', label: 'EMPTY' },
  { id: 'term-4', label: 'EMPTY' },
  { id: 'term-5', label: 'EMPTY' }
]

export default function Terminal() {
  const [activeTabId, setActiveTabId] = useState('term-1')
  const [cwd, setCwd] = useState('~')
  const [stamp, setStamp] = useState('')

  const containerRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const termsRef = useRef<{ [key: string]: { term: XTerm, fit: FitAddon } }>({})

  // Time & Ping loop
  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date()
      const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
      const day = days[d.getDay()]
      const date = d.getDate().toString().padStart(2, '0')
      const mo = months[d.getMonth()]
      const yr = d.getFullYear()
      const h = d.getHours().toString().padStart(2, '0')
      const m = d.getMinutes().toString().padStart(2, '0')
      const s = d.getSeconds().toString().padStart(2, '0')
      
      const ping = Math.floor(Math.random() * 20 + 20) // fake static ping for MVP
      setStamp(`${ping}ms  〈  ${day} ${date} ${mo} ${yr} ${h}:${m}:${s} UTC`)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Terminals spawn logic
  useEffect(() => {
    const initTerm = (id: string) => {
      if (termsRef.current[id]) return // already mounted
      const el = containerRefs.current[id]
      if (!el) return

      const term = new XTerm({
        theme: {
          background: 'var(--bg-panel)', 
          foreground: '#9ab4be',
          cursor: '#c9d1d9', 
          selectionBackground: '#1a3a4a',
          black: '#0d1117', red: '#8b3030', green: '#3a6b4a',
          yellow: '#7a6030', blue: '#2a4a7a', magenta: '#5a3a6a',
          cyan: '#2a5a72', white: '#c9d1d9', brightBlack: '#3a4a5a',
          brightWhite: '#d0dce4'
        },
        fontSize: 13,
        fontFamily: "'JetBrains Mono', monospace",
        lineHeight: 1.2,
        scrollback: 1000,
        cursorBlink: true
      })

      const fitAddon = new FitAddon()
      term.loadAddon(fitAddon)
      term.open(el)
      
      requestAnimationFrame(() => fitAddon.fit())

      term.onData(data => {
        if (window.electronAPI && window.electronAPI.terminal) {
          window.electronAPI.terminal.input(id, data)
        }
      })

      if (window.electronAPI && window.electronAPI.terminal) {
        window.electronAPI.terminal.create(id)
        window.electronAPI.terminal.onOutput(id, (data: string) => {
          term.write(data)

          // Naive CWD extraction
          if (data.includes('@') && data.includes(':')) {
            const parts = data.split(':')
            if (parts.length > 1) {
              const p = parts[1].split('$')[0].split('#')[0].trim()
              if (p) setCwd(p)
            }
          }
        })
      } else {
         term.writeln('Welcome to XTER-UI v2.0 - Electron Context Missing')
         term.writeln(`Terminal ID: ${id}`)
         term.write('\r\n$ ')
      }

      termsRef.current[id] = { term, fit: fitAddon }
    }

    initTerm(activeTabId)
  }, [activeTabId])

  // Fit addon resize 
  useEffect(() => {
    const active = termsRef.current[activeTabId]
    if (active) setTimeout(() => active.fit.fit(), 10)

    const rs = () => {
       Object.values(termsRef.current).forEach(t => t.fit.fit())
    }
    window.addEventListener('resize', rs)
    return () => window.removeEventListener('resize', rs)
  }, [activeTabId])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)',
      background: 'var(--bg-panel)'
    }}>
      <style>{`
        .term-tab {
          flex: 1;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          text-align: center;
          border-right: 1px solid var(--border);
          padding: 8px 0;
          cursor: pointer;
        }
        .term-tab.active {
          background: var(--bg-panel);
          color: #8ab4be;
          border-top: 2px solid var(--border-active);
        }
        .term-tab.inactive {
          background: var(--bg-deep);
          color: var(--text-dim);
          border-top: 2px solid transparent;
        }
      `}</style>

      {/* TABS */}
      <div style={{ display: 'flex', height: '32px' }}>
        {TABS.map(t => (
          <div
            key={t.id}
            className={`term-tab ${activeTabId === t.id ? 'active' : 'inactive'}`}
            onClick={() => setActiveTabId(t.id)}
          >
            {t.label}
          </div>
        ))}
      </div>

      {/* XTERM AREA */}
      <div style={{ flex: 1, overflow: 'hidden', padding: '10px 10px 0 10px', position: 'relative' }}>
         {TABS.map(t => (
           <div
             key={t.id}
             ref={el => { containerRefs.current[t.id] = el }}
             style={{
               width: '100%', height: '100%',
               display: activeTabId === t.id ? 'block' : 'none'
             }}
           />
         ))}
      </div>

      {/* BOTTOM BAR */}
      <div style={{
        height: '24px', background: 'var(--bg-deep)',
        borderTop: '1px solid var(--border)', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
        padding: '0 12px'
      }}>
        <span style={{ color: 'var(--border-active)', fontSize: '9px' }}>{cwd}</span>
        <span style={{ color: 'var(--text-dim)', fontSize: '9px' }}>{stamp}</span>
      </div>

    </div>
  )
}

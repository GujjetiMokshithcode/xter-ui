import { useEffect, useState, useRef } from 'react'

export default function Terminal() {
  const [activeTab, setActiveTab] = useState(0)
  const tabs = ['MAIN SHELL', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY']
  
  const termRef = useRef<HTMLDivElement>(null)
  const [cwd, setCwd] = useState('~')
  const [timeStr, setTimeStr] = useState('')

  useEffect(() => {
    // We update the bottom right timer roughly simulating the string
    const timer = setInterval(() => {
      const d = new Date()
      // e.g. "lun. 29 avril 2019 20:27:29 CEST"
      const pts = d.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' })
      setTimeStr(`381ms  〈  ${pts}`)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // In a real app we'd spawn multiple ptys and attach them to xterm instances
  // For this visual rebuild, we maintain the hook for terminal logic that already exists if possible
  // Or just mock it if we are keeping it simple. But the user said "xterm.js mounted here with theme:"
  // So let's integrate xterm here. Since Terminal.tsx already had complex logic, we'll recreate the layout and hook up xterm inside.
  
  useEffect(() => {
    import('xterm').then(({ Terminal: XTerm }) => {
      import('xterm-addon-fit').then(({ FitAddon }) => {
        if (!termRef.current) return;
        
        // Remove old child if any
        while(termRef.current.firstChild) {
          termRef.current.removeChild(termRef.current.firstChild);
        }

        const xterm = new XTerm({
          theme: {
            background: '#0a0f14',
            foreground: '#9ab4be',
            cursor: '#c9d1d9',
            selectionBackground: '#1a3a4a'
          },
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 13,
          lineHeight: 1.2,
          cursorBlink: true
        });

        const fitAddon = new FitAddon();
        xterm.loadAddon(fitAddon);
        xterm.open(termRef.current);
        fitAddon.fit();

        const resizeObserver = new ResizeObserver(() => {
          fitAddon.fit();
          if (window.electronAPI && window.electronAPI.terminal) {
            window.electronAPI.terminal.resize('main', xterm.cols, xterm.rows)
          }
        });
        resizeObserver.observe(termRef.current);

        if (window.electronAPI && window.electronAPI.terminal) {
          window.electronAPI.terminal.create('main', xterm.cols, xterm.rows)
          
          xterm.onData(data => {
            window.electronAPI.terminal.input('main', data)
          })
          
          window.electronAPI.terminal.onOutput('main', (data: string) => {
            xterm.write(data)
            // very naive cwd parsing for visual effect
            if (data.includes('@') && data.includes(':')) {
              const parts = data.split(':');
              if (parts.length > 1) {
                const pathPart = parts[1].split('$')[0].split('#')[0].trim();
                if (pathPart && pathPart.length > 0) setCwd(pathPart);
              }
            }
          })
        } else {
          xterm.writeln('Welcome to XTER-UI v2.2.0 - Electron')
          xterm.writeln('Terminal subsystem offline.')
          xterm.write('\r\n$ ')
        }

        return () => {
          resizeObserver.disconnect();
          xterm.dispose();
          if (window.electronAPI && window.electronAPI.terminal) {
            window.electronAPI.terminal.kill('main')
          }
        };
      });
    });
  }, [activeTab]); // simplistic reload on tab switch for this mockup

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <style>{`
        .term-tab {
          flex: 1;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          border-right: 1px solid #1a2a35;
          cursor: pointer;
          user-select: none;
        }
        .term-tab.inactive {
          background: #080c10;
          color: #2a5a6a;
        }
        .term-tab.active {
          background: #0a0f14;
          color: #8ab4be;
          border-top: 2px solid #2a6a7a;
        }
        .term-tab:last-child {
          border-right: none;
        }
      `}</style>

      {/* TABS */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1a2a35' }}>
        {tabs.map((tab, i) => (
          <div 
            key={i} 
            className={`term-tab ${activeTab === i ? 'active' : 'inactive'}`}
            onClick={() => setActiveTab(i)}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* XTERM */}
      <div style={{ flex: 1, overflow: 'hidden', padding: '10px' }}>
        <div ref={termRef} style={{ width: '100%', height: '100%' }}></div>
      </div>

      {/* BOTTOM STATUS BAR */}
      <div style={{ 
        height: '24px', borderTop: '1px solid #1a2a35', background: '#080c10',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 10px', fontSize: '9px'
      }}>
        <div style={{ color: '#2a6a7a' }}>{cwd}/eDEX-UI</div>
        <div style={{ color: '#2a5a6a' }}>{timeStr}</div>
      </div>
    </div>
  )
}

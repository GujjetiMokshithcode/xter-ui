import { useState, useEffect } from 'react'

export default function TopBar({ toggleKeyboard }: { toggleKeyboard: () => void }) {
  const [time, setTime] = useState<Date>(new Date())
  const [appInfo, setAppInfo] = useState<{ hostname: string, ip: string } | null>(null)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    
    // Fetch correct machine telemetry on load
    if (window.electronAPI) {
      window.electronAPI.app.getInfo().then(info => {
        setAppInfo({ hostname: info.hostname, ip: info.ip })
      })
    }

    return () => clearInterval(timer)
  }, [])

  const quit = () => {
    if (window.electronAPI) {
      window.electronAPI.app.quit()
    }
  }

  const timeStr = time.toLocaleTimeString('en-US', { hour12: false })
  const hostName = appInfo?.hostname || 'undefined'
  const ipAddr = appInfo?.ip || 'localhost'

  return (
    <div 
      className="flex justify-between items-center px-4 w-full select-none"
      style={{
        height: '28px',
        background: 'var(--bg-panel)',
        borderBottom: '1px solid var(--border-color)',
        fontFamily: 'monospace',
        fontSize: '11px',
        color: 'var(--text-dim)'
      }}
    >
      <div className="flex space-x-4 items-center h-full">
        <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>XTER-UI v1.0</span>
        <span>{hostName}</span>
        <span>{ipAddr}</span>
      </div>

      <div className="flex space-x-6 items-center">
        <span>{timeStr}</span>
        
        <button 
          onClick={toggleKeyboard}
          style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'var(--text-dim)' }}
          title="Toggle Keyboard"
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
        >
          [KBD]
        </button>

        <button 
          onClick={quit}
          style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'var(--text-accent)' }}
          title="System Shutdown"
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-accent)'}
        >
          ✕
        </button>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'

export default function TopBar() {
  const [sysInfo, setSysInfo] = useState({ hostname: '', ip: '' })

  useEffect(() => {
    if (window.electronAPI && window.electronAPI.app && window.electronAPI.app.getInfo) {
      window.electronAPI.app.getInfo().then((info: any) => {
        setSysInfo({ hostname: info.hostname, ip: info.ip })
      }).catch(console.error)
    }
  }, [])

  const quit = () => {
    if (window.electronAPI && window.electronAPI.app) {
      window.electronAPI.app.quit()
    }
  }

  return (
    <div style={{
      height: '22px',
      background: '#050810',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 12px',
      position: 'relative',
      boxSizing: 'border-box'
    }}>
      {/* LEFT SECTION */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '3px', textTransform: 'uppercase' }}>PANEL</span>
        <div style={{ width: '1px', height: '12px', background: 'var(--border)' }} />
        <span style={{ fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '3px', textTransform: 'uppercase' }}>SYSTEM</span>
      </div>

      {/* CENTER SECTION */}
      <div style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)'
      }}>
        <span style={{ fontSize: '9px', color: 'var(--border-active)', letterSpacing: '3px', textTransform: 'uppercase' }}>TERMINAL</span>
      </div>

      {/* RIGHT SECTION */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '9px', color: 'var(--border-active)', letterSpacing: '3px', textTransform: 'uppercase' }}>MAIN SHELL</span>
        <div style={{ width: '1px', height: '12px', background: 'var(--border)' }} />
        <span style={{ fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '3px', textTransform: 'uppercase' }}>PANEL</span>
        <div style={{ width: '1px', height: '12px', background: 'var(--border)' }} />
        <span style={{ fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '3px', textTransform: 'uppercase' }}>NETWORK</span>
        <div style={{ width: '1px', height: '12px', background: 'var(--border)' }} />
        <button
           onClick={quit}
           style={{
             fontSize: '9px',
             color: 'var(--text-dim)',
             border: 'none',
             background: 'transparent',
             cursor: 'pointer',
             padding: '0',
           }}
           className="topbar-btn"
        >
          ✕
        </button>
      </div>
      <style>{`
        .topbar-btn:hover {
          color: var(--text-primary) !important;
        }
      `}</style>
    </div>
  )
}

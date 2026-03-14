

export default function TopBar() {
  const quit = () => {
    if (window.electronAPI) {
      window.electronAPI.app.quit();
    }
  };

  return (
    <div style={{
      height: '22px',
      background: '#000800',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 10px',
      borderBottom: '1px solid #0f3a0f',
      userSelect: 'none'
    }}>
      <style>{`
        .topbar-section {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .topbar-text {
          font-size: 9px;
          letter-spacing: 3px;
          text-transform: uppercase;
        }
        .topbar-divider {
          border-left: 1px solid #0f3a0f;
          height: 14px;
          margin: 0 8px;
        }
      `}</style>

      <div className="topbar-section" style={{ justifyContent: 'flex-start', flex: 1 }}>
        <span className="topbar-text" style={{ color: '#0f5a0f' }}>PANEL</span>
        <span className="topbar-text" style={{ color: '#0f5a0f' }}>SYSTEM</span>
      </div>

      <div className="topbar-section" style={{ justifyContent: 'center', gap: 0, flex: 1 }}>
        <span className="topbar-text" style={{ color: '#1f8a1f' }}>TERMINAL</span>
      </div>

      <div className="topbar-section" style={{ justifyContent: 'flex-end', flex: 1 }}>
        <span className="topbar-text" style={{ color: '#1f8a1f' }}>MAIN SHELL</span>
        <div className="topbar-divider"></div>
        <span className="topbar-text" style={{ color: '#0f5a0f' }}>PANEL</span>
        <span className="topbar-text" style={{ color: '#0f5a0f' }}>NETWORK</span>
        <div className="topbar-divider"></div>
        <button 
          onClick={quit}
          style={{
            background: 'none', border: 'none', color: '#1f5a1f', fontSize: '10px',
            cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center'
          }}
        >✕</button>
      </div>
    </div>
  )
}

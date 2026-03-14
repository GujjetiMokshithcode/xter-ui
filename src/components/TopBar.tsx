

export default function TopBar() {
  const quit = () => {
    if (window.electronAPI) {
      window.electronAPI.app.quit();
    }
  };

  return (
    <div style={{
      height: '22px',
      background: '#050810',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 10px',
      borderBottom: '1px solid #1a2a35',
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
          border-left: 1px solid #1a2a35;
          height: 14px;
          margin: 0 8px;
        }
      `}</style>

      <div className="topbar-section" style={{ justifyContent: 'flex-start', flex: 1 }}>
        <span className="topbar-text" style={{ color: '#1a4a5a' }}>PANEL</span>
        <span className="topbar-text" style={{ color: '#1a4a5a' }}>SYSTEM</span>
      </div>

      <div className="topbar-section" style={{ justifyContent: 'center', gap: 0, flex: 1 }}>
        <span className="topbar-text" style={{ color: '#2a6a7a' }}>TERMINAL</span>
      </div>

      <div className="topbar-section" style={{ justifyContent: 'flex-end', flex: 1 }}>
        <span className="topbar-text" style={{ color: '#2a6a7a' }}>MAIN SHELL</span>
        <div className="topbar-divider"></div>
        <span className="topbar-text" style={{ color: '#1a4a5a' }}>PANEL</span>
        <span className="topbar-text" style={{ color: '#1a4a5a' }}>NETWORK</span>
        <div className="topbar-divider"></div>
        <button 
          onClick={quit}
          style={{
            background: 'none', border: 'none', color: '#2a4a5a', fontSize: '10px',
            cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center'
          }}
        >✕</button>
      </div>
    </div>
  )
}

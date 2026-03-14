import { useState } from 'react'
import BootSequence from './components/BootSequence'
import TopBar from './components/TopBar'
import Terminal from './components/Terminal'
import FileBrowser from './components/FileBrowser'
import LeftPanel from './components/LeftPanel'
import RightPanel from './components/RightPanel'
import Keyboard from './components/Keyboard'

export default function App() {
  const [booting, setBooting] = useState(true)

  return (
    <>
      <style>{`
        html, body, #root {
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: #000000;
          font-family: 'JetBrains Mono', monospace;
          margin: 0;
          padding: 0;
        }

        .app-grid {
          display: grid;
          width: 100vw;
          height: 100vh;
          grid-template-rows: 22px 1fr 260px;
          grid-template-columns: 245px 1fr 245px;
          grid-template-areas:
            "topbar    topbar    topbar"
            "left      terminal  right"
            "filesystem keyboard  keyboard";
          gap: 0;
          background: #000a00;
        }

        .app-grid > div {
          border: 1px solid #0f3a0f;
          background: #051405;
          border-radius: 0;
          box-sizing: border-box;
          overflow: hidden;
        }
        
        * {
          border-radius: 0 !important;
        }
        
        ::-webkit-scrollbar {
          width: 3px;
        }
        ::-webkit-scrollbar-track {
          background: #000a00;
        }
        ::-webkit-scrollbar-thumb {
          background: #0f4a0f;
        }
        
        .panel-header {
          font-size: 9px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #1f6a1f;
          padding: 5px 10px;
          border-bottom: 1px solid #0f3a0f;
          display: flex;
          justify-content: space-between;
        }
      `}</style>
      
      {booting && <BootSequence onComplete={() => setBooting(false)} />}
      
      {!booting && (
        <div className="app-grid">
          <div style={{ gridArea: 'topbar', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
             <TopBar />
          </div>

          <div style={{ gridArea: 'left', borderLeft: 'none', overflowY: 'auto' }}>
            <LeftPanel />
          </div>

          <div style={{ gridArea: 'terminal' }}>
             <Terminal />
          </div>

          <div style={{ gridArea: 'right', borderRight: 'none' }}>
            <RightPanel />
          </div>

          <div style={{ gridArea: 'filesystem', borderLeft: 'none', borderBottom: 'none' }}>
            <FileBrowser />
          </div>
          
          <div style={{ gridArea: 'keyboard', borderRight: 'none', borderBottom: 'none' }}>
            <Keyboard />
          </div>
        </div>
      )}
    </>
  )
}

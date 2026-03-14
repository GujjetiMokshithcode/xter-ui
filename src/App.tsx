import { useState } from 'react'
import BootSequence from './components/BootSequence'
import TopBar from './components/TopBar'
import Terminal from './components/Terminal'
import FileBrowser from './components/FileBrowser'
import LeftPanel from './components/LeftPanel'
import RightPanel from './components/RightPanel'
import Keyboard from './components/Keyboard'

import './styles/hud.css'

export default function App() {
  const [booting, setBooting] = useState(true)

  return (
    <>
      <style>{`
        .app-grid {
          display: grid;
          width: 100vw;
          height: 100vh;
          grid-template-rows: 22px 1fr 260px;
          grid-template-columns: 245px 1fr 245px;
          grid-template-areas:
            "topbar     topbar    topbar"
            "left       terminal  right"
            "filesystem keyboard  keyboard";
          gap: 0;
          background: var(--bg-deep);
        }

        .app-grid > div {
          background: var(--bg-panel);
        }
      `}</style>
      
      {booting && <BootSequence onComplete={() => setBooting(false)} />}
      
      {!booting && (
        <div className="app-grid">
          <div style={{ gridArea: 'topbar' }}>
             <TopBar />
          </div>

          <div style={{ gridArea: 'left' }}>
            <LeftPanel />
          </div>

          <div style={{ gridArea: 'terminal' }}>
             <Terminal />
          </div>

          <div style={{ gridArea: 'right' }}>
            <RightPanel />
          </div>

          <div style={{ gridArea: 'filesystem' }}>
            <FileBrowser />
          </div>
          
          <div style={{ gridArea: 'keyboard' }}>
            <Keyboard />
          </div>
        </div>
      )}
    </>
  )
}

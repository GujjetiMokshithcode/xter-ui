import { useState } from 'react'
import BootSequence from './components/BootSequence'
import TopBar from './components/TopBar'
import Terminal from './components/Terminal'
import FileBrowser from './components/FileBrowser'
import SysStats from './components/SysStats'
import Keyboard from './components/Keyboard'
import './styles/hud.css'

export default function App() {
  const [booting, setBooting] = useState(true)
  const [oskVisible, setOskVisible] = useState(false)

  const handleKeyPress = (char: string) => {
    window.dispatchEvent(new CustomEvent('osk-input', { detail: char }))
  }

  return (
    <>
      {booting && <BootSequence onComplete={() => setBooting(false)} />}
      
      {!booting && (
        <div style={{
          display: 'grid',
          gridTemplateRows: '28px 1fr',
          gridTemplateColumns: '220px 1fr 240px',
          width: '100vw',
          height: '100vh',
          background: '#0d1117',
          overflow: 'hidden'
        }}>
          <div style={{ gridColumn: '1 / -1' }}>
             <TopBar toggleKeyboard={() => setOskVisible(!oskVisible)} />
          </div>

          <div className="flex flex-col h-full border-r border-[#1e3a4a]">
            <div className="flex-1 overflow-hidden border-b border-[#1e3a4a]">
              <SysStats />
            </div>
            <div className="flex-1 overflow-hidden">
              <FileBrowser />
            </div>
          </div>

          <div className="h-full overflow-hidden border-r border-[#1e3a4a]">
             <Terminal />
          </div>

          <div className="h-full overflow-hidden">
            {/* Will replace the placeholder with the precise stats stacking soon */}
            <div className="h-full w-full bg-[#0a0f14] flex items-center justify-center text-[#4a6a7a] text-xs">
              Waiting for Right Panel Redesign...
            </div>
          </div>
          
          <Keyboard visible={oskVisible} onKeyPress={handleKeyPress} />
        </div>
      )}
    </>
  )
}

import { useState, useEffect } from 'react'
import { useTerminal } from '../hooks/useTerminal'

interface Tab {
  id: string
  name: string
}

function TerminalInstance({ id, isActive }: { id: string, isActive: boolean }) {
  const { containerRef, termRef, fitRef } = useTerminal(id)

  useEffect(() => {
    if (isActive && fitRef.current && termRef.current) {
      // Re-fit in case window resized while this was hidden
      try {
        fitRef.current.fit()
        if (window.electronAPI) {
          window.electronAPI.terminal.resize(id, termRef.current.cols, termRef.current.rows)
        }
      } catch (e) {}
    }
  }, [isActive, id])

  return (
    <div 
      className="absolute inset-x-1 inset-y-2 overflow-hidden"
      style={{
        zIndex: isActive ? 10 : 0,
        opacity: isActive ? 1 : 0,
        pointerEvents: isActive ? 'auto' : 'none'
      }}
      ref={containerRef}
    />
  )
}

export default function Terminal() {
  const [tabs, setTabs] = useState<Tab[]>([{ id: 'tab-1', name: 'TERM 1' }])
  const [activeTab, setActiveTab] = useState<string>('tab-1')
  
  // Connect On-Screen Keyboard input to active tab
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (window.electronAPI) {
        window.electronAPI.terminal.input(activeTab, customEvent.detail)
      }
    }
    window.addEventListener('osk-input', handler)
    return () => window.removeEventListener('osk-input', handler)
  }, [activeTab])
  
  const addTab = () => {
    if (tabs.length >= 3) return
    const newId = `tab-${Date.now()}`
    setTabs([...tabs, { id: newId, name: `TERM ${tabs.length + 1}` }])
    setActiveTab(newId)
  }
  
  const removeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (tabs.length === 1) return
    const newTabs = tabs.filter(t => t.id !== id)
    setTabs(newTabs)
    if (activeTab === id) {
      setActiveTab(newTabs[0].id)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] select-none relative">
      <div 
        className="flex shrink-0 border-b border-[var(--border-color)]"
        style={{ height: '24px', background: 'var(--bg-panel)', fontSize: '11px' }}
      >
        {tabs.map(tab => {
          const isActive = activeTab === tab.id
          
          return (
            <div 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center px-4 border-r border-[var(--border-color)] cursor-pointer"
              style={{
                background: isActive ? 'var(--bg-hover)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-dim)',
                borderTop: isActive ? '1px solid var(--border-active)' : '1px solid transparent',
              }}
            >
              <span>{tab.name}</span>
              {tabs.length > 1 && (
                 <span 
                   className="ml-3 hover:text-[var(--warning)]"
                   onClick={(e) => removeTab(tab.id, e)}
                 >
                   ✕
                 </span>
               )}
            </div>
          )
        })}
        {tabs.length < 3 && (
          <div 
            onClick={addTab}
            className="flex items-center px-3 cursor-pointer hover:bg-[var(--bg-hover)]"
            style={{ color: 'var(--text-dim)' }}
          >
            +
          </div>
        )}
      </div>
      
      <div className="flex-1 w-full relative bg-[var(--bg-panel)] overflow-hidden">
        {tabs.map(tab => (
           <TerminalInstance key={tab.id} id={tab.id} isActive={activeTab === tab.id} />
        ))}
      </div>
    </div>
  )
}

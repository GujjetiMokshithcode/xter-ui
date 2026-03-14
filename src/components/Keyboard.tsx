import { useState } from 'react'

export default function Keyboard({ onKeyPress, visible }: { onKeyPress: (key: string) => void, visible: boolean }) {
  const [activeKey, setActiveKey] = useState<string | null>(null)

  if (!visible) return null

  const rows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'"],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/'],
    ['SPACE', 'ENTER', 'BACKSPACE']
  ]

  const handleKeyClick = (key: string) => {
    setActiveKey(key)
    setTimeout(() => setActiveKey(null), 100)

    let output = key
    if (key === 'SPACE') output = ' '
    if (key === 'ENTER') output = '\r'
    if (key === 'BACKSPACE') output = '\x7f'
    
    if (key.length === 1 && /[A-Z]/.test(key)) {
      output = output.toLowerCase()
    }

    onKeyPress(output)
  }

  return (
    <div 
      className="absolute bottom-4 left-1/2 -translate-x-1/2 w-2/3 max-w-4xl p-4 z-40"
      style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-color)',
      }}
    >
      <div 
        className="text-center mb-2 uppercase"
        style={{ fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '2px' }}
      >
        // ON-SCREEN INPUT SYSTEM
      </div>
      
      <div className="flex flex-col space-y-2 select-none">
        {rows.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center space-x-2">
            {row.map(key => {
              const isActive = activeKey === key
              let paddingClass = 'px-4 py-3'
              if (key === 'SPACE') paddingClass = 'px-16 py-3'
              if (key === 'ENTER') paddingClass = 'px-8 py-3'
              if (key === 'BACKSPACE') paddingClass = 'px-4 py-3'

              return (
                <button
                  key={key}
                  onClick={() => handleKeyClick(key)}
                  className={paddingClass}
                  style={{
                    border: '1px solid var(--border-color)',
                    background: isActive ? 'var(--text-dim)' : 'var(--bg-primary)',
                    color: isActive ? 'var(--bg-primary)' : 'var(--text-primary)',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    transition: 'background 150ms, color 150ms',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)'}}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--bg-primary)'}}
                >
                  {key}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

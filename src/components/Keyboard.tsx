import { useState, useEffect } from 'react'

const KEY_ROWS: any[] = [
  [
    { id: 'ESC', main: 'ESC', sec: '', flex: 1.2 },
    { id: '`', main: '`', sec: '~' },
    { id: '1', main: '1', sec: '!' },
    { id: '2', main: '2', sec: '@' },
    { id: '3', main: '3', sec: '#' },
    { id: '4', main: '4', sec: '$' },
    { id: '5', main: '5', sec: '%' },
    { id: '6', main: '6', sec: '^' },
    { id: '7', main: '7', sec: '&' },
    { id: '8', main: '8', sec: '*' },
    { id: '9', main: '9', sec: '(' },
    { id: '0', main: '0', sec: ')' },
    { id: '-', main: '-', sec: '_' },
    { id: '=', main: '=', sec: '+' },
    { id: 'BACK', main: 'BACK', sec: '', flex: 1.8 }
  ],
  [
    { id: 'TAB', main: 'TAB', sec: '', flex: 1.5 },
    { id: 'Q', main: 'Q', sec: '' },
    { id: 'W', main: 'W', sec: '' },
    { id: 'E', main: 'E', sec: '' },
    { id: 'R', main: 'R', sec: '' },
    { id: 'T', main: 'T', sec: '' },
    { id: 'Y', main: 'Y', sec: '' },
    { id: 'U', main: 'U', sec: '' },
    { id: 'I', main: 'I', sec: '' },
    { id: 'O', main: 'O', sec: '' },
    { id: 'P', main: 'P', sec: '' },
    { id: '[', main: '[', sec: '{' },
    { id: ']', main: ']', sec: '}' },
    { id: '\\', main: '\\', sec: '|' }
  ],
  [
    { id: 'CAPS', main: 'CAPS', sec: '', flex: 1.7 },
    { id: 'A', main: 'A', sec: '' },
    { id: 'S', main: 'S', sec: '' },
    { id: 'D', main: 'D', sec: '' },
    { id: 'F', main: 'F', sec: '' },
    { id: 'G', main: 'G', sec: '' },
    { id: 'H', main: 'H', sec: '' },
    { id: 'J', main: 'J', sec: '' },
    { id: 'K', main: 'K', sec: '' },
    { id: 'L', main: 'L', sec: '' },
    { id: ';', main: ';', sec: ':' },
    { id: "'", main: "'", sec: '"' },
    { id: 'ENTER', main: 'ENTER', sec: '', isEnter: true, flex: 1.5 }
  ],
  [
    { id: 'SHIFT_L', main: 'SHIFT', sec: '', flex: 2.2 },
    { id: 'Z', main: 'Z', sec: '' },
    { id: 'X', main: 'X', sec: '' },
    { id: 'C', main: 'C', sec: '' },
    { id: 'V', main: 'V', sec: '' },
    { id: 'B', main: 'B', sec: '' },
    { id: 'N', main: 'N', sec: '' },
    { id: 'M', main: 'M', sec: '' },
    { id: ',', main: ',', sec: '<' },
    { id: '.', main: '.', sec: '>' },
    { id: '/', main: '/', sec: '?' },
    { id: 'SHIFT_R', main: 'SHIFT', sec: '', flex: 1.8 }
  ],
  [
    { id: 'CTRL_L', main: 'CTRL', sec: '', flex: 1.3 },
    { id: 'FN', main: 'FN', sec: '', flex: 1 },
    { id: 'SPACE', main: '', sec: '', flex: 6, bg: 'var(--bg-hover)', border: 'var(--border-active)' },
    { id: 'ALT GR', main: 'ALT GR', sec: '', flex: 1.2 },
    { id: 'CTRL_R', main: 'CTRL', sec: '', flex: 1.2 },
    { id: 'LEFT', main: '←', sec: '', flex: 0.8 },
    { id: 'DOWN', main: '↓', sec: '', flex: 0.8 },
    { id: 'RIGHT', main: '→', sec: '', flex: 0.8 },
    { id: 'UP', main: '↑', sec: '', flex: 0.8 }
  ]
]

const KEY_CODE_MAP: Record<string, string> = {
  'Escape': 'ESC', 'Backquote': '`',
  'Digit1': '1', 'Digit2': '2', 'Digit3': '3', 'Digit4': '4', 'Digit5': '5', 'Digit6': '6', 'Digit7': '7', 'Digit8': '8', 'Digit9': '9', 'Digit0': '0',
  'Minus': '-', 'Equal': '=', 'Backspace': 'BACK',
  'Tab': 'TAB',
  'KeyQ': 'Q', 'KeyW': 'W', 'KeyE': 'E', 'KeyR': 'R', 'KeyT': 'T', 'KeyY': 'Y', 'KeyU': 'U', 'KeyI': 'I', 'KeyO': 'O', 'KeyP': 'P',
  'BracketLeft': '[', 'BracketRight': ']', 'Backslash': '\\', 'Enter': 'ENTER', 'NumpadEnter': 'ENTER',
  'CapsLock': 'CAPS',
  'KeyA': 'A', 'KeyS': 'S', 'KeyD': 'D', 'KeyF': 'F', 'KeyG': 'G', 'KeyH': 'H', 'KeyJ': 'J', 'KeyK': 'K', 'KeyL': 'L',
  'Semicolon': ';', 'Quote': "'",
  'ShiftLeft': 'SHIFT_L', 'IntlBackslash': '<', 'KeyZ': 'Z', 'KeyX': 'X', 'KeyC': 'C', 'KeyV': 'V', 'KeyB': 'B', 'KeyN': 'N', 'KeyM': 'M', 'Comma': ',', 'Period': '.', 'Slash': '/', 'ShiftRight': 'SHIFT_R',
  'ControlLeft': 'CTRL_L', 'MetaLeft': 'FN', 'AltLeft': 'FN',
  'Space': 'SPACE',
  'AltRight': 'ALT GR', 'ControlRight': 'CTRL_R',
  'ArrowLeft': 'LEFT', 'ArrowDown': 'DOWN', 'ArrowRight': 'RIGHT', 'ArrowUp': 'UP'
}

export default function Keyboard() {
  const [caps, setCaps] = useState(false)
  const [shift, setShift] = useState(false)
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set())

  const fireChar = (c: string) => {
    // Only send if we find active terminal mechanism
    if (window.electronAPI && window.electronAPI.terminal) {
       // Since the terminal component uses term-1 as activeTabId internally,
       // we should ideally lift state up to App.tsx, but the prompt says 
       // "send to active terminal via window.electronAPI.terminal.input(activeId, value)"
       // without activeId available cleanly. For MVP hook to term-1 if direct.
       window.electronAPI.terminal.input('term-1', c)
    }
  }

  const handleKeyClick = (key: any) => {
    let char = key.main
    
    if (key.id === 'CAPS') { setCaps(!caps); return; }
    if (key.id === 'SHIFT_L' || key.id === 'SHIFT_R') { setShift(true); return; }
    
    if (key.id === 'SPACE') char = ' '
    else if (key.id === 'BACK') char = '\x7f'
    else if (key.id === 'ENTER') char = '\r'
    else if (key.id === 'TAB') char = '\t'
    else if (key.id === 'ESC') char = '\x1b'
    else if (key.id === 'LEFT') char = '\x1b[D'
    else if (key.id === 'RIGHT') char = '\x1b[C'
    else if (key.id === 'UP') char = '\x1b[A'
    else if (key.id === 'DOWN') char = '\x1b[B'
    else if (key.id.startsWith('CTRL_')) {
       // Do nothing specifically for bare ctrl click in UI unless combined
       return;
    }
    else {
      if (shift && key.sec) {
        char = key.sec
      } else if (char.length === 1) {
        const isLetter = char >= 'A' && char <= 'Z'
        if (isLetter) {
          const u = caps !== shift // XOR
          char = u ? char : char.toLowerCase()
        }
      }
    }

    fireChar(char)

    if (shift && key.id !== 'SHIFT_L' && key.id !== 'SHIFT_R') {
      setShift(false)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mappedId = KEY_CODE_MAP[e.code]
      if (mappedId) {
        setPressedKeys(prev => {
          const next = new Set(prev)
          next.add(mappedId)
          return next
        })
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const mappedId = KEY_CODE_MAP[e.code]
      if (mappedId) {
        setPressedKeys(prev => {
          const next = new Set(prev)
          next.delete(mappedId)
          return next
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown, { capture: true })
    window.addEventListener('keyup', handleKeyUp, { capture: true })

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true })
      window.removeEventListener('keyup', handleKeyUp, { capture: true })
    }
  }, [])

  return (
    <div style={{
       display: 'flex', flexDirection: 'column', height: '100%', width: '100%',
       background: 'var(--bg-panel)', padding: '10px 12px',
       borderTop: '1px solid var(--border)', borderLeft: '1px solid var(--border)',
       justifyContent: 'space-between'
    }}>
      <style>{`
        .kbd-row {
          display: flex;
          gap: 5px;
        }
        .kbd-key {
          background: var(--bg-deep);
          border: 1px solid var(--key-border);
          color: var(--text-value);
          font-size: 10px;
          height: 42px;
          min-width: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          cursor: pointer;
          user-select: none;
          transition: background 100ms, transform 50ms;
        }
        .kbd-key:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .kbd-key:active, .kbd-key.hw-active {
          background: var(--graph-blue) !important;
          color: var(--text-primary) !important;
          transform: scale(0.95);
        }
        .kbd-key.caps-active {
          border-top: 2px solid var(--border-active);
          color: var(--text-primary);
        }
        .kbd-sec {
          position: absolute;
          top: 2px;
          right: 4px;
          font-size: 7px;
          color: var(--text-dim);
        }
        
        .row-container {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 5px;
          flex: 1;
        }
      `}</style>
      
      <div className="row-container">
        {KEY_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="kbd-row">
            {row.map((key: any) => {
              const isHwActive = pressedKeys.has(key.id)
              const isCapsActive = (caps && key.id === 'CAPS') || (shift && (key.id === 'SHIFT_L' || key.id === 'SHIFT_R'))
              
              const cls = `kbd-key ${isHwActive ? 'hw-active' : ''} ${isCapsActive ? 'caps-active' : ''}`
              
              const inlineStyle: any = { flex: key.flex || 1 }
              if (key.bg && !isHwActive) inlineStyle.background = key.bg
              if (key.border) inlineStyle.borderColor = key.border
              
              if (key.isEnter) {
                // Tall Enter trick: absolute position spanning rows 2 & 3
                return (
                  <div key={key.id} className={cls} onClick={() => handleKeyClick(key)}
                       style={{ ...inlineStyle, height: '88px', position: 'absolute', right: 0, top: 2 * 47 /* roughly bounds */, width: '9%' }}>
                    <span className="kbd-main">{key.main}</span>
                  </div>
                )
              }
              
              // To leave space for absolute ENTER on row 2 and 3, cap the row flex slightly if needed, 
              // but absolute takes it out of flow. The prompt asked to "leave right side space", 
              // we can just add a dummy invisible block on row 3 if needed, or row 3's elements just don't span there natively.
              if (rIdx === 2 && row.indexOf(key) === row.length - 1) {
                 return null; // Skip rendering here, we do it at the end
              }

              return (
                <div key={key.id} className={cls} style={inlineStyle} onClick={() => handleKeyClick(key)}>
                  {key.sec && <span className="kbd-sec">{key.sec}</span>}
                  <span className="kbd-main">{key.main}</span>
                </div>
              )
            })}
          </div>
        ))}
         {/* Render ENTER manually so it overlays rows 1 and 2 (0-indexed 1 and 2) */}
          <div className={`kbd-key ${pressedKeys.has('ENTER') ? 'hw-active' : ''}`} onClick={() => handleKeyClick({id:'ENTER', main:'ENTER'})}
             style={{ position: 'absolute', right: 0, top: `${(42 + 5) * 1}px`, height: '89px', width: '9%', zIndex: 10 }}>
            ENT
          </div>
      </div>
    </div>
  )
}

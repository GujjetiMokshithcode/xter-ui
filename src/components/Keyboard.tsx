import { useState, useEffect } from 'react'

const KEY_ROWS: any[] = [
  [
    { id: 'ESC', main: 'ESC', sec: '', flex: 1.5 },
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
    { id: 'BACK', main: 'BACK', sec: '', flex: 2 }
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
    { id: 'ENTER', main: 'ENTER', sec: '', isEnter: true }
  ],
  [
    { id: 'CAPS', main: 'CAPS', sec: '', flex: 2 },
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
    { id: '\\', main: '\\', sec: '|' },
  ],
  [
    { id: 'SHIFT_L', main: 'SHIFT', sec: '', flex: 2.5 },
    { id: '<', main: '<', sec: '' },
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
    { id: 'SHIFT_R', main: 'SHIFT', sec: '', flex: 2 }
  ],
  [
    { id: 'CTRL_L', main: 'CTRL', sec: '', flex: 1.5 },
    { id: 'FN', main: 'FN', sec: '', flex: 1.5 },
    { id: 'SPACE', main: '', sec: '', flex: 6, bg: '#001500', border: '#1f6a1f' },
    { id: 'ALT GR', main: 'ALT GR', sec: '', flex: 1.5 },
    { id: 'CTRL_R', main: 'CTRL', sec: '', flex: 1.5 },
    { id: 'LEFT', main: '⬅', sec: '' },
    { id: 'DOWN', main: '⬇', sec: '' },
    { id: 'RIGHT', main: '➡', sec: '' },
    { id: 'UP', main: '⬆', sec: '' }
  ]
]

const KEY_CODE_MAP: Record<string, string> = {
  'Escape': 'ESC',
  'Backquote': '`',
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
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set())

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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', background: '#051405', borderLeft: '1px solid #0f3a0f' }}>
      <style>{`
        .kbd-row {
          display: flex;
          gap: 6px;
          padding: 6px 10px;
          justify-content: center;
        }
        .kbd-key {
          background: #000a00;
          border: 1px solid #144a14;
          color: #2a8a2a;
          font-size: 10px;
          height: 42px;
          min-width: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          user-select: none;
          transition: all 0.05s ease;
        }
        .kbd-key.active {
          background: #0f4a0f !important;
          color: #c9d1d9 !important;
          transform: scale(0.95);
        }
        .kbd-sec {
          position: absolute;
          top: 2px;
          right: 4px;
          font-size: 7px;
          color: #1f5a1f;
        }
        .kbd-main {
          margin-top: 0;
        }
        .enter-key {
          position: absolute;
          right: 10px;
          width: 86px;
          height: 90px;
          z-index: 10;
        }
      `}</style>
      
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {KEY_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="kbd-row" style={{ paddingRight: rIdx === 1 || rIdx === 2 ? '106px' : '10px' }}>
            {row.map((key: any) => {
              const isActive = pressedKeys.has(key.id)
              
              if (key.isEnter) {
                return (
                  <div key={key.id} className={`kbd-key enter-key ${isActive ? 'active' : ''}`}>
                    <span className="kbd-main">{key.main}</span>
                  </div>
                )
              }
              
              const inlineStyle: any = { flex: key.flex || 1 }
              if (key.bg && !isActive) inlineStyle.background = key.bg
              if (key.border) inlineStyle.borderColor = key.border

              return (
                <div key={key.id} className={`kbd-key ${isActive ? 'active' : ''}`} style={inlineStyle}>
                  {key.sec && <span className="kbd-sec">{key.sec}</span>}
                  <span className="kbd-main">{key.main}</span>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

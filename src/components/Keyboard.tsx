import { useState } from 'react'

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
    // Enter key empty space since it spans rows
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
    { id: 'SPACE', main: '', sec: '', flex: 6, bg: '#0d1520', border: '#2a5a6a' },
    { id: 'ALT GR', main: 'ALT GR', sec: '', flex: 1.5 },
    { id: 'CTRL_R', main: 'CTRL', sec: '', flex: 1.5 },
    { id: 'LEFT', main: '⬅', sec: '' },
    { id: 'DOWN', main: '⬇', sec: '' },
    { id: 'RIGHT', main: '➡', sec: '' },
    { id: 'UP', main: '⬆', sec: '' }
  ]
]

export default function Keyboard() {
  const [caps, setCaps] = useState(false)
  const [shift, setShift] = useState(false)

  const handleKeyClick = (key: any) => {
    let char = key.main
    
    if (key.id === 'CAPS') { setCaps(!caps); return; }
    if (key.id === 'SHIFT_L' || key.id === 'SHIFT_R') { setShift(true); return; }
    
    // special replacements
    if (key.id === 'SPACE') char = ' '
    else if (key.id === 'BACK') char = '\x7f'
    else if (key.id === 'ENTER') char = '\r'
    else if (key.id === 'TAB') char = '\t'
    else if (key.id === 'ESC') char = '\x1b'
    else if (key.id === 'LEFT') char = '\x1b[D'
    else if (key.id === 'RIGHT') char = '\x1b[C'
    else if (key.id === 'UP') char = '\x1b[A'
    else if (key.id === 'DOWN') char = '\x1b[B'
    else {
      // Normal char logic
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

    if (window.electronAPI) {
      window.electronAPI.terminal.input('main', char)
    }

    // Reset shift if used
    if (shift && key.id !== 'SHIFT_L' && key.id !== 'SHIFT_R') {
      setShift(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', background: '#0a0f14', borderLeft: '1px solid #1a2a35' }}>
      <style>{`
        .kbd-row {
          display: flex;
          gap: 6px;
          padding: 6px 10px;
          justify-content: center;
        }
        .kbd-key {
          background: #080c10;
          border: 1px solid #1e3a4a;
          color: #4a7a8a;
          font-size: 10px;
          height: 42px;
          min-width: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          user-select: none;
        }
        .kbd-key:hover {
          background: #0d1520;
          color: #8ab4be;
        }
        .kbd-key:active {
          background: #1a3a4a;
          color: #c9d1d9;
        }
        .kbd-sec {
          position: absolute;
          top: 2px;
          right: 4px;
          font-size: 7px;
          color: #2a4a5a;
        }
        .kbd-main {
          margin-top: ${/* If there's a sec label, shift main down a bit */ '0'};
        }
        
        /* The magical ENTER key span trick via negative margin hack, 
           or we can just use position absolute/relative. CSS Grid is better but we use flex rows. 
           Let's use absolute positioning relative to the container for the enter key to span cleanly 
           in a flex layout, or just a negative margin on the row below?
           Wait, simple way: width fixed, height 90px, float right, or position absolute inside its wrapper.
        */
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
              if (key.isEnter) {
                return (
                  <div key={key.id} className="kbd-key enter-key" onClick={() => handleKeyClick(key)}>
                    <span className="kbd-main">{key.main}</span>
                  </div>
                )
              }
              
              const isCapsActive = caps && key.id === 'CAPS'
              const isShiftActive = shift && (key.id === 'SHIFT_L' || key.id === 'SHIFT_R')
              
              const inlineStyle: any = { flex: key.flex || 1 }
              if (key.bg) inlineStyle.background = key.bg
              if (key.border) inlineStyle.borderColor = key.border
              if (isCapsActive || isShiftActive) {
                inlineStyle.background = '#1a3a4a'
                inlineStyle.color = '#c9d1d9'
              }

              return (
                <div key={key.id} className="kbd-key" style={inlineStyle} onClick={() => handleKeyClick(key)}>
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

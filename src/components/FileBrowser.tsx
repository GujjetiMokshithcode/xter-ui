import { useEffect, useRef, useState } from 'react'

type FsItem = { name: string, isDir: boolean, path?: string }

const MOCK_ITEMS: FsItem[] = [
  { name: 'bin', isDir: true },
  { name: 'boot', isDir: true },
  { name: 'dev', isDir: true },
  { name: 'etc', isDir: true },
  { name: 'home', isDir: true },
  { name: 'lib', isDir: true },
  { name: 'opt', isDir: true },
  { name: 'root', isDir: true },
  { name: 'sys', isDir: true },
  { name: 'usr', isDir: true },
  { name: 'var', isDir: true },
  { name: 'keyboards', isDir: true },
  { name: 'themes', isDir: true },
  { name: 'settings.json', isDir: false },
  { name: 'config.sys', isDir: false },
  { name: 'swapfile', isDir: false },
]

const IconCanvas = ({ item }: { item: FsItem | string }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // special pinned items
    if (typeof item === 'string') {
       if (item === 'disks') {
         ctx.font = '24px sans-serif'
         ctx.fillStyle = 'var(--text-value)'
         ctx.textAlign = 'center'
         ctx.textBaseline = 'middle'
         ctx.fillText('⊞', 16, 16)
       } else if (item === 'up') {
         ctx.font = '24px sans-serif'
         ctx.fillStyle = 'var(--text-value)'
         ctx.textAlign = 'center'
         ctx.textBaseline = 'middle'
         ctx.fillText('⬑', 16, 16)
       }
       return
    }

    if (item.name === 'keyboards') {
      ctx.font = '20px sans-serif'
      ctx.fillStyle = 'var(--text-value)'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('⌨', 16, 16)
      return
    }
    if (item.name === 'themes') {
      ctx.font = '20px sans-serif'
      ctx.fillStyle = 'var(--text-value)'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('◈', 16, 16)
      return
    }
    if (item.name.includes('settings')) {
      ctx.font = '20px sans-serif'
      ctx.fillStyle = 'var(--text-value)'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('⚙', 16, 16)
      return
    }

    if (item.isDir) {
      // FOLDER: top tab + rect body
      ctx.strokeStyle = '#2a6a7a'
      ctx.lineWidth = 1.5
      ctx.fillStyle = 'rgba(26,90,90,0.15)'
      
      ctx.beginPath()
      ctx.moveTo(2, 8)
      ctx.lineTo(12, 8)
      ctx.lineTo(16, 13)
      ctx.lineTo(30, 13)
      ctx.lineTo(30, 28)
      ctx.lineTo(2, 28)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    } else {
      // FILE: rect with folded corner
      ctx.strokeStyle = '#1a5a6a'
      ctx.lineWidth = 1
      ctx.fillStyle = 'rgba(20,60,80,0.1)'
      
      ctx.beginPath()
      ctx.moveTo(6, 4)
      ctx.lineTo(20, 4)
      ctx.lineTo(26, 10)
      ctx.lineTo(26, 28)
      ctx.lineTo(6, 28)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      
      // fold line
      ctx.beginPath()
      ctx.moveTo(20, 4)
      ctx.lineTo(20, 10)
      ctx.lineTo(26, 10)
      ctx.stroke()
    }

  }, [item])

  return <canvas ref={canvasRef} width={32} height={32} style={{ display: 'block', margin: '0 auto' }} />
}


export default function FileBrowser() {
  const [cwd, setCwd] = useState('/')
  const [items, setItems] = useState<FsItem[]>([])
  const [diskUse, setDiskUse] = useState({ used: 0, total: 100, pct: 0, mount: '/' })

  useEffect(() => {
    // If we had IPC fs.readdir, we'd fire here. 
    // Fallback to mock for UI demonstration.
    setItems(MOCK_ITEMS)
  }, [cwd])

  useEffect(() => {
    if (window.electronAPI && window.electronAPI.sysinfo) {
      const unsub = window.electronAPI.sysinfo.onUpdate((data: any) => {
        if (data.fsSize && data.fsSize.length > 0) {
           const main = data.fsSize[0]
           setDiskUse({
             used: main.used || 0,
             total: main.size || 100,
             pct: main.use || 0,
             mount: main.mount || '/'
           })
        }
      })
      return unsub
    }
  }, [])

  return (
    <div style={{
       width: '245px', height: '100%',
       borderRight: '1px solid var(--border)', borderTop: 'none',
       display: 'flex', flexDirection: 'column',
       background: 'var(--bg-panel)'
    }}>
      <style>{`
        .fs-cell {
           width: 44px;
           cursor: pointer;
           padding: 4px 2px;
        }
        .fs-cell:hover {
           background: var(--bg-hover);
        }
        .fs-name {
           font-size: 9px;
           color: #6a8a9a;
           max-width: 42px;
           overflow: hidden;
           text-overflow: ellipsis;
           white-space: nowrap;
           text-align: center;
           margin-top: 4px;
           margin-left: auto;
           margin-right: auto;
        }
      `}</style>
      
      {/* HEADER BAR */}
      <div style={{
         height: '24px', background: 'var(--bg-deep)',
         borderBottom: '1px solid var(--border)', padding: '0 10px',
         display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
         <span style={{ fontSize: '9px', color: 'var(--text-dim)', letterSpacing: '3px', textTransform: 'uppercase' }}>FILESYSTEM</span>
         <span style={{ fontSize: '9px', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100px', textAlign: 'right' }}>
           {cwd}
         </span>
      </div>

      {/* ICON GRID */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', alignContent: 'start' }}>
         <div className="fs-cell">
            <IconCanvas item="disks" />
            <div className="fs-name">Disks</div>
         </div>
         <div className="fs-cell" onClick={() => setCwd('/')}>
            <IconCanvas item="up" />
            <div className="fs-name">Up</div>
         </div>
         
         {items.map((it, idx) => (
           <div key={idx} className="fs-cell" onClick={() => it.isDir && setCwd(cwd === '/' ? `/${it.name}` : `${cwd}/${it.name}`)}>
             <IconCanvas item={it} />
             <div className="fs-name">{it.name}</div>
           </div>
         ))}
      </div>

      {/* BOTTOM STATUS BAR */}
      <div style={{
         height: '22px', background: '#050810',
         borderTop: '1px solid var(--border)', padding: '0 10px',
         display: 'flex', alignItems: 'center', gap: '8px'
      }}>
         <span style={{ fontSize: '9px', color: 'var(--text-dim)' }}>
           Mount {diskUse.mount} used {diskUse.pct.toFixed(0)}%
         </span>
         <div style={{ flex: 1, height: '3px', background: 'var(--bg-hover)' }}>
           <div style={{ height: '100%', width: `${diskUse.pct}%`, background: '#1a4a3a' }} />
         </div>
      </div>

    </div>
  )
}

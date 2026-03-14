import { useEffect, useState, useRef } from 'react'

export default function LeftPanel() {
  const [time, setTime] = useState<Date>(new Date())
  const [uptime, setUptime] = useState(0)
  const [platform, setPlatform] = useState('linux')
  
  const [sysStats, setSysStats] = useState<any>({
    cpu: 0,
    ram: { used: 0, total: 1, percent: 0 },
    network: { rx: 0, tx: 0 },
    processes: []
  })

  // CPU Waveform graph data
  const [cpuHistory1, setCpuHistory1] = useState<number[]>(Array(100).fill(0))
  const [cpuHistory2, setCpuHistory2] = useState<number[]>(Array(100).fill(0))
  
  const canvasRef1 = useRef<HTMLCanvasElement>(null)
  const canvasRef2 = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    const upTimer = setInterval(() => setUptime(prev => prev + 1), 1000)
    
    if (window.electronAPI) {
      window.electronAPI.app.getInfo().then((info: any) => {
        setPlatform(info.platform)
      })
      
      const unsubscribe = window.electronAPI.sysinfo.onUpdate((data: any) => {
        setSysStats(data)
        
        // Split CPU load mock into 2 graphs
        const r = Math.random() * 10 - 5
        const load1 = Math.max(0, Math.min(100, data.cpu + r))
        const load2 = Math.max(0, Math.min(100, data.cpu - r))
        
        setCpuHistory1(prev => [...prev.slice(1), load1])
        setCpuHistory2(prev => [...prev.slice(1), load2])
      })
      return () => {
        clearInterval(timer)
        clearInterval(upTimer)
        unsubscribe()
      }
    }
    return () => {
      clearInterval(timer)
      clearInterval(upTimer)
    }
  }, [])

  useEffect(() => {
    const drawGraph = (canvasRef: React.RefObject<HTMLCanvasElement | null>, history: number[]) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#000a00'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      ctx.beginPath()
      ctx.strokeStyle = '#1f8a1f'
      ctx.lineWidth = 1
      
      const sliceWidth = canvas.width / (history.length - 1)
      let x = 0
      
      for (let i = 0; i < history.length; i++) {
        const val = history[i]
        const y = canvas.height - (val / 100) * canvas.height
        
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
        x += sliceWidth
      }
      ctx.stroke()
    }
    drawGraph(canvasRef1, cpuHistory1)
    drawGraph(canvasRef2, cpuHistory2)
  }, [cpuHistory1, cpuHistory2])

  const timeStr = time.toLocaleTimeString('en-US', { hour12: false })
  const month = time.toLocaleString('default', { month: 'short' }).toUpperCase()
  const day = time.getDate()
  const year = time.getFullYear()
  
  const formatUptime = (sec: number) => {
    const h = Math.floor(sec / 3600).toString().padStart(2, '0')
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0')
    const s = Math.floor(sec % 60).toString().padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  const renderMemoryGrid = () => {
    const totalSquares = 16 * 12; // 192
    const percent = sysStats.ram.percent || 0;
    const filledCount = Math.floor((percent / 100) * totalSquares);
    const squares = [];
    for (let i = 0; i < totalSquares; i++) {
      squares.push(
        <div key={i} style={{
          width: '3px', height: '3px',
          background: i < filledCount ? '#0f7a0f' : '#001a00'
        }}></div>
      );
    }
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(16, 4px)',
        gap: '1px',
        padding: '6px 10px'
      }}>
        {squares}
      </div>
    );
  }

  const avgCpu1 = Math.round(cpuHistory1[cpuHistory1.length - 1] || 0)
  const avgCpu2 = Math.round(cpuHistory2[cpuHistory2.length - 1] || 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '245px', color: '#4aaa4a' }}>
      <style>{`
        .left-sec { border-bottom: 1px solid #0f3a0f; }
        .tiny-label { font-size: 9px; color: #1f6a1f; }
        .tiny-val { font-size: 9px; color: #4aaa4a; }
        .flex-row { display: flex; flex-direction: row; }
        .flex-col { display: flex; flex-direction: column; }
      `}</style>
      
      {/* 1. CLOCK */}
      <div className="left-sec flex-col" style={{ height: '70px', padding: '10px', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ fontSize: '36px', color: '#c9d1d9', letterSpacing: '2px', fontWeight: 300 }}>
          {timeStr}
        </div>
      </div>

      {/* 2. DATE + SYS INFO */}
      <div className="left-sec flex-col" style={{ height: '55px', padding: '6px 10px', gap: '4px' }}>
        <div className="flex-row" style={{ gap: '12px' }}>
          <div><span className="tiny-label">YEAR: </span><span className="tiny-val">{year}</span></div>
          <div><span className="tiny-label">UPTIME: </span><span className="tiny-val">{formatUptime(uptime)}</span></div>
        </div>
        <div className="flex-row" style={{ gap: '12px' }}>
          <div><span className="tiny-val" style={{color: '#c9d1d9'}}>{month} {day}</span></div>
          <div><span className="tiny-label">TYPE: </span><span className="tiny-val uppercase">{platform}</span></div>
          <div><span className="tiny-label">POWER: </span><span className="tiny-val">AC</span></div>
        </div>
      </div>

      {/* 3. HARDWARE INFO */}
      <div className="left-sec flex-col" style={{ height: '40px', padding: '6px 10px', gap: '2px' }}>
        <div className="flex-row justify-between"><span className="tiny-label">MANUFACTURER</span><span className="tiny-val">ASUSTeK COMPUTER</span></div>
        <div className="flex-row justify-between"><span className="tiny-label">MODEL</span><span className="tiny-val">G551JK</span></div>
        <div className="flex-row justify-between"><span className="tiny-label">CHASSIS</span><span className="tiny-val">NOTEBOOK</span></div>
      </div>

      {/* 4. CPU USAGE */}
      <div className="left-sec flex-col">
        <div className="panel-header flex-row justify-between">
          <span>CPU USAGE</span>
          <span style={{textTransform: 'none'}}>Intel® Core™ i5-4200H</span>
        </div>
        <div style={{ padding: '6px 10px', gap: '6px', display: 'flex', flexDirection: 'column' }}>
          <div className="flex-row" style={{ gap: '6px', alignItems: 'center' }}>
            <div className="flex-col" style={{ width: '45px' }}>
              <span className="tiny-label">#1 - 2</span>
              <span className="tiny-label">Avg. {avgCpu1}%</span>
            </div>
            <canvas ref={canvasRef1} width={170} height={35}></canvas>
          </div>
          <div className="flex-row" style={{ gap: '6px', alignItems: 'center' }}>
            <div className="flex-col" style={{ width: '45px' }}>
              <span className="tiny-label">#3 - 4</span>
              <span className="tiny-label">Avg. {avgCpu2}%</span>
            </div>
            <canvas ref={canvasRef2} width={170} height={35}></canvas>
          </div>
        </div>
      </div>

      {/* 5. CPU TEMP + TASKS */}
      <div className="left-sec flex-row justify-between" style={{ height: '35px', padding: '6px 10px', alignItems: 'center' }}>
        <div className="flex-col items-center"><span className="tiny-label">TEMP</span><span className="tiny-val">62°C</span></div>
        <div className="flex-col items-center"><span className="tiny-label">MIN</span><span className="tiny-val">2.04GHz</span></div>
        <div className="flex-col items-center"><span className="tiny-label">MAX</span><span className="tiny-val">3.00GHz</span></div>
        <div className="flex-col items-center"><span className="tiny-label">TASKS</span><span className="tiny-val">{sysStats.processes ? sysStats.processes.length * 51 : 257}</span></div>
      </div>

      {/* 6. MEMORY */}
      <div className="left-sec flex-col">
        <div className="panel-header flex-row justify-between">
          <span>MEMORY</span>
          <span>USING {(sysStats.ram.used / 1e9).toFixed(1)} OUT OF {(sysStats.ram.total / 1e9).toFixed(1)} GiB</span>
        </div>
        {renderMemoryGrid()}
      </div>

      {/* 7. SWAP BAR */}
      <div className="left-sec flex-row justify-between items-center" style={{ padding: '6px 10px' }}>
        <span className="tiny-label">SWAP</span>
        <div style={{ flex: 1, margin: '0 8px', height: '3px', background: '#001a00', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '15%', background: '#0f5a0f' }}></div>
        </div>
        <span className="tiny-val">0.2 GiB</span>
      </div>

      {/* 8. TOP PROCESSES */}
      <div className="left-sec flex-col" style={{ borderBottom: 'none' }}>
        <div className="panel-header" style={{ borderBottom: 'none' }}>
          TOP PROCESSES <span style={{ float: 'right' }}>PID | NAME | CPU | MEM</span>
        </div>
        <div className="flex-col" style={{ padding: '0 10px 10px 10px' }}>
          {sysStats.processes && sysStats.processes.map((p: any, i: number) => (
            <div key={i} className="flex-row" style={{ 
              fontSize: '9px', color: '#3a8a3a', cursor: 'default', padding: '2px 0' 
            }} onMouseEnter={e => e.currentTarget.style.background = '#001a00'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ width: '40px' }}>{Math.floor(Math.random() * 9000 + 1000)}</div>
              <div style={{ width: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
              <div style={{ width: '40px', textAlign: 'right' }}>{p.cpu.toFixed(1)}%</div>
              <div style={{ width: '30px', textAlign: 'right' }}>{p.mem.toFixed(1)}%</div>
            </div>
          ))}
          {!sysStats.processes || sysStats.processes.length === 0 && Array(5).fill(0).map((_,i) => (
            <div key={i} className="flex-row" style={{ fontSize: '9px', color: '#3a8a3a', padding: '2px 0' }}>
              <div style={{ width: '40px' }}>----</div>
              <div style={{ width: '90px' }}>-------</div>
              <div style={{ width: '40px', textAlign: 'right' }}>-.--%</div>
              <div style={{ width: '30px', textAlign: 'right' }}>-.--%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

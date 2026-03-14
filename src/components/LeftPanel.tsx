import { useEffect, useState, useRef } from 'react'

const Header = ({ left, right }: { left: string, right?: string }) => (
  <div style={{
    fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase',
    color: 'var(--text-dim)', padding: '5px 10px',
    borderBottom: '1px solid var(--border)', background: 'var(--bg-deep)',
    display: 'flex', justifyContent: 'space-between' /* if no right, it just has left */
  }}>
    <span>{left}</span>
    {right && <span style={{ color: 'var(--text-muted)' }}>{right}</span>}
  </div>
)

const Col = ({ label, value }: { label: string, value: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
    <span style={{ fontSize: '9px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>{label}</span>
    <span style={{ fontSize: '9px', color: 'var(--text-value)' }}>{value}</span>
  </div>
)

const formatTime = (date: Date) => {
  return [
    date.getHours().toString().padStart(2, '0'),
    date.getMinutes().toString().padStart(2, '0'),
    date.getSeconds().toString().padStart(2, '0')
  ].join(':')
}

export default function LeftPanel() {
  const [time, setTime] = useState(new Date())
  const [uptimeStr, setUptimeStr] = useState('00:00:00')
  
  const [osType, setOsType] = useState('LINUX')
  const [power, setPower] = useState('AC')
  
  const [hw, setHw] = useState({ manufacturer: 'UNKNOWN', model: 'UNKNOWN', chassis: 'DESKTOP' })
  const [cpuModel, setCpuModel] = useState('CPU')
  const [temp, setTemp] = useState('0')
  const [minMax, setMinMax] = useState({ min: '0.00', max: '0.00' })
  const [tasks, setTasks] = useState('0')
  
  const [ram, setRam] = useState({ used: 0, total: 1 })
  const [swap, setSwap] = useState({ used: 0, total: 1 })
  
  const [procs, setProcs] = useState<any[]>([])
  
  const [cpu1, setCpu1] = useState(0)
  const [cpu2, setCpu2] = useState(0)

  const canvas1Ref = useRef<HTMLCanvasElement | null>(null)
  const canvas2Ref = useRef<HTMLCanvasElement | null>(null)
  
  // Historical data for graphs (100 points)
  const [hist1, setHist1] = useState<number[]>(Array(100).fill(0))
  const [hist2, setHist2] = useState<number[]>(Array(100).fill(0))

  useEffect(() => {
    // Basic clock
    const startObj = new Date()
    const timer = setInterval(() => {
      const now = new Date()
      setTime(now)
      
      // simplistic uptime since app mounted (or we could fetch from os)
      const diffS = Math.floor((now.getTime() - startObj.getTime()) / 1000)
      const h = Math.floor(diffS / 3600).toString().padStart(2, '0')
      const m = Math.floor((diffS % 3600) / 60).toString().padStart(2, '0')
      const s = Math.floor(diffS % 60).toString().padStart(2, '0')
      setUptimeStr(`${h}:${m}:${s}`)
    }, 1000)
    
    // Initial static info
    if (window.electronAPI && window.electronAPI.app && window.electronAPI.app.getInfo) {
      window.electronAPI.app.getInfo().then((info: any) => {
        setOsType(info.platform?.toUpperCase() || 'UNKNOWN')
      }).catch(console.error)
    }

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Telemetry updates
    if (window.electronAPI && window.electronAPI.sysinfo && window.electronAPI.sysinfo.onUpdate) {
      const unsubscribe = window.electronAPI.sysinfo.onUpdate((data: any) => {
        if (!data) return
        
        // System / Hardware (we can fake or use data if sent)
        if (data.system) {
          setHw({
            manufacturer: data.system.manufacturer || 'INTEL',
            model: data.system.model || 'CORE I9',
            chassis: 'DESKTOP'
          })
        }

        if (data.cpu) {
          setCpuModel(data.cpu.brand?.substring(0, 15) || 'UNKNOWN CPU')
          setMinMax({
            min: data.cpu.speedMin ? data.cpu.speedMin.toFixed(2) : '0.00',
            max: data.cpu.speedMax ? data.cpu.speedMax.toFixed(2) : '0.00'
          })
        }
        
        if (data.cpuCurrentSpeed && data.cpuCurrentSpeed.cores) {
           // We map core speeds to percentage visually, or if we have cpuData.currentLoad
           // Let's use data.cpuCurrentSpeed.avg * some scaling if load lacks, 
           // but sysinfo actually sends currentLoad.cpus usually.
        }
        
        if (data.currentLoad) {
           const cpus = data.currentLoad.cpus || []
           const load1 = cpus[0]?.load || 0
           const load2 = cpus[1]?.load || 0
           setCpu1(Math.round(load1))
           setCpu2(Math.round(load2))
           
           setHist1(prev => [...prev.slice(1), load1])
           setHist2(prev => [...prev.slice(1), load2])
        }

        if (data.cpuTemperature) {
           setTemp(Math.round(data.cpuTemperature.main || 0).toString())
        }

        if (data.processes) {
           setTasks(data.processes.all?.toString() || '0')
           // top 5 by cpu
           const list = data.processes.list || []
           const sorted = [...list].sort((a,b) => b.cpu - a.cpu).slice(0, 5)
           setProcs(sorted)
        }

        if (data.mem) {
           setRam({
             used: data.mem.used || 0,
             total: data.mem.total || 1
           })
           setSwap({
             used: data.mem.swapused || 0,
             total: data.mem.swaptotal || 1
           })
        }
      })
      return unsubscribe
    }
  }, [])

  const drawGraph = (canvasRef: React.RefObject<HTMLCanvasElement | null>, history: number[]) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // clear
    ctx.fillStyle = '#080c10'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Check bounds
    // We expect history [0..100], scaling to canvas width = 225
    ctx.beginPath()
    ctx.strokeStyle = '#2a6a5a'
    ctx.lineWidth = 1
    
    const step = canvas.width / (history.length - 1)
    
    for (let i = 0; i < history.length; i++) {
       const x = i * step
       // y scaled (value 0-100 down to canvas height 38)
       const val = Math.min(100, Math.max(0, history[i]))
       const y = canvas.height - (val / 100 * canvas.height)
       
       if (i === 0) ctx.moveTo(x, y)
       else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }

  useEffect(() => {
    drawGraph(canvas1Ref, hist1)
    drawGraph(canvas2Ref, hist2)
  }, [hist1, hist2])

  // Mem dots
  const totalDots = 192
  const filledCount = Math.floor((ram.used / ram.total) * totalDots) || 0
  const dots = Array(totalDots).fill(0).map((_, i) => i < filledCount)

  const swapPct = (swap.used / swap.total) * 100 || 0

  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

  return (
    <div style={{
      width: '245px', overflowY: 'auto', borderRight: '1px solid var(--border)',
      height: '100%', display: 'flex', flexDirection: 'column'
    }}>
      <style>{`
        .sec-b { border-bottom: 1px solid var(--border); }
        .row-hover:hover { background: var(--bg-hover); }
      `}</style>
      
      {/* SECTION A - CLOCK */}
      <div className="sec-b" style={{ height: '70px', padding: '10px 12px', display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: '36px', color: 'var(--text-primary)', fontWeight: 300, letterSpacing: '2px' }}>
          {formatTime(time)}
        </span>
      </div>

      {/* SECTION B - DATE + META */}
      <div className="sec-b" style={{ minHeight: '52px', padding: '6px 10px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
          <Col label="YEAR" value={time.getFullYear().toString()} />
          <Col label="UPTIME" value={uptimeStr} />
          <Col label="TYPE" value={osType} />
          <Col label="POWER" value={power} />
        </div>
        <div style={{ fontSize: '9px', color: 'var(--text-dim)' }}>
          {monthNames[time.getMonth()]} {time.getDate()}
        </div>
      </div>

      {/* SECTION C - HW INFO */}
      <div className="sec-b" style={{ minHeight: '44px', padding: '4px 10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
          <span style={{ fontSize: '9px', color: 'var(--text-dim)' }}>MANUFACTURER</span>
          <span style={{ fontSize: '9px', color: 'var(--text-value)' }}>{hw.manufacturer}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
          <span style={{ fontSize: '9px', color: 'var(--text-dim)' }}>MODEL</span>
          <span style={{ fontSize: '9px', color: 'var(--text-value)' }}>{hw.model}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
          <span style={{ fontSize: '9px', color: 'var(--text-dim)' }}>CHASSIS</span>
          <span style={{ fontSize: '9px', color: 'var(--text-value)' }}>{hw.chassis}</span>
        </div>
      </div>

      {/* SECTION D - CPU */}
      <div className="sec-b" style={{ paddingBottom: '10px' }}>
        <Header left="CPU USAGE" right={cpuModel} />
        <div style={{ padding: '6px 10px 0' }}>
          {/* Graph 1 */}
          <div style={{ fontSize: '9px', color: 'var(--text-value)', marginBottom: '2px' }}>#1-2  Avg. {cpu1}%</div>
          <canvas ref={canvas1Ref} width={225} height={38} style={{ display: 'block', background: 'var(--bg-deep)' }} />
          
          {/* Graph 2 */}
          <div style={{ fontSize: '9px', color: 'var(--text-value)', marginTop: '8px', marginBottom: '2px' }}>#3-4  Avg. {cpu2}%</div>
          <canvas ref={canvas2Ref} width={225} height={38} style={{ display: 'block', background: 'var(--bg-deep)' }} />
        </div>
      </div>

      {/* SECTION E - CPU TEMP */}
      <div className="sec-b" style={{ padding: '6px 10px', display: 'flex', gap: '16px' }}>
         <Col label="TEMP" value={`${temp}°C`} />
         <Col label="MIN" value={`${minMax.min}GHz`} />
         <Col label="MAX" value={`${minMax.max}GHz`} />
         <Col label="TASKS" value={tasks} />
      </div>

      {/* SECTION F - MEMORY DOT MATRIX */}
      <div className="sec-b" style={{ paddingBottom: '8px' }}>
        <Header left="MEMORY" right={`USING ${(ram.used/1024/1024/1024).toFixed(1)} OUT OF ${(ram.total/1024/1024/1024).toFixed(1)} GiB`} />
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(16, 4px)', gap: '1px', padding: '8px 10px',
          justifyContent: 'center'
        }}>
          {dots.map((isFilled, idx) => (
            <div key={idx} style={{
              width: '3px', height: '3px',
              background: isFilled ? 'var(--graph-green)' : 'var(--bg-hover)'
            }} />
          ))}
        </div>
      </div>

      {/* SECTION G - SWAP */}
      <div className="sec-b" style={{ paddingBottom: '10px' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px' }}>
           <span style={{ fontSize: '9px', color: 'var(--text-dim)' }}>SWAP</span>
           <span style={{ fontSize: '9px', color: 'var(--text-dim)' }}>{(swap.used/1024/1024/1024).toFixed(1)} GiB</span>
         </div>
         <div style={{ height: '3px', margin: '0 10px', background: 'var(--bg-hover)', position: 'relative' }}>
           <div style={{
             position: 'absolute', top: 0, left: 0, height: '100%',
             width: `${swapPct}%`, background: '#1a4a3a',
             transition: 'width 500ms linear'
           }} />
         </div>
      </div>

      {/* SECTION H - TOP PROCS */}
      <div className="sec-b" style={{ paddingBottom: '10px', flex: 1 }}>
         <Header left="TOP PROCESSES" right="PID | NAME | CPU | MEM" />
         <div style={{ paddingTop: '6px' }}>
           {procs.map((p, i) => (
             <div key={i} className="row-hover" style={{
               display: 'flex', height: '18px', padding: '0 10px',
               fontSize: '9px', color: '#6a8a9a', alignItems: 'center'
             }}>
               <div style={{ width: '38px' }}>{p.pid}</div>
               <div style={{ width: '85px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
               <div style={{ width: '40px' }}>{p.cpu.toFixed(1)}%</div>
               <div style={{ width: '30px' }}>{p.mem.toFixed(1)}%</div>
             </div>
           ))}
         </div>
      </div>

    </div>
  )
}

import { useEffect, useState, useRef } from 'react'

const Header = ({ left, right }: { left: string, right?: string }) => (
  <div style={{
    fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase',
    color: 'var(--text-dim)', padding: '5px 10px',
    borderBottom: '1px solid var(--border)', background: 'var(--bg-deep)',
    display: 'flex', justifyContent: 'space-between'
  }}>
    <span>{left}</span>
    {right && <span style={{ color: 'var(--text-muted)' }}>{right}</span>}
  </div>
)

export default function RightPanel() {
  const [netIface, setNetIface] = useState('eth0')
  const [ip, setIp] = useState('127.0.0.1')
  const [ping, setPing] = useState('0')
  const [latLon, setLatLon] = useState('37.774, -122.419') // static initial
  
  const [rxTotal, setRxTotal] = useState('0.0')
  const [txTotal, setTxTotal] = useState('0.0')
  
  const [netHistoryRx, setNetHistoryRx] = useState<number[]>(Array(60).fill(0))
  const [netHistoryTx, setNetHistoryTx] = useState<number[]>(Array(60).fill(0))

  const globeRef = useRef<HTMLCanvasElement | null>(null)
  const trafficRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    // Basic IP/Ping simulation interval if sysinfo missing
    const t = setInterval(() => {
        setPing((Math.random() * 20 + 15).toFixed(1))
    }, 5000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (window.electronAPI && window.electronAPI.sysinfo && window.electronAPI.sysinfo.onUpdate) {
      const unsubscribe = window.electronAPI.sysinfo.onUpdate((data: any) => {
        if (!data) return
        
        if (data.networkInterfaces && data.networkInterfaces.length > 0) {
           const iface = data.networkInterfaces.find((i:any) => i.ip4 && i.ip4 !== '127.0.0.1') || data.networkInterfaces[0]
           setNetIface(iface.iface || 'eth0')
           setIp(iface.ip4 || '127.0.0.1')
        }
        
        if (data.network) {
           const rxMBps = (data.network.rx_sec / 1024 / 1024) || 0
           const txMBps = (data.network.tx_sec / 1024 / 1024) || 0
           
           setNetHistoryRx(prev => [...prev.slice(1), rxMBps])
           setNetHistoryTx(prev => [...prev.slice(1), txMBps])
           
           // Totals
           setRxTotal(((data.network.rx_bytes || 0) / 1024 / 1024 / 1024).toFixed(2))
           setTxTotal(((data.network.tx_bytes || 0) / 1024 / 1024).toFixed(1))
        }
      })
      return unsubscribe
    }
  }, [])

  // GLOBE RENDER
  useEffect(() => {
    const canvas = globeRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let reqId: number
    let rotOffset = 0

    const drawGlobe = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const cx = 112
      const cy = 75
      const rad = 65

      // Earth Circle
      ctx.beginPath()
      ctx.arc(cx, cy, rad, 0, Math.PI * 2)
      ctx.fillStyle = '#080c10'
      ctx.fill()
      ctx.lineWidth = 1
      ctx.strokeStyle = '#1a3a4a'
      ctx.stroke()

      // Lats
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, rad, 0, Math.PI * 2)
      ctx.clip()

      ctx.strokeStyle = '#0d2a35'
      ctx.lineWidth = 0.5

      for (let lat = -60; lat <= 60; lat += 30) {
        if (lat === 0) continue
        const latRad = (lat * Math.PI) / 180
        const yR = Math.abs(rad * Math.sin(latRad))
        ctx.beginPath()
        ctx.ellipse(cx, cy - (rad*Math.sin(latRad)), rad, yR, 0, 0, Math.PI*2)
        ctx.stroke()
      }
      
      // Equator
      ctx.beginPath()
      ctx.moveTo(cx - rad, cy)
      ctx.lineTo(cx + rad, cy)
      ctx.stroke()

      // Lons
      rotOffset += 0.003
      for (let lon = 0; lon < 180; lon += 30) {
         const lonRad = (lon * Math.PI) / 180 + rotOffset
         const xR = Math.abs(rad * Math.cos(lonRad))
         ctx.beginPath()
         ctx.ellipse(cx, cy, xR, rad, 0, 0, Math.PI * 2)
         ctx.stroke()
      }
      ctx.restore()

      // Location dot (fake)
      const dotX = cx - 20
      const dotY = cy - 15
      ctx.beginPath()
      ctx.arc(dotX, dotY, 3, 0, Math.PI*2)
      ctx.fillStyle = '#2a6a3a'
      ctx.fill()

      // 3 arcs
      ctx.strokeStyle = 'rgba(26,90,58,0.3)'
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.quadraticCurveTo(cx - 30, cy - 50, cx - 60, cy - 20)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.quadraticCurveTo(cx + 40, cy - 40, cx + 55, cy + 10)
      ctx.stroke()
      
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.quadraticCurveTo(cx + 20, cy + 50, cx - 10, cy + 60)
      ctx.stroke()

      reqId = requestAnimationFrame(drawGlobe)
    }

    drawGlobe()
    return () => cancelAnimationFrame(reqId)
  }, [])

  // TRAFFIC GRAPH RENDER
  useEffect(() => {
    const canvas = trafficRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // bg
    ctx.fillStyle = '#080c10'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // grid
    ctx.strokeStyle = '#0d1a20'
    ctx.lineWidth = 0.5
    for (let y = 0; y <= canvas.height; y += 20) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }
    
    // y-labels
    ctx.fillStyle = '#2a5a6a'
    ctx.font = '8px JetBrains Mono'
    ctx.fillText(' 0.21', canvas.width - 28, 10)
    ctx.fillText(' 0', canvas.width - 15, canvas.height / 2 + 3)
    ctx.fillText('-0.21', canvas.width - 28, canvas.height - 4)

    const step = canvas.width / (netHistoryRx.length - 1)

    // rx - green
    ctx.beginPath()
    ctx.strokeStyle = '#1a5a3a'
    ctx.lineWidth = 1
    for (let i = 0; i < netHistoryRx.length; i++) {
       const x = i * step
       // clamp 0 to 0.21, scale to top half (0 to 60)
       // if value is 0.21, y is 0. if value is 0, y is 60
       let val = Math.min(0.21, Math.max(0, netHistoryRx[i]))
       let y = 60 - (val / 0.21 * 60)
       if (i === 0) ctx.moveTo(x, y)
       else ctx.lineTo(x, y)
    }
    ctx.stroke()

    // tx - blue
    ctx.beginPath()
    ctx.strokeStyle = '#1a3a5a'
    ctx.lineWidth = 1
    for (let i = 0; i < netHistoryTx.length; i++) {
       const x = i * step
       // tx plotted downwards from center. 0 is 60. 0.21 is 120.
       let val = Math.min(0.21, Math.max(0, netHistoryTx[i]))
       let y = 60 + (val / 0.21 * 60)
       if (i === 0) ctx.moveTo(x, y)
       else ctx.lineTo(x, y)
    }
    ctx.stroke()

  }, [netHistoryRx, netHistoryTx])

  return (
    <div style={{
      width: '245px', borderLeft: '1px solid var(--border)',
      height: '100%', display: 'flex', flexDirection: 'column'
    }}>
      <style>{`
        .sec-b { border-bottom: 1px solid var(--border); }
      `}</style>

      {/* SEC A - NETWORK STATUS */}
      <div className="sec-b" style={{ height: '72px' }}>
        <Header left="NETWORK STATUS" right={`Interface: ${netIface}`} />
        <div style={{ padding: '6px 10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
           <div style={{ display: 'flex', flexDirection: 'column' }}>
             <span style={{ fontSize: '9px', color: 'var(--text-dim)' }}>STATE</span>
             <span style={{ fontSize: '9px', color: '#2a6a3a', marginTop: '2px' }}>ONLINE</span>
           </div>
           <div style={{ display: 'flex', flexDirection: 'column' }}>
             <span style={{ fontSize: '9px', color: 'var(--text-dim)' }}>IPv4</span>
             <span style={{ fontSize: '9px', color: 'var(--text-value)', marginTop: '2px' }}>{ip}</span>
           </div>
           <div style={{ display: 'flex', flexDirection: 'column', gridColumn: '1 / span 2', marginTop: '2px' }}>
             <span style={{ fontSize: '9px', color: 'var(--text-dim)' }}>
               PING <span style={{ color: 'var(--text-value)', marginLeft: '8px' }}>{ping} ms</span>
             </span>
           </div>
        </div>
      </div>

      {/* SEC B - WORLD VIEW */}
      <div className="sec-b" style={{ paddingBottom: '10px' }}>
        <Header left="WORLD VIEW" right="GLOBAL NETWORK MAP" />
        <div style={{ padding: '6px 10px', fontSize: '9px', color: 'var(--text-dim)', letterSpacing: '1px' }}>
          ENDPOINT LAT/LON    {latLon}
        </div>
        <div style={{ padding: '0 10px', display: 'flex', justifyContent: 'center' }}>
          <canvas ref={globeRef} width={225} height={150} style={{ background: 'var(--bg-deep)' }} />
        </div>
      </div>

      {/* SEC C - TRAFFIC */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header left="NETWORK TRAFFIC" right="UP / DOWN, MB/S" />
        <div style={{ padding: '6px 10px', fontSize: '9px', color: 'var(--text-dim)' }}>
          TOTAL   {txTotal} MB OUT, {rxTotal} GB IN
        </div>
        <div style={{ flex: 1, padding: '0 10px 10px 10px', minHeight: 0 }}>
          <canvas ref={trafficRef} width={225} height={120} style={{ display: 'block', width: '100%', height: '100%', background: 'var(--bg-deep)' }} />
        </div>
      </div>

    </div>
  )
}

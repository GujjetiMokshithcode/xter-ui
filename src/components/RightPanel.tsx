import { useEffect, useState, useRef } from 'react'

export default function RightPanel() {

  const [netHistoryTx, setNetHistoryTx] = useState<number[]>(Array(60).fill(0))
  const [netHistoryRx, setNetHistoryRx] = useState<number[]>(Array(60).fill(0))
  const [ip, setIp] = useState('127.0.0.1')
  
  const globeCanvasRef = useRef<HTMLCanvasElement>(null)
  const netCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.app.getInfo().then((info: any) => {
        setIp(info.ip || '194.187.249.35')
      })

      const unsubscribe = window.electronAPI.sysinfo.onUpdate((data: any) => {
        const rxMB = (data.network.rx / 1024 / 1024)
        const txMB = (data.network.tx / 1024 / 1024)
        setNetHistoryRx(prev => [...prev.slice(1), rxMB])
        setNetHistoryTx(prev => [...prev.slice(1), txMB])
      })
      return () => unsubscribe()
    }
  }, [])

  // GLOBE RENDER
  useEffect(() => {
    let animationId: number;
    let rotation = 0;

    const canvas = globeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawGlobe = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const r = 50;

      // Draw earth circle
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = '#080c10';
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#1a3a4a';
      ctx.stroke();

      ctx.strokeStyle = '#0d2a35';
      ctx.lineWidth = 0.5;

      // Latitudes
      for (let i = -r + 10; i < r; i += 15) {
        ctx.beginPath();
        const w = Math.sqrt(r * r - i * i);
        ctx.moveTo(cx - w, cy + i);
        ctx.lineTo(cx + w, cy + i);
        ctx.stroke();
      }

      // Longitudes (fake 3d using arcs)
      for (let i = 0; i < 360; i += 30) {
        const angle = (i + rotation) * (Math.PI / 180);
        const cos = Math.cos(angle);
        if (cos > 0) { // only show front facing
           ctx.beginPath();
           ctx.ellipse(cx, cy, r * cos, r, 0, 0, Math.PI * 2);
           ctx.stroke();
        }
      }

      // Dot
      ctx.beginPath();
      ctx.arc(cx - 15, cy - 10, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#2a6a3a';
      ctx.fill();

      // Arcs
      ctx.strokeStyle = 'rgba(26, 74, 58, 0.5)';
      ctx.beginPath();
      ctx.moveTo(cx - 15, cy - 10);
      ctx.quadraticCurveTo(cx, cy - 40, cx + 30, cy + 10);
      ctx.stroke();

      rotation += 0.5;
      animationId = requestAnimationFrame(drawGlobe);
    };

    drawGlobe();
    return () => cancelAnimationFrame(animationId);
  }, []);

  // NETWORK RENDER
  useEffect(() => {
    const canvas = netCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#080c10';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Horiz grid
    ctx.strokeStyle = '#0d1a20';
    ctx.lineWidth = 1;
    for (let y = 0; y < canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    const drawLine = (data: number[], color: string) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      const sliceWidth = canvas.width / (data.length - 1);
      
      let maxVal = Math.max(...data, 0.5); // avoid div 0
      
      for (let i = 0; i < data.length; i++) {
        const x = i * sliceWidth;
        const normalized = data[i] / maxVal;
        const y = canvas.height - (normalized * canvas.height);
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    drawLine(netHistoryTx, '#1a5a3a');
    drawLine(netHistoryRx, '#1a3a5a');

    // Labels
    ctx.fillStyle = '#2a5a6a';
    ctx.font = '9px "JetBrains Mono"';
    ctx.textAlign = 'right';
    ctx.fillText('0.21', canvas.width - 5, 10);
    ctx.fillText('0', canvas.width - 5, canvas.height / 2 + 3);
    ctx.fillText('-0.21', canvas.width - 5, canvas.height - 5);
  }, [netHistoryTx, netHistoryRx]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '245px', color: '#7a9aaa' }}>
      <style>{`
        .right-sec { border-bottom: 1px solid #1a2a35; }
        .tiny-label { font-size: 9px; color: #2a5a6a; }
        .tiny-val { font-size: 9px; color: #7a9aaa; }
        .flex-row { display: flex; flex-direction: row; }
        .flex-col { display: flex; flex-direction: column; }
      `}</style>
      
      {/* 1. NETWORK STATUS */}
      <div className="right-sec flex-col">
        <div className="panel-header">
          <span>NETWORK STATUS</span>
          <span style={{textTransform: 'none'}}>Interface: tun0</span>
        </div>
        <div style={{ padding: '6px 10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div><span className="tiny-label uppercase">STATE<br/></span><span className="tiny-val" style={{color: '#2a6a3a'}}>ONLINE</span></div>
          <div><span className="tiny-label uppercase">IPv4<br/></span><span className="tiny-val">{ip}</span></div>
          <div><span className="tiny-label uppercase">PROTOCOL<br/></span><span className="tiny-val uppercase">IPv4</span></div>
          <div><span className="tiny-label uppercase">PING<br/></span><span className="tiny-val">16ms</span></div>
        </div>
      </div>

      {/* 2. WORLD VIEW */}
      <div className="right-sec flex-col">
        <div className="panel-header">
          <span>WORLD VIEW</span>
          <span style={{textTransform: 'none'}}>GLOBAL NETWORK MAP</span>
        </div>
        <div style={{ padding: '6px 10px' }}>
          <div className="flex-row justify-between" style={{marginBottom: '-10px'}}>
            <span className="tiny-label">ENDPOINT LAT/LON</span>
            <span className="tiny-val">42.8837, 1.2374</span>
          </div>
          <canvas ref={globeCanvasRef} width={225} height={160} style={{ display: 'block', margin: '0 auto' }}></canvas>
        </div>
      </div>

      {/* 3. NETWORK TRAFFIC */}
      <div className="right-sec flex-col" style={{ borderBottom: 'none' }}>
        <div className="panel-header">
          <span>NETWORK TRAFFIC</span>
          <span style={{textTransform: 'none'}}>UP / DOWN, MB/S</span>
        </div>
        <div style={{ padding: '6px 10px' }}>
          <div className="flex-row justify-between mb-1">
            <span className="tiny-label">TOTAL</span>
            <span className="tiny-val">158 MB OUT, 132 MB IN</span>
          </div>
          <canvas ref={netCanvasRef} width={225} height={120} style={{ display: 'block' }}></canvas>
        </div>
      </div>

    </div>
  )
}

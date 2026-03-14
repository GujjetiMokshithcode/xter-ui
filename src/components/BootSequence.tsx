import { useEffect, useState, useRef } from 'react'

const bootLinesInfo = [
  { type: "kernel", text: "XTER-UI OS v3.1.4 — Kernel 6.7.2-xter-ui-amd64" },
  { type: "kernel", text: "Command line: BOOT_IMAGE=/vmlinuz-6.7.2 root=/dev/sda2 quiet" },
  { type: "kernel", text: "[    0.000000] Initializing cgroup subsys cpuset" },
  { type: "kernel", text: "[    0.000000] Linux version 6.7.2 (gcc version 13.2.0)" },
  { type: "kernel", text: "[    0.182731] BIOS-provided physical RAM map verified" },
  { type: "kernel", text: "[    0.401882] ACPI 2.0 tables found and loaded" },
  { type: "ok", text: "Loaded udev Kernel Device Manager" },
  { type: "ok", text: "Started Cryptography Setup for sda2" },
  { type: "kernel", text: "[    1.002341] NET: Registered protocol family 2 (IPv4)" },
  { type: "ok", text: "Reached target Network (Pre)" },
  { type: "kernel", text: "[    1.443201] Mounting /proc filesystem... done" },
  { type: "ok", text: "Started Journal Service" },
  { type: "warn", text: "fsck warning: /dev/sdb1 has not been checked in 180 days" },
  { type: "ok", text: "Mounted /boot/efi" },
  { type: "ok", text: "Started XTER-UI Interface Daemon" },
  { type: "kernel", text: "[    2.210543] Loading XTER-UI security module" },
  { type: "system", text: "Verifying system integrity... SHA256 checksum OK" },
  { type: "system", text: "Decrypting filesystem overlay... done" },
  { type: "ok", text: "Started OpenSSH Server Daemon" },
  { type: "system", text: "Scanning network interfaces: eth0 wlan0 lo" },
  { type: "system", text: "Assigning IP via DHCP... acquired 192.168.1.x" },
  { type: "ok", text: "Reached target Multi-User System" },
  { type: "system", text: "Loading terminal emulator subsystem..." },
  { type: "system", text: "Binding IPC message channels... [3/3] OK" },
  { type: "system", text: "Mounting virtual filesystem... done" },
  { type: "ok", text: "Started XTER-UI Process Monitor" },
  { type: "system", text: "Calibrating system clock via NTP... synced" },
  { type: "system", text: "Loading user profile... done" },
  { type: "ready", text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" },
  { type: "ready", text: "  XTER-UI v1.0.0 — ALL SYSTEMS OPERATIONAL" },
  { type: "ready", text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" }
]

const TYPE_COLORS: Record<string, string> = {
  kernel: "#3a7a3a",
  ok: "#2a6a2a",
  warn: "#7a6a1a",
  error: "#7a2a2a",
  system: "#1a5a6a",
  ready: "#4aaa4a"
}

const TYPE_PREFIX: Record<string, string> = {
  kernel: "",
  ok: "[  OK  ] ",
  warn: "[ WARN ] ",
  error: "[ ERR  ] ",
  system: "",
  ready: ""
}

export default function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [linesPrinted, setLinesPrinted] = useState<number>(0)
  const [done, setDone] = useState(false)
  const leftPanelRef = useRef<HTMLDivElement>(null)

  const [sysStats, setSysStats] = useState({ cpu: 0, ram: 0, temp: 41 })
  const [uptime, setUptime] = useState(0)

  useEffect(() => {
    let currentLine = 0
    let timeoutId: any

    const printNextLine = () => {
      if (currentLine >= bootLinesInfo.length) {
        setDone(true)
        setTimeout(onComplete, 1000)
        return
      }

      currentLine++
      setLinesPrinted(currentLine)

      if (leftPanelRef.current) {
        leftPanelRef.current.scrollTop = leftPanelRef.current.scrollHeight
      }

      const delay = Math.floor(Math.random() * (120 - 40 + 1) + 40)
      timeoutId = setTimeout(printNextLine, delay)
    }

    printNextLine()

    return () => clearTimeout(timeoutId)
  }, [onComplete])

  useEffect(() => {
    const uptimeInterval = setInterval(() => {
      setUptime(prev => prev + 1)
    }, 1000)

    let cleanupSysInfo: (() => void) | undefined
    if (window.electronAPI && window.electronAPI.sysinfo) {
      cleanupSysInfo = window.electronAPI.sysinfo.onUpdate((data: any) => {
        setSysStats({
          cpu: data.cpu,
          ram: data.ram.percent,
          temp: 41 + Math.floor(Math.random() * 5)
        })
      })
    } else {
      // Fake animated values if IPC is unavailable
      const fakeInterval = setInterval(() => {
        setSysStats(prev => ({
          cpu: Math.min(100, prev.cpu + Math.random() * 10),
          ram: Math.min(100, prev.ram + Math.random() * 5),
          temp: 41 + Math.floor(Math.random() * 5)
        }))
      }, 500)
      cleanupSysInfo = () => clearInterval(fakeInterval)
    }

    return () => {
      clearInterval(uptimeInterval)
      if (cleanupSysInfo) cleanupSysInfo()
    }
  }, [])

  const renderBarParts = (percent: number, length = 20) => {
    const p = Math.max(0, Math.min(100, percent))
    const filledLen = Math.floor((p / 100) * length)
    return {
      filled: '█'.repeat(filledLen),
      empty: '░'.repeat(Math.max(0, length - filledLen))
    }
  }

  const renderMetric = (label: string, percent: number, isBar = true) => {
    const paddedLabel = label.padEnd(5, ' ')
    if (isBar) {
      const pText = `${Math.floor(percent)}%`.padStart(4, ' ')
      const { filled, empty } = renderBarParts(percent, 13)
      return `│ ${paddedLabel} [${filled}${empty}] ${pText}    │`
    } else {
      return `│ ${paddedLabel} ██ 41°C                 │`
    }
  }

  const formatUptime = (sec: number) => {
    const h = Math.floor(sec / 3600).toString().padStart(2, '0')
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0')
    const s = Math.floor(sec % 60).toString().padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  const totalLines = bootLinesInfo.length
  const progressRatio = linesPrinted / totalLines

  const progress1 = Math.min(100, progressRatio * 400) // Reaches 100% at 25% of lines
  const progress2 = Math.min(100, progressRatio * 200) // Reaches 100% at 50%
  const progress3 = Math.min(100, progressRatio * 150) // Reaches 100% at 66%
  const progress4 = Math.min(100, progressRatio * 100) // Reaches 100% at 100%

  // Keep max 60 lines
  const visibleLines = bootLinesInfo.slice(0, linesPrinted).slice(-60)

  return (
    <>
      <style>{`
        .boot-seq-root {
          width: 100vw;
          height: 100vh;
          background: #000000;
          display: flex;
          font-family: 'JetBrains Mono', monospace;
          color: #cccccc;
          overflow: hidden;
          box-sizing: border-box;
          user-select: none;
        }
        .boot-seq-root * {
          border-radius: 0 !important;
          box-shadow: none !important;
          background-image: none !important;
        }
        .boot-left {
          width: 60%;
          height: 100%;
          padding: 1rem;
          overflow-y: auto;
        }
        .boot-right {
          width: 40%;
          height: 100%;
          border-left: 1px solid #1a3a1a;
          display: flex;
          flex-direction: column;
        }
        .boot-left::-webkit-scrollbar {
          width: 4px;
          background: #000000;
        }
        .boot-left::-webkit-scrollbar-thumb {
          background: #1a3a1a;
        }
        .cursor-blink {
          animation: blink-1s step-end infinite;
          display: inline-block;
          margin-left: 4px;
        }
        .text-blink-slow {
          animation: blink-2s step-end infinite;
        }
        @keyframes blink-1s {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes blink-2s {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
      
      <div className={`boot-seq-root absolute top-0 left-0 z-50 transition-opacity duration-200 ${done ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        
        {/* LEFT PANEL */}
        <div className="boot-left" ref={leftPanelRef}>
          {visibleLines.map((line, idx) => {
            const isReady = line.type === 'ready'
            return (
              <div 
                key={idx} 
                style={{ 
                  color: TYPE_COLORS[line.type], 
                  fontWeight: isReady ? 'bold' : 'normal',
                  fontSize: '13px',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.2'
                }}
              >
                {TYPE_PREFIX[line.type]}{line.text}
              </div>
            )
          })}
          {linesPrinted > 0 && linesPrinted < totalLines && (
            <div style={{ color: '#4aaa4a', fontSize: '13px' }} className="cursor-blink">█</div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="boot-right">
          
          {/* Section A - ASCII Skull */}
          <div style={{ height: '40%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <pre style={{ color: '#1a4a1a', fontSize: '11px', lineHeight: '1.1', margin: 0 }}>
{`  ░░░░░░░░░░░░░░░░░░░░░
  ░░░██████████████░░░
  ░░██░░░░░░░░░░░░██░░
  ░██░░▀█▀░░░▀█▀░░░██░
  ░██░░░░░░█░░░░░░░██░
  ░██░░░░░███░░░░░░██░
  ░░██░░░░░░░░░░░░██░░
  ░░░██████████████░░░
  ░░░░░██░░░░░██░░░░░░
  ░░░░░░░░░░░░░░░░░░░░
  ░X░T░E░R░-░U░I░░░░░░
  ░░S░Y░S░T░E░M░░░░░░░`}
            </pre>
            <div 
              className="text-blink-slow"
              style={{ color: '#2a6a2a', fontSize: '10px', letterSpacing: '4px', marginTop: '16px' }}
            >
              ACCESS GRANTED
            </div>
          </div>

          {/* Section B - FAKE PROGRESS BARS */}
          <div style={{ height: '30%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: "KERNEL MODULE", val: progress1 },
                { label: "CRYPTO ENGINE", val: progress2 },
                { label: "NET INTERFACE", val: progress3 },
                { label: "SYS MONITOR  ", val: progress4 }
              ].map((bar, i) => {
                const { filled, empty } = renderBarParts(bar.val, 20)
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', whiteSpace: 'pre' }}>
                    <span style={{ fontSize: '10px', color: '#3a6a3a', letterSpacing: '1px', width: '110px' }}>
                      {bar.label}
                    </span>
                    <span style={{ fontSize: '10px', color: '#1a5a1a' }}>[</span>
                    <span style={{ fontSize: '10px', color: '#1a5a1a' }}>{filled}</span>
                    <span style={{ fontSize: '10px', color: '#0a1a0a' }}>{empty}</span>
                    <span style={{ fontSize: '10px', color: '#1a5a1a' }}>]</span>
                    <span style={{ fontSize: '10px', color: '#4a8a4a', width: '45px', textAlign: 'right' }}>
                      {Math.floor(bar.val)}%
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Section C - LIVE SYSTEM METRICS */}
          <div style={{ height: '30%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <pre style={{ color: '#1a3a1a', fontSize: '12px', lineHeight: '1.2', margin: 0 }}>
{`┌─ SYSTEM METRICS ──────────────┐
${renderMetric("CPU", sysStats.cpu, true)}
${renderMetric("RAM", sysStats.ram, true)}
${renderMetric("TEMP", sysStats.temp, false)}
│ UPTIME  ${formatUptime(uptime).padEnd(21, ' ')} │
└───────────────────────────────┘`}
            </pre>
          </div>

        </div>
      </div>
    </>
  )
}

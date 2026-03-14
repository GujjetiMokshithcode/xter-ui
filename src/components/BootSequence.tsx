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

// Helpers for Stage 1 Random Line Generation
const randomHex = (len: number) => {
  let s = '';
  for (let i = 0; i < len; i++) {
    s += Math.floor(Math.random() * 16).toString(16);
  }
  return s.toUpperCase();
}
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = <T,>(arr: T[]): T => arr[randomInt(0, arr.length - 1)];

const generateRandomLogLine = () => {
  const templates = [
    () => `0x${randomHex(8)}  →  ${randomHex(16)}  ${randomChoice(["READ","WRITE","EXEC","SCAN"])}  ${randomChoice(["OK","OK","OK","FAIL"])}`,
    () => `PROBE 0x${randomHex(12)}  SECTOR ${randomInt(0,999)}  CRC ${randomHex(8)}`,
    () => `THREAD ${randomInt(0,32)} SPAWNED  PID:${randomInt(1000,9999)}  STACK:0x${randomHex(12)}`,
    () => `MMIO MAP  0x${randomHex(8)}-0x${randomHex(8)}  FLAGS: ${randomChoice(["rwx","r-x","rw-","---"])} ${randomChoice(["MAPPED","PENDING"])}`,
    () => `IRQ ${randomInt(0,24)} VECTOR 0x${randomHex(2)}  REGISTERED`,
    () => `ENTROPY POOL  ${randomInt(10,99)}%  SEEDING...`,
    () => `NETLINK SOCKET  fd:${randomInt(0,9)}  BOUND  proto:0x${randomHex(4)}`,
    () => `CIPHER: AES-256-GCM  KEY:${randomHex(16)}  IV:${randomHex(8)}  INIT`,
    () => `PROC /sys/kernel/${randomChoice(["cgroup","debug","security","tracing"])}  MOUNTED`,
    () => `CHECKSUM ${randomChoice(["vmlinuz","initrd.img","modules.dep","system.map"])}  SHA256:${randomHex(16)}  PASS`
  ];
  return randomChoice(templates)();
}

export default function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [, setStage2Done] = useState(false);

  // STAGE 1 State
  const [fastLines, setFastLines] = useState<string[]>([]);
  const stage1Ref = useRef<HTMLDivElement>(null);

  // STAGE 2 State
  const [linesPrinted, setLinesPrinted] = useState<number>(0);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const [sysStats, setSysStats] = useState({ cpu: 0, ram: 0, temp: 41 });
  const [uptime, setUptime] = useState(0);

  // STAGE 3 State
  const [stage3Step, setStage3Step] = useState<'black' | 'name' | 'wipe'>('black');

  // STAGE 1 Logic
  useEffect(() => {
    if (stage !== 1) return;

    let timeoutId: number | NodeJS.Timeout;
    const addLine = () => {
      setFastLines(prev => {
        const next = [...prev, generateRandomLogLine()];
        if (next.length > 80) return next.slice(next.length - 80);
        return next;
      });
      if (stage1Ref.current) {
        stage1Ref.current.scrollTop = stage1Ref.current.scrollHeight;
      }
      timeoutId = setTimeout(addLine, randomInt(15, 30));
    };
    addLine();

    const stage1End = setTimeout(() => {
      clearTimeout(timeoutId);
      setStage(2);
    }, 6000);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(stage1End);
    };
  }, [stage]);

  // STAGE 2 Logic
  useEffect(() => {
    if (stage !== 2) return;

    let currentLine = 0;
    let timeoutId: number | NodeJS.Timeout;

    const printNextLine = () => {
      if (currentLine >= bootLinesInfo.length) {
        setStage2Done(true);
        setTimeout(() => setStage(3), 600);
        return;
      }
      currentLine++;
      setLinesPrinted(currentLine);

      if (leftPanelRef.current) {
        leftPanelRef.current.scrollTop = leftPanelRef.current.scrollHeight;
      }

      const delay = Math.floor(Math.random() * (120 - 40 + 1) + 40);
      timeoutId = setTimeout(printNextLine, delay);
    };

    printNextLine();

    return () => clearTimeout(timeoutId);
  }, [stage]);

  // STAGE 2 SysInfo Polling
  useEffect(() => {
    if (stage !== 2) return;

    const uptimeInterval = setInterval(() => {
      setUptime(prev => prev + 1);
    }, 1000);

    let cleanupSysInfo: (() => void) | undefined;
    if (window.electronAPI && window.electronAPI.sysinfo) {
      cleanupSysInfo = window.electronAPI.sysinfo.onUpdate((data: any) => {
        setSysStats({
          cpu: data.cpu,
          ram: data.ram.percent,
          temp: 41 + Math.floor(Math.random() * 5)
        });
      });
    } else {
      const fakeInterval = setInterval(() => {
        setSysStats(prev => ({
          cpu: Math.min(100, prev.cpu + Math.random() * 10),
          ram: Math.min(100, prev.ram + Math.random() * 5),
          temp: 41 + Math.floor(Math.random() * 5)
        }));
      }, 500);
      cleanupSysInfo = () => clearInterval(fakeInterval);
    }

    return () => {
      clearInterval(uptimeInterval);
      if (cleanupSysInfo) cleanupSysInfo();
    };
  }, [stage]);

  // STAGE 3 Logic
  useEffect(() => {
    if (stage !== 3) return;

    // STEP A: Black (100ms)
    // STEP B is Name Reveal at 100ms
    const bTimer = setTimeout(() => {
      setStage3Step('name');
    }, 100);

    // STEP C: Horizontal wipe Starts after Name reveal (600ms after step B starts = 700ms total)
    const cTimer = setTimeout(() => {
      setStage3Step('wipe');
    }, 700);

    // After 600 + 400 + 300 ms (wait, wipe animate, slide up/down) = total 1300ms from start of stage 3
    const finishTimer = setTimeout(() => {
      onComplete();
    }, 1200);

    return () => {
      clearTimeout(bTimer);
      clearTimeout(cTimer);
      clearTimeout(finishTimer);
    };
  }, [stage, onComplete]);

  // Rendering Helpers Stage 2
  const renderBarParts = (percent: number, length = 20) => {
    const p = Math.max(0, Math.min(100, percent));
    const filledLen = Math.floor((p / 100) * length);
    return {
      filled: '█'.repeat(filledLen),
      empty: '░'.repeat(Math.max(0, length - filledLen))
    };
  };

  const renderMetric = (label: string, percent: number, isBar = true) => {
    const paddedLabel = label.padEnd(5, ' ');
    if (isBar) {
      const pText = `${Math.floor(percent)}%`.padStart(4, ' ');
      const { filled, empty } = renderBarParts(percent, 13);
      return `│ ${paddedLabel} [${filled}${empty}] ${pText}    │`;
    } else {
      return `│ ${paddedLabel} ██ 41°C                 │`;
    }
  };

  const formatUptime = (sec: number) => {
    const h = Math.floor(sec / 3600).toString().padStart(2, '0');
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const totalLines = bootLinesInfo.length;
  const progressRatio = linesPrinted / totalLines;

  const progress1 = Math.min(100, progressRatio * 400);
  const progress2 = Math.min(100, progressRatio * 200);
  const progress3 = Math.min(100, progressRatio * 150);
  const progress4 = Math.min(100, progressRatio * 100);

  const visibleLines = bootLinesInfo.slice(0, linesPrinted).slice(-60);

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

        /* STAGE 1 */
        .stage1-container {
          padding: 8px;
          font-size: 12px;
          color: #2a5a2a;
          width: 100%;
          height: 100%;
          overflow-y: hidden;
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }

        /* STAGE 2 */
        .boot-left {
          width: 60%;
          height: 100%;
          padding: 1rem;
          overflow-y: hidden;
        }
        .boot-right {
          width: 40%;
          height: 100%;
          border-left: 1px solid #1a3a1a;
          display: flex;
          flex-direction: column;
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

        /* STAGE 3 */
        .stage3-container {
          position: absolute;
          top: 0; left: 0; width: 100vw; height: 100vh;
          background: #000000;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }
        
        .stage3-name-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .stage3-app-name {
          font-family: 'JetBrains Mono', monospace;
          font-size: 52px;
          font-weight: bold;
          color: #ffffff;
          letter-spacing: 20px;
          animation: glitchIn 500ms ease forwards;
        }
        
        .stage3-app-sub {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #3a6a3a;
          letter-spacing: 6px;
          text-transform: uppercase;
          margin-top: 20px;
          opacity: 0;
          animation: fadeIn 1ms forwards;
          animation-delay: 200ms;
        }

        @keyframes glitchIn {
          0%   { opacity: 0; transform: scaleX(2); filter: blur(8px); }
          40%  { opacity: 1; transform: scaleX(1.05); filter: blur(1px); }
          60%  { transform: scaleX(0.98); filter: blur(0px); }
          80%  { transform: scaleX(1.01); }
          100% { transform: scaleX(1); opacity: 1; filter: blur(0px); }
        }
        
        @keyframes fadeIn {
          to { opacity: 1; }
        }

        .stage3-wipe-container {
          position: absolute;
          top: 0; left: 0; width: 100vw; height: 100vh;
          overflow: hidden;
          pointer-events: none;
        }

        .stage3-half-top {
          position: absolute;
          top: 0; left: 0; width: 100vw; height: 50vh;
          background: #000000;
          animation: slideUp 300ms ease-in forwards;
          animation-delay: 200ms;
        }
        
        .stage3-half-bottom {
          position: absolute;
          top: 50vh; left: 0; width: 100vw; height: 50vh;
          background: #000000;
          animation: slideDown 300ms ease-in forwards;
          animation-delay: 200ms;
        }

        .stage3-shoot-line {
          position: absolute;
          top: 50vh; left: 0;
          height: 2px;
          background: #ffffff;
          animation: shootLine 200ms linear forwards;
          transform: translateY(-50%);
          z-index: 101;
        }

        .stage3-load-bar {
          position: absolute;
          bottom: 0; left: 0;
          height: 3px;
          background: #ffffff;
          animation: loadBarFill 400ms linear forwards;
          z-index: 105;
        }

        @keyframes slideUp { to { transform: translateY(-100vh); } }
        @keyframes slideDown { to { transform: translateY(100vh); } }
        @keyframes shootLine { 
          0% { width: 0%; left: 0; }
          100% { width: 100%; left: 0; }
        }
        @keyframes loadBarFill {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
      
      {stage === 1 && (
        <div className="boot-seq-root">
          <div className="stage1-container" ref={stage1Ref}>
            {fastLines.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>
      )}

      {stage === 2 && (
        <div className="boot-seq-root">
          <div className="boot-left" ref={leftPanelRef}>
            {visibleLines.map((line, idx) => {
              const isReady = line.type === 'ready';
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
              );
            })}
            {linesPrinted > 0 && linesPrinted < totalLines && (
              <div style={{ color: '#4aaa4a', fontSize: '13px' }} className="cursor-blink">█</div>
            )}
          </div>

          <div className="boot-right">
            <div style={{ height: '40%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
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

            <div style={{ height: '30%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { label: "KERNEL MODULE", val: progress1 },
                  { label: "CRYPTO ENGINE", val: progress2 },
                  { label: "NET INTERFACE", val: progress3 },
                  { label: "SYS MONITOR  ", val: progress4 }
                ].map((bar, i) => {
                  const { filled, empty } = renderBarParts(bar.val, 20);
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
                  );
                })}
              </div>
            </div>

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
      )}

      {stage === 3 && (
        <div className="boot-seq-root relative">
          {stage3Step === 'black' && <div className="stage3-container"></div>}
          
          {stage3Step === 'name' && (
            <div className="stage3-container">
              <div className="stage3-name-container">
                <div className="stage3-app-name">N E X T E R M</div>
                <div className="stage3-app-sub">TERMINAL INTERFACE v1.0.0</div>
              </div>
            </div>
          )}
          
          {stage3Step === 'wipe' && (
            <div className="stage3-wipe-container">
              <div className="stage3-half-top"></div>
              <div className="stage3-half-bottom"></div>
              <div className="stage3-shoot-line"></div>
              <div className="stage3-load-bar"></div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

import { useSysInfo } from '../hooks/useSysInfo'

export default function SysStats() {
  const sysInfo = useSysInfo()

  if (!sysInfo) {
    return (
      <div className="h-full flex items-center justify-center" style={{ color: 'var(--text-dim)', fontSize: '12px' }}>
        LOADING TELEMETRY...
      </div>
    )
  }

  const { cpu, ram, network, processes } = sysInfo

  const ramUsedGB = (ram.used / 1024 / 1024 / 1024).toFixed(2)
  const ramTotalGB = (ram.total / 1024 / 1024 / 1024).toFixed(2)
  const ramPercent = (ram.used / ram.total) * 100

  // Colors based on requested thresholds
  const cpuColor = cpu > 80 ? 'var(--warning)' : 'var(--bar-fill)'
  const ramColor = ramPercent > 80 ? 'var(--warning)' : 'var(--bar-fill)'

  return (
    <div className="flex flex-col h-full bg-[var(--bg-panel)] w-full select-none">
      <div 
        className="uppercase tracking-[3px] border-b border-[var(--border-color)] bg-[var(--bg-primary)] px-2.5 py-1"
        style={{ fontSize: '10px', color: 'var(--text-accent)' }}
      >
        // SYSMON
      </div>

      <div className="p-3 flex flex-col space-y-4">
        {/* CPU section */}
        <div>
          <div className="flex justify-between items-end mb-1">
            <span style={{ fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '2px' }}>CPU LOAD</span>
            <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{cpu.toFixed(1)}%</span>
          </div>
          <div style={{ height: '4px', background: 'var(--bar-bg)', width: '100%' }}>
            <div style={{ height: '4px', background: cpuColor, width: `${cpu}%` }}></div>
          </div>
        </div>

        {/* RAM section */}
        <div>
          <div className="flex justify-between items-end mb-1">
            <span style={{ fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '2px' }}>MEMORY</span>
            <div style={{ fontSize: '12px' }}>
              <span style={{ color: 'var(--text-primary)' }}>{ramUsedGB} GB</span>
              <span style={{ color: 'var(--text-dim)', marginLeft: '4px' }}>/ {ramTotalGB} GB</span>
            </div>
          </div>
          <div style={{ height: '4px', background: 'var(--bar-bg)', width: '100%' }}>
            <div style={{ height: '4px', background: ramColor, width: `${ramPercent}%` }}></div>
          </div>
        </div>

        {/* Network section */}
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '2px', marginBottom: '4px' }}>NETWORK</div>
          <div className="flex justify-between text-[12px]">
            <div>
              <span style={{ color: 'var(--text-primary)' }}>{(network.rx / 1024).toFixed(1)}</span>
              <span style={{ color: 'var(--text-dim)', marginLeft: '4px' }}>KB/s ↓</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-primary)' }}>{(network.tx / 1024).toFixed(1)}</span>
              <span style={{ color: 'var(--text-dim)', marginLeft: '4px' }}>KB/s ↑</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Tasks */}
      <div className="flex-1 flex flex-col min-h-0 border-t border-[var(--border-color)]">
        <div style={{ fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '2px', padding: '8px 12px 4px' }}>
          TOP TASKS
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-2 text-[12px]">
          {processes.map((p, i) => (
            <div key={i} className="flex justify-between py-0.5">
              <span style={{ color: 'var(--text-primary)' }} className="truncate pr-2">{p.name}</span>
              <span style={{ color: 'var(--text-dim)' }}>{p.cpu.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

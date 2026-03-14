import { useState, useEffect } from 'react'

export interface ProcessInfo {
  name: string
  cpu: number
  mem: number
}

export interface SysInfo {
  cpu: number
  ram: { used: number; total: number; percent: number }
  network: { rx: number; tx: number }
  processes: ProcessInfo[]
}

export function useSysInfo() {
  const [sysInfo, setSysInfo] = useState<SysInfo | null>(null)

  useEffect(() => {
    if (!window.electronAPI) return

    const cleanup = window.electronAPI.sysinfo.onUpdate((data: SysInfo) => {
      setSysInfo(data)
    })

    return cleanup
  }, [])

  return sysInfo
}

import si from 'systeminformation'
import { BrowserWindow } from 'electron'

export function setupSysInfoPolling(mainWindow: BrowserWindow): () => void {
  let intervalId: NodeJS.Timeout | null = null;
  let isPolling = false;

  async function poll() {
    if (isPolling) return;
    isPolling = true;

    try {
      const [cpu, mem, network, processes] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.networkStats(),
        si.processes()
      ])

      const defaultNet = network[0] || {}

      const stats = {
        cpu: {
          usage: cpu.currentLoad
        },
        ram: {
          used: mem.active,
          total: mem.total
        },
        network: {
          rx: defaultNet.rx_sec || 0,
          tx: defaultNet.tx_sec || 0
        },
        processes: processes.list
          .sort((a, b) => b.cpu - a.cpu)
          .slice(0, 5)
          .map(p => ({ name: p.name, cpu: p.cpu }))
      }

      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('sysinfo:update', stats)
      }
    } catch (e) {
      console.error('Sysinfo poll error', e)
    } finally {
      isPolling = false;
    }
  }

  intervalId = setInterval(poll, 1000)

  // cleanup
  return () => {
    if (intervalId) clearInterval(intervalId)
  }
}

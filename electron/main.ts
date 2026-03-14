import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import os from 'os'
import * as pty from 'node-pty'
import si from 'systeminformation'
import fs from 'fs'

const isDev = process.env.NODE_ENV !== 'production'

let mainWindow: BrowserWindow | null = null
const ptys: Record<string, pty.IPty> = {}
let sysInfoInterval: NodeJS.Timeout | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    fullscreen: true,
    frame: false,
    backgroundColor: '#0d1117',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false // Required for node-pty in some setups depending on preload needs
    },
  })

  if (isDev) {
    if (process.env.VITE_DEV_SERVER_URL) {
      mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    } else {
      mainWindow.loadURL('http://localhost:5173')
    }
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    if (sysInfoInterval) clearInterval(sysInfoInterval)
    Object.values(ptys).forEach(p => p.kill())
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()

  // Terminal IPC
  const shell = os.platform() === 'win32' ? 'powershell.exe' : (process.env.SHELL || '/bin/bash')
  
  ipcMain.on('terminal:create', (event, id: string, cols: number = 80, rows: number = 24) => {
    if (ptys[id]) {
      ptys[id].kill()
    }
    const ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-color',
      cols: cols,
      rows: rows,
      cwd: process.env.HOME || os.homedir(),
      env: process.env as Record<string, string>
    })
    
    ptys[id] = ptyProcess

    ptyProcess.onData((data) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send(`terminal:output:${id}`, data)
      }
    })

    ptyProcess.onExit((e) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send(`terminal:exit:${id}`, e)
      }
      delete ptys[id]
    })
  })

  ipcMain.on('terminal:input', (event, id: string, data: string) => {
    if (ptys[id]) {
      ptys[id].write(data)
    }
  })

  ipcMain.on('terminal:resize', (event, id: string, cols: number, rows: number) => {
    if (ptys[id]) {
      try { ptys[id].resize(cols, rows) } catch (e) {}
    }
  })

  ipcMain.on('terminal:kill', (event, id: string) => {
    if (ptys[id]) {
      ptys[id].kill()
      delete ptys[id]
    }
  })

  // System Info IPC
  let isPolling = false
  sysInfoInterval = setInterval(async () => {
    if (isPolling || !mainWindow || mainWindow.isDestroyed()) return
    isPolling = true
    try {
      const [cpu, mem, network, processes] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.networkStats(),
        si.processes()
      ])

      const defaultNet = network[0] || {}
      
      const payload = {
        cpu: cpu.currentLoad,
        ram: {
          used: mem.active,
          total: mem.total,
          percent: (mem.active / mem.total) * 100
        },
        network: {
          rx: defaultNet.rx_sec || 0,
          tx: defaultNet.tx_sec || 0
        },
        processes: processes.list
          .sort((a, b) => b.cpu - a.cpu)
          .slice(0, 5)
          .map(p => ({
            name: p.name,
            cpu: p.cpu,
            mem: p.mem
          }))
      }

      mainWindow.webContents.send('sysinfo:update', payload)
    } catch (e) {
      console.error(e)
    } finally {
      isPolling = false
    }
  }, 1000)

  // File System IPC
  ipcMain.handle('fs:readdir', async (event, dirPath: string) => {
    try {
      const realPath = dirPath || os.homedir()
      const files = await fs.promises.readdir(realPath, { withFileTypes: true })
      return files.map(f => ({ 
        name: f.name, 
        isDirectory: f.isDirectory(),
        path: path.join(realPath, f.name)
      }))
    } catch (e) {
      return []
    }
  })

  ipcMain.handle('fs:homedir', () => os.homedir())

  // App IPC
  ipcMain.handle('app:getInfo', async () => {
    const interfaces = os.networkInterfaces()
    let ip = '127.0.0.1'
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]!) {
        if (iface.family === 'IPv4' && !iface.internal) {
          ip = iface.address
          break
        }
      }
      if (ip !== '127.0.0.1') break
    }

    return {
      hostname: os.hostname(),
      ip,
      platform: os.platform(),
      version: app.getVersion()
    }
  })

  ipcMain.handle('app:quit', () => {
    app.quit()
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

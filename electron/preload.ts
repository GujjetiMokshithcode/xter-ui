import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  terminal: {
    create: (id: string, cols?: number, rows?: number) => ipcRenderer.send('terminal:create', id, cols, rows),
    input: (id: string, data: string) => ipcRenderer.send('terminal:input', id, data),
    resize: (id: string, cols: number, rows: number) => ipcRenderer.send('terminal:resize', id, cols, rows),
    kill: (id: string) => ipcRenderer.send('terminal:kill', id),
    onOutput: (id: string, callback: (data: string) => void) => {
      const handler = (_event: any, data: string) => callback(data)
      const channel = `terminal:output:${id}`
      ipcRenderer.on(channel, handler)
      return () => { ipcRenderer.removeListener(channel, handler) }
    },
    onExit: (id: string, callback: (code: number) => void) => {
      const handler = (_event: any, code: number) => callback(code)
      const channel = `terminal:exit:${id}`
      ipcRenderer.on(channel, handler)
      return () => { ipcRenderer.removeListener(channel, handler) }
    }
  },
  
  sysinfo: {
    onUpdate: (callback: (data: any) => void) => {
      const handler = (_event: any, data: any) => callback(data)
      ipcRenderer.on('sysinfo:update', handler)
      return () => { ipcRenderer.removeListener('sysinfo:update', handler) }
    }
  },

  fs: {
    readdir: (path: string) => ipcRenderer.invoke('fs:readdir', path),
    homedir: () => ipcRenderer.invoke('fs:homedir')
  },

  app: {
    quit: () => ipcRenderer.invoke('app:quit'),
    getInfo: () => ipcRenderer.invoke('app:getInfo')
  }
})

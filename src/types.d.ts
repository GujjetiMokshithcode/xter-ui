export interface AppInfo {
  hostname: string
  ip: string
  platform: string
  version: string
}

export interface FileItem {
  name: string
  isDirectory: boolean
  path: string
}

export interface ElectronAPI {
  terminal: {
    create: (id: string, cols?: number, rows?: number) => void
    input: (id: string, data: string) => void
    resize: (id: string, cols: number, rows: number) => void
    kill: (id: string) => void
    onOutput: (id: string, callback: (data: string) => void) => () => void
    onExit: (id: string, callback: (code: number) => void) => () => void
  }
  sysinfo: {
    onUpdate: (callback: (data: any) => void) => () => void
  }
  fs: {
    readdir: (path: string) => Promise<FileItem[]>
    homedir: () => Promise<string>
  }
  app: {
    quit: () => Promise<void>
    getInfo: () => Promise<AppInfo>
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const pty = __importStar(require("node-pty"));
const systeminformation_1 = __importDefault(require("systeminformation"));
const fs_1 = __importDefault(require("fs"));
const isDev = process.env.NODE_ENV !== 'production';
let mainWindow = null;
const ptys = {};
let sysInfoInterval = null;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1280,
        height: 720,
        fullscreen: true,
        frame: false,
        backgroundColor: '#0d1117',
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false // Required for node-pty in some setups depending on preload needs
        },
    });
    if (isDev) {
        if (process.env.VITE_DEV_SERVER_URL) {
            mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
        }
        else {
            mainWindow.loadURL('http://localhost:5173');
        }
    }
    else {
        mainWindow.loadFile(path_1.default.join(__dirname, '../dist/index.html'));
    }
    mainWindow.on('closed', () => {
        if (sysInfoInterval)
            clearInterval(sysInfoInterval);
        Object.values(ptys).forEach(p => p.kill());
        mainWindow = null;
    });
}
electron_1.app.whenReady().then(() => {
    createWindow();
    // Terminal IPC
    const shell = os_1.default.platform() === 'win32' ? 'powershell.exe' : (process.env.SHELL || '/bin/bash');
    electron_1.ipcMain.on('terminal:create', (event, id, cols = 80, rows = 24) => {
        if (ptys[id]) {
            ptys[id].kill();
        }
        const ptyProcess = pty.spawn(shell, [], {
            name: 'xterm-color',
            cols: cols,
            rows: rows,
            cwd: process.env.HOME || os_1.default.homedir(),
            env: process.env
        });
        ptys[id] = ptyProcess;
        ptyProcess.onData((data) => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send(`terminal:output:${id}`, data);
            }
        });
        ptyProcess.onExit((e) => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send(`terminal:exit:${id}`, e);
            }
            delete ptys[id];
        });
    });
    electron_1.ipcMain.on('terminal:input', (event, id, data) => {
        if (ptys[id]) {
            ptys[id].write(data);
        }
    });
    electron_1.ipcMain.on('terminal:resize', (event, id, cols, rows) => {
        if (ptys[id]) {
            try {
                ptys[id].resize(cols, rows);
            }
            catch (e) { }
        }
    });
    electron_1.ipcMain.on('terminal:kill', (event, id) => {
        if (ptys[id]) {
            ptys[id].kill();
            delete ptys[id];
        }
    });
    // System Info IPC
    let isPolling = false;
    sysInfoInterval = setInterval(async () => {
        if (isPolling || !mainWindow || mainWindow.isDestroyed())
            return;
        isPolling = true;
        try {
            const [cpu, mem, network, processes] = await Promise.all([
                systeminformation_1.default.currentLoad(),
                systeminformation_1.default.mem(),
                systeminformation_1.default.networkStats(),
                systeminformation_1.default.processes()
            ]);
            const defaultNet = network[0] || {};
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
            };
            mainWindow.webContents.send('sysinfo:update', payload);
        }
        catch (e) {
            console.error(e);
        }
        finally {
            isPolling = false;
        }
    }, 1000);
    // File System IPC
    electron_1.ipcMain.handle('fs:readdir', async (event, dirPath) => {
        try {
            const realPath = dirPath || os_1.default.homedir();
            const files = await fs_1.default.promises.readdir(realPath, { withFileTypes: true });
            return files.map(f => ({
                name: f.name,
                isDirectory: f.isDirectory(),
                path: path_1.default.join(realPath, f.name)
            }));
        }
        catch (e) {
            return [];
        }
    });
    electron_1.ipcMain.handle('fs:homedir', () => os_1.default.homedir());
    // App IPC
    electron_1.ipcMain.handle('app:getInfo', async () => {
        const interfaces = os_1.default.networkInterfaces();
        let ip = '127.0.0.1';
        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name]) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    ip = iface.address;
                    break;
                }
            }
            if (ip !== '127.0.0.1')
                break;
        }
        return {
            hostname: os_1.default.hostname(),
            ip,
            platform: os_1.default.platform(),
            version: electron_1.app.getVersion()
        };
    });
    electron_1.ipcMain.handle('app:quit', () => {
        electron_1.app.quit();
    });
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});

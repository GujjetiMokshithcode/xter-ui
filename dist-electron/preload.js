"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    terminal: {
        create: (id, cols, rows) => electron_1.ipcRenderer.send('terminal:create', id, cols, rows),
        input: (id, data) => electron_1.ipcRenderer.send('terminal:input', id, data),
        resize: (id, cols, rows) => electron_1.ipcRenderer.send('terminal:resize', id, cols, rows),
        kill: (id) => electron_1.ipcRenderer.send('terminal:kill', id),
        onOutput: (id, callback) => {
            const handler = (_event, data) => callback(data);
            const channel = `terminal:output:${id}`;
            electron_1.ipcRenderer.on(channel, handler);
            return () => { electron_1.ipcRenderer.removeListener(channel, handler); };
        },
        onExit: (id, callback) => {
            const handler = (_event, code) => callback(code);
            const channel = `terminal:exit:${id}`;
            electron_1.ipcRenderer.on(channel, handler);
            return () => { electron_1.ipcRenderer.removeListener(channel, handler); };
        }
    },
    sysinfo: {
        onUpdate: (callback) => {
            const handler = (_event, data) => callback(data);
            electron_1.ipcRenderer.on('sysinfo:update', handler);
            return () => { electron_1.ipcRenderer.removeListener('sysinfo:update', handler); };
        }
    },
    fs: {
        readdir: (path) => electron_1.ipcRenderer.invoke('fs:readdir', path),
        homedir: () => electron_1.ipcRenderer.invoke('fs:homedir')
    },
    app: {
        quit: () => electron_1.ipcRenderer.invoke('app:quit'),
        getInfo: () => electron_1.ipcRenderer.invoke('app:getInfo')
    }
});

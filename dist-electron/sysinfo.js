"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSysInfoPolling = setupSysInfoPolling;
const systeminformation_1 = __importDefault(require("systeminformation"));
function setupSysInfoPolling(mainWindow) {
    let intervalId = null;
    let isPolling = false;
    async function poll() {
        if (isPolling)
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
            };
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('sysinfo:update', stats);
            }
        }
        catch (e) {
            console.error('Sysinfo poll error', e);
        }
        finally {
            isPolling = false;
        }
    }
    intervalId = setInterval(poll, 1000);
    // cleanup
    return () => {
        if (intervalId)
            clearInterval(intervalId);
    };
}

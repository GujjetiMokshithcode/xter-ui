import { useEffect, useState } from 'react'

export default function FileBrowser() {
  const [items, setItems] = useState<{name: string, isDirectory: boolean, path: string}[]>([])
  
  useEffect(() => {
    // Generate fake file/folder items for UI matching
    const mockItems = [
      { name: 'Show disks', isDirectory: true, path: '' },
      { name: 'Go up', isDirectory: true, path: '' },
      { name: 'blob_storage', isDirectory: true, path: '' },
      { name: 'Cache', isDirectory: true, path: '' },
      { name: 'databases', isDirectory: true, path: '' },
      { name: 'fonts', isDirectory: true, path: '' },
      { name: 'GPUCache', isDirectory: true, path: '' },
      { name: 'IndexedDB', isDirectory: true, path: '' },
      { name: 'keyboards', isDirectory: true, path: '' },
      { name: 'Local Storage', isDirectory: true, path: '' },
      { name: 'themes', isDirectory: true, path: '' },
      { name: 'webrtc_even...', isDirectory: true, path: '' },
      { name: 'SingletonCo...', isDirectory: false, path: '' },
      { name: 'SingletonLock', isDirectory: false, path: '' },
      { name: 'SS', isDirectory: false, path: '' },
      { name: 'Cookies', isDirectory: false, path: '' },
      { name: 'config.json', isDirectory: false, path: '' },
      { name: 'log.txt', isDirectory: false, path: '' },
      { name: 'settings.ini', isDirectory: false, path: '' }
    ]
    setItems(mockItems)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <style>{`
        .fs-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          padding: 10px;
          gap: 10px 0;
          overflow-y: auto;
          flex: 1;
        }
        .fs-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 45px;
          margin: 0 auto;
          cursor: pointer;
        }
        .fs-item:hover {
          background: #001a00;
        }
        .fs-icon-wrap {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: monospace;
          font-size: 24px;
        }
        .fs-icon-folder { color: #1f8a1f; }
        .fs-icon-file { color: #0f6a0f; }
        
        .fs-name {
          font-size: 9px;
          color: #3a8a3a;
          margin-top: 4px;
          max-width: 45px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          text-align: center;
        }
      `}</style>
      
      <div className="panel-header">
        FILESYSTEM
        <span style={{ float: 'right', textTransform: 'none' }}>/home/squared/...</span>
      </div>

      <div className="fs-grid">
        {items.map((it, idx) => (
          <div key={idx} className="fs-item" title={it.name}>
            <div className={`fs-icon-wrap ${it.isDirectory ? 'fs-icon-folder' : 'fs-icon-file'}`}>
               {it.isDirectory ? '📁' : '📄'}
            </div>
            <div className="fs-name">{it.name}</div>
          </div>
        ))}
      </div>

      <div style={{
        height: '22px', borderTop: '1px solid #0f3a0f', background: '#000800',
        display: 'flex', alignItems: 'center', padding: '0 10px',
        fontSize: '9px', color: '#1f6a1f'
      }}>
        Mount /home/squared used 71%
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import type { FileItem } from '../types'

export default function FileBrowser() {
  const [cwd, setCwd] = useState<string>('')
  const [files, setFiles] = useState<FileItem[]>([])
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    if (!window.electronAPI) return
    window.electronAPI.fs.homedir().then(path => {
      setCwd(path)
      loadFiles(path)
    })
  }, [])

  const loadFiles = async (dir: string) => {
    if (!window.electronAPI) return
    try {
      const items = await window.electronAPI.fs.readdir(dir)
      setFiles(items.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      }))
    } catch(e) { /* ignore restricted folders */ }
  }

  const navigateTo = (targetPath: string) => {
    setCwd(targetPath)
    loadFiles(targetPath)
  }

  const navigateUp = () => {
    // Basic cross-platform parent dir parsing
    const parts = cwd.split(/[/\\]/).filter(Boolean)
    if (parts.length > 0) {
      if (cwd.startsWith('/')) { // unix
        const newPath = '/' + parts.slice(0, -1).join('/')
        navigateTo(newPath || '/')
      } else { // windows
        const newPath = parts.slice(0, -1).join('\\')
        // naive MVP root handle for windows `C:` vs `C:\`
        if (parts.length === 1) navigateTo(parts[0] + '\\')
        else navigateTo(newPath)
      }
    }
  }

  const breadcrumbs = cwd.split(/[/\\]/).filter(Boolean).join(' / ') || '/'

  return (
    <div className="flex flex-col h-full bg-[var(--bg-panel)] w-full select-none">
      <div 
        className="uppercase tracking-[3px] border-b border-[var(--border-color)] bg-[var(--bg-primary)] px-2.5 py-1"
        style={{ fontSize: '10px', color: 'var(--text-accent)' }}
      >
        // FILESYSTEM
      </div>
      
      <div 
        className="px-2 py-1 border-b border-[var(--border-color)] truncate"
        style={{ fontSize: '10px', color: 'var(--border-active)' }}
      >
        / {breadcrumbs}
      </div>

      <div className="flex-1 overflow-y-auto w-full">
        <div 
          className="flex items-center px-2 cursor-pointer transition-none"
          style={{ 
            height: '20px', 
            fontSize: '12px', 
            color: 'var(--text-primary)',
            background: hoveredIndex === -1 ? 'var(--bg-hover)' : 'transparent' 
          }}
          onClick={navigateUp}
          onMouseEnter={() => setHoveredIndex(-1)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <span style={{ color: 'var(--text-accent)', marginRight: '4px' }}>▶ </span>
          <span>..</span>
        </div>
        
        {files.map((file, i) => (
          <div 
            key={i} 
            className="flex items-center px-2 cursor-pointer transition-none truncate"
            style={{ 
              height: '20px', 
              fontSize: '12px', 
              color: 'var(--text-primary)',
              background: hoveredIndex === i ? 'var(--bg-hover)' : 'transparent'
            }}
            onClick={() => file.isDirectory && navigateTo(file.path)}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <span style={{ color: file.isDirectory ? 'var(--text-accent)' : 'var(--text-dim)', marginRight: '4px', whiteSpace: 'pre' }}>
              {file.isDirectory ? '▶ ' : '  '}
            </span>
            <span>{file.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

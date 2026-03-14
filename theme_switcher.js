import fs from 'fs';
import path from 'path';

const colorMap = {
  '#0d1117': '#000000',
  '#080c10': '#000a00',
  '#0a0f14': '#051405',
  '#050810': '#000800',
  '#1a2a35': '#0f3a0f',
  '#1e3a4a': '#144a14',
  '#1a3a4a': '#0f4a0f',
  '#0d2a35': '#002a00',
  '#1a4a5a': '#0f5a0f',
  '#2a6a7a': '#1f8a1f',
  '#2a5a6a': '#1f6a1f',
  '#7a9aaa': '#4aaa4a',
  '#6a8a9a': '#3a8a3a',
  '#8ab4be': '#5aca5a',
  '#9ab4be': '#6aba6a',
  '#4a7a8a': '#2a8a2a',
  '#1a5a6a': '#0f6a0f',
  '#0d1a20': '#001a00',
  '#0d1520': '#001500',
  '#1a5a4a': '#0f7a0f',
  '#1a4a3a': '#0f5a0f',
  '#2a4a5a': '#1f5a1f',
  '#1a5a3a': '#0f8a0f',
  '#1a3a5a': '#0f4a0f',
  '#2a6a5a': '#1f8a1f',
  'rgba(26, 74, 58, 0.5)': 'rgba(26, 114, 26, 0.5)'
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const [blue, green] of Object.entries(colorMap)) {
    // case insensitive match
    const regex = new RegExp(blue, 'gi');
    if (regex.test(content)) {
      content = content.replace(regex, green);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated theme colors in ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') && !fullPath.includes('BootSequence.tsx')) {
      processFile(fullPath);
    }
  }
}

walkDir(path.join(process.cwd(), 'src'));

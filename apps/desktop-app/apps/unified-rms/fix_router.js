import fs from 'fs';
import path from 'path';

const modulesPath = '/root/call/apps/desktop-app/apps/unified-rms/src/modules';

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace react-router-dom useNavigate alias with custom hook
  content = content.replace(/import\s+{\s*useNavigate\s+as\s+useRouter\s*}\s+from\s+["']react-router-dom["'];?/g, '');
  
  if (originalContent !== content) {
    // Add import to top
    // calculate relative path to hooks
    const depth = filePath.split('src/')[1].split('/').length - 1;
    const prefix = Array(depth).fill('..').join('/');
    const hookImport = `import { useRouter } from "${prefix}/hooks/useRouter";\n`;
    content = hookImport + content;
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  }
}

traverse(modulesPath);

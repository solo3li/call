import fs from 'fs';
const files = [
  'src/views/ManagementPages.tsx',
  'src/views/PublicMenuView.tsx',
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Remove framer-motion imports
  content = content.replace(/import\s+\{([^}]*motion[^}]*)\}\s+from\s+['"]framer-motion['"];?\n?/g, (match, p1) => {
    // Check if AnimatePresence is also imported, remove the whole import
    return '';
  });
  content = content.replace(/import\s+\{.*AnimatePresence.*\}\s+from\s+['"]framer-motion['"];?\n?/g, '');
  
  // Replace <motion.div with <div
  content = content.replace(/<motion\.([a-zA-Z0-9]+)/g, '<$1');
  content = content.replace(/<\/motion\.([a-zA-Z0-9]+)>/g, '</$1>');
  
  // Remove AnimatePresence wrapper completely or replace with React Fragment
  content = content.replace(/<AnimatePresence[^>]*>/g, '');
  content = content.replace(/<\/AnimatePresence>/g, '');

  // Remove layoutId="...", layout, initial={{...}}, animate={{...}}, exit={{...}}, whileHover={{...}}, whileTap={{...}}, transition={{...}}
  // We need to be careful with nested brackets. Since we can't easily parse nested brackets with regex, 
  // we'll match simple cases or just use a custom bracket matching function.

  let result = '';
  let i = 0;
  while (i < content.length) {
    let match = content.slice(i).match(/^(initial|animate|exit|whileHover|whileTap|transition|variants)=/);
    if (match) {
      // Find the opening brace
      let openBraceIdx = content.indexOf('{', i + match[0].length);
      if (openBraceIdx !== -1 && openBraceIdx < i + 20) { // Should be immediately after
        let braceCount = 1;
        let j = openBraceIdx + 1;
        while (j < content.length && braceCount > 0) {
          if (content[j] === '{') braceCount++;
          if (content[j] === '}') braceCount--;
          j++;
        }
        i = j; // Skip past the closing brace
        continue;
      }
    }
    
    // Also remove layoutId="..."
    let matchLayoutId = content.slice(i).match(/^layoutId=['"][^'"]*['"]/);
    if (matchLayoutId) {
      i += matchLayoutId[0].length;
      continue;
    }
    
    // Also remove `layout `
    let matchLayout = content.slice(i).match(/^layout(\s|>)/);
    if (matchLayout) {
      i += "layout".length;
      continue;
    }

    result += content[i];
    i++;
  }

  // Final cleanup for any leftover spaces before `>`
  result = result.replace(/\s+>/g, '>');

  fs.writeFileSync(file, result);
}
console.log('Stripped framer-motion precisely');

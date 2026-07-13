const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // Replace invalid tailwind opacities
  content = content.replace(/(bg|border|text|ring|shadow)-([a-zA-Z0-9]+-[0-9]+)\/15\b/g, '$1-$2/20');
  content = content.replace(/(bg|border|text|ring|shadow)-([a-zA-Z0-9]+-[0-9]+)\/8\b/g, '$1-$2/10');
  content = content.replace(/(bg|border|text|ring|shadow)-([a-zA-Z0-9]+-[0-9]+)\/6\b/g, '$1-$2/5');
  content = content.replace(/(bg|border|text|ring|shadow)-([a-zA-Z0-9]+-[0-9]+)\/7\b/g, '$1-$2/10');
  
  // Generic colors like white/15, black/8
  content = content.replace(/(bg|border|text|ring|shadow)-(white|black)\/15\b/g, '$1-$2/20');
  content = content.replace(/(bg|border|text|ring|shadow)-(white|black)\/8\b/g, '$1-$2/10');
  content = content.replace(/(bg|border|text|ring|shadow)-(white|black)\/6\b/g, '$1-$2/5');
  content = content.replace(/(bg|border|text|ring|shadow)-(white|black)\/7\b/g, '$1-$2/10');

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log('Fixed ' + filePath);
  }
}

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  });
}

walk('./app');
walk('./components');

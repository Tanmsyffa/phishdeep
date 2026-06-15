const fs = require('fs');

function processFile(path) {
  let content;
  try {
    content = fs.readFileSync(path, 'utf8');
  } catch(e) {
    console.log("File not found: " + path);
    return;
  }

  const replacements = [
    { regex: /\bbg-white(?!\sdark:)/g, replacement: 'bg-white dark:bg-slate-900' },
    { regex: /\btext-gray-900(?!\sdark:)/g, replacement: 'text-gray-900 dark:text-white' },
    { regex: /\btext-gray-800(?!\sdark:)/g, replacement: 'text-gray-800 dark:text-gray-200' },
    { regex: /\btext-gray-500(?!\sdark:)/g, replacement: 'text-gray-500 dark:text-gray-400' },
    { regex: /\bborder-gray-200(?!\sdark:)/g, replacement: 'border-gray-200 dark:border-slate-700' },
    { regex: /\bborder-gray-100(?!\sdark:)/g, replacement: 'border-gray-100 dark:border-slate-700' },
    { regex: /\bbg-gray-50(?!\sdark:)/g, replacement: 'bg-gray-50 dark:bg-slate-800' },
    { regex: /\bbg-gray-100(?!\sdark:)/g, replacement: 'bg-gray-100 dark:bg-slate-800' },
    { regex: /\bbg-gray-200(?!\sdark:)/g, replacement: 'bg-gray-200 dark:bg-slate-700' },
    { regex: /\btext-gray-400(?!\sdark:)/g, replacement: 'text-gray-400 dark:text-gray-500' },
    { regex: /\bbg-blue-50(?!\sdark:)/g, replacement: 'bg-blue-50 dark:bg-blue-500/20' },
    { regex: /\bbg-red-50(?!\sdark:)/g, replacement: 'bg-red-50 dark:bg-red-500/20' },
    { regex: /\bbg-green-50(?!\sdark:)/g, replacement: 'bg-green-50 dark:bg-green-500/20' },
    { regex: /\bbg-yellow-50(?!\sdark:)/g, replacement: 'bg-yellow-50 dark:bg-yellow-500/20' },
    { regex: /\btext-gray-600(?!\sdark:)/g, replacement: 'text-gray-600 dark:text-gray-300' },
    { regex: /\btext-gray-700(?!\sdark:)/g, replacement: 'text-gray-700 dark:text-gray-300' },
    { regex: /\bborder-blue-100(?!\sdark:)/g, replacement: 'border-blue-100 dark:border-blue-800' },
    { regex: /\btext-blue-600(?!\sdark:)/g, replacement: 'text-blue-600 dark:text-blue-400' },
    { regex: /\btext-blue-700(?!\sdark:)/g, replacement: 'text-blue-700 dark:text-blue-400' },
    { regex: /\bbg-blue-100(?!\sdark:)/g, replacement: 'bg-blue-100 dark:bg-blue-500/40' },
  ];

  let newContent = content;
  replacements.forEach(r => {
    newContent = newContent.replace(r.regex, r.replacement);
  });

  if (content !== newContent) {
    fs.writeFileSync(path, newContent);
    console.log('Processed ' + path);
  }
}

processFile('app/(dashboard)/scan/page.tsx');
processFile('app/(dashboard)/settings/page.tsx');
processFile('app/(dashboard)/help/page.tsx');

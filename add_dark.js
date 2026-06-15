const fs = require('fs');

function processFile(path) {
  let content = fs.readFileSync(path, 'utf8');

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
    { regex: /\btext-gray-400(?!\sdark:)/g, replacement: 'text-gray-400 dark:text-gray-500' }
  ];

  replacements.forEach(r => {
    content = content.replace(r.regex, r.replacement);
  });

  fs.writeFileSync(path, content);
  console.log('Processed ' + path);
}

processFile('app/(dashboard)/reports/page.tsx');
processFile('app/(dashboard)/history/page.tsx');

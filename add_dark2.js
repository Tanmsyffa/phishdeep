const fs = require('fs');

function processFile(path) {
  let content = fs.readFileSync(path, 'utf8');

  const replacements = [
    { regex: /\bbg-blue-50(?!\sdark:)/g, replacement: 'bg-blue-50 dark:bg-blue-900/20' },
    { regex: /\bbg-red-50(?!\sdark:)/g, replacement: 'bg-red-50 dark:bg-red-900/20' },
    { regex: /\bbg-green-50(?!\sdark:)/g, replacement: 'bg-green-50 dark:bg-green-900/20' },
    { regex: /\bbg-yellow-50(?!\sdark:)/g, replacement: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { regex: /\bbg-purple-50(?!\sdark:)/g, replacement: 'bg-purple-50 dark:bg-purple-900/20' },
    { regex: /\bbg-orange-50(?!\sdark:)/g, replacement: 'bg-orange-50 dark:bg-orange-900/20' },

    { regex: /\btext-gray-600(?!\sdark:)/g, replacement: 'text-gray-600 dark:text-gray-300' },
    { regex: /\btext-gray-700(?!\sdark:)/g, replacement: 'text-gray-700 dark:text-gray-300' },
    
    { regex: /\bborder-blue-100(?!\sdark:)/g, replacement: 'border-blue-100 dark:border-blue-800' },
    { regex: /\bborder-red-100(?!\sdark:)/g, replacement: 'border-red-100 dark:border-red-800' },
    { regex: /\bborder-green-100(?!\sdark:)/g, replacement: 'border-green-100 dark:border-green-800' },
    { regex: /\bborder-yellow-100(?!\sdark:)/g, replacement: 'border-yellow-100 dark:border-yellow-800' },
    { regex: /\bborder-purple-100(?!\sdark:)/g, replacement: 'border-purple-100 dark:border-purple-800' },
    { regex: /\bborder-orange-100(?!\sdark:)/g, replacement: 'border-orange-100 dark:border-orange-800' },

    { regex: /\btext-blue-600(?!\sdark:)/g, replacement: 'text-blue-600 dark:text-blue-400' },
    { regex: /\btext-red-600(?!\sdark:)/g, replacement: 'text-red-600 dark:text-red-400' },
    { regex: /\btext-green-600(?!\sdark:)/g, replacement: 'text-green-600 dark:text-green-400' },
    { regex: /\btext-yellow-600(?!\sdark:)/g, replacement: 'text-yellow-600 dark:text-yellow-400' },
    { regex: /\btext-purple-600(?!\sdark:)/g, replacement: 'text-purple-600 dark:text-purple-400' },
    
    { regex: /\btext-blue-700(?!\sdark:)/g, replacement: 'text-blue-700 dark:text-blue-400' },
    { regex: /\btext-red-700(?!\sdark:)/g, replacement: 'text-red-700 dark:text-red-400' },
    { regex: /\btext-green-700(?!\sdark:)/g, replacement: 'text-green-700 dark:text-green-400' },
    { regex: /\btext-yellow-700(?!\sdark:)/g, replacement: 'text-yellow-700 dark:text-yellow-400' },
    { regex: /\btext-purple-700(?!\sdark:)/g, replacement: 'text-purple-700 dark:text-purple-400' },
    
    { regex: /\bbg-blue-100(?!\sdark:)/g, replacement: 'bg-blue-100 dark:bg-blue-900/40' },
    { regex: /\bbg-red-100(?!\sdark:)/g, replacement: 'bg-red-100 dark:bg-red-900/40' },
    { regex: /\bbg-green-100(?!\sdark:)/g, replacement: 'bg-green-100 dark:bg-green-900/40' },
    { regex: /\bbg-yellow-100(?!\sdark:)/g, replacement: 'bg-yellow-100 dark:bg-yellow-900/40' },
    { regex: /\bbg-purple-100(?!\sdark:)/g, replacement: 'bg-purple-100 dark:bg-purple-900/40' },
  ];

  replacements.forEach(r => {
    content = content.replace(r.regex, r.replacement);
  });

  fs.writeFileSync(path, content);
  console.log('Processed ' + path);
}

processFile('app/(dashboard)/scan/[id]/page.tsx');
processFile('app/(dashboard)/dashboard/page.tsx');
processFile('app/(dashboard)/reports/page.tsx');
processFile('app/(dashboard)/history/page.tsx');

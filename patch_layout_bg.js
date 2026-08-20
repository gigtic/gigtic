const fs = require('fs');
const file = 'apps/web/app/layout.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /body className=\{\`\$\{inter\.className\} bg-\[#FAFAFA\] min-h-\[100dvh\] text-gray-900 pb-\[140px\] md:pb-0\`\}/,
  'body className={`${inter.className} bg-slate-50 min-h-[100dvh] text-slate-900 pb-[140px] md:pb-0 selection:bg-pink-200 selection:text-pink-900`}'
);

fs.writeFileSync(file, code);

const fs = require('fs');
const file = 'apps/web/app/create/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Container
code = code.replace(
  /className="bg-white rounded-3xl p-8 border-2 border-indigo-50\/50 shadow-\[0_8px_30px_rgb\(0,0,0,0.04\)\] min-h-\[600px\] flex flex-col relative overflow-hidden"/g,
  'className="bg-white rounded-[32px] p-8 border-2 border-indigo-100 shadow-[0_20px_40px_-15px_rgba(99,102,241,0.15)] min-h-[600px] flex flex-col relative overflow-hidden"'
);

// Progress bar
code = code.replace(
  /className="h-full bg-slate-800 rounded-full transition-all duration-500"/g,
  'className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 shadow-sm"'
);

// Option buttons
code = code.replace(
  /bg-black border-black text-white shadow-lg shadow-black\/10/g,
  'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-200 transform scale-105'
);

fs.writeFileSync(file, code);

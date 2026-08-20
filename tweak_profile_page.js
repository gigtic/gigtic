const fs = require('fs');
const file = 'apps/web/app/profile/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Container
code = code.replace(
  /className="bg-white rounded-3xl border-2 border-indigo-50\/50 shadow-\[0_8px_30px_rgb\(0,0,0,0.04\)\] overflow-hidden"/g,
  'className="bg-white rounded-[32px] border-2 border-indigo-100 shadow-[0_20px_40px_-15px_rgba(99,102,241,0.15)] overflow-hidden relative"'
);

// Header Gradient
code = code.replace(
  /className="h-32 bg-gradient-to-r from-slate-800 to-black relative"/g,
  'className="h-40 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative"'
);

// Save button
code = code.replace(
  /bg-black text-white rounded-full/g,
  'bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-200'
);
code = code.replace(
  /hover:bg-slate-800/g,
  'hover:bg-indigo-500'
);

fs.writeFileSync(file, code);

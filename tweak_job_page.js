const fs = require('fs');
const file = 'apps/web/app/job/[id]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// The main gig details container
code = code.replace(
  /className="bg-white p-8 rounded-3xl border-2 border-indigo-50\/50 shadow-\[0_8px_30px_rgb\(0,0,0,0.04\)\] mb-8"/g,
  'className="bg-white p-8 rounded-[32px] border-2 border-indigo-100 shadow-[0_20px_40px_-15px_rgba(99,102,241,0.15)] mb-8 relative overflow-hidden"'
);

// Map container
code = code.replace(
  /className="bg-white p-8 rounded-3xl border-2 border-indigo-50\/50 shadow-\[0_8px_30px_rgb\(0,0,0,0.04\)\]"/g,
  'className="bg-white p-8 rounded-[32px] border-2 border-indigo-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"'
);

// Sidebar containers
code = code.replace(
  /className="bg-white p-6 rounded-3xl border-2 border-indigo-50\/50 shadow-\[0_8px_30px_rgb\(0,0,0,0.04\)\]/g,
  'className="bg-white p-6 rounded-[32px] border-2 border-indigo-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
);

// Title typography
code = code.replace(
  /<h1 className="text-3xl sm:text-4xl font-black text-slate-800 mb-6 leading-tight">/g,
  '<h1 className="text-4xl sm:text-5xl font-black text-slate-800 mb-6 leading-tight tracking-tight">'
);

// Author block
code = code.replace(
  /className="w-12 h-12 rounded-full bg-slate-800 text-white flex items-center justify-center font-black text-lg"/g,
  'className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-black text-xl shadow-md"'
);

fs.writeFileSync(file, code);

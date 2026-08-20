const fs = require('fs');
const file = 'apps/web/app/explore/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /className="text-3xl font-black text-slate-900 tracking-tight"/g,
  'className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight"'
);

code = code.replace(
  /className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-full/g,
  'className="block w-full pl-11 pr-4 py-2 md:py-3 bg-slate-50 border border-slate-200 rounded-full'
);

code = code.replace(
  /className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6"/g,
  'className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 space-y-4 md:space-y-6"'
);

fs.writeFileSync(file, code);

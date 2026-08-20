const fs = require('fs');
let homePath = 'apps/web/app/page.tsx';
let homeCode = fs.readFileSync(homePath, 'utf8');

homeCode = homeCode.replace(
  /rounded-3xl hover:bg-indigo-500 active:scale-95 transition-all shadow-xl shadow-black\/10/g,
  'rounded-xl hover:bg-indigo-500 active:scale-95 transition-all shadow-md shadow-indigo-600/20'
);

homeCode = homeCode.replace(
  /bg-white border border-indigo-100\/50 p-6 rounded-3xl hover:border-black active:scale-95 transition-all shadow-\[0_8px_30px_rgb\(0,0,0,0\.04\)\]/g,
  'bg-white border border-gray-200 p-6 rounded-xl hover:border-gray-400 active:scale-95 transition-all shadow-sm'
);

homeCode = homeCode.replace(
  /bg-white rounded-3xl border-2 border-indigo-50\/50 p-8 shadow-\[0_8px_30px_rgb\(0,0,0,0\.04\)\]/g,
  'bg-white rounded-xl border border-gray-200 p-6 shadow-sm'
);

fs.writeFileSync(homePath, homeCode);

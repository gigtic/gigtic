const fs = require('fs');
const file = 'apps/web/app/explore/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Shrink Grid Gap
code = code.replace(
  /className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"/g,
  'className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6"'
);

// Shrink Padding
code = code.replace(
  /className="group bg-white rounded-xl border border-gray-200 p-4 shadow-sm/g,
  'className="group bg-white rounded-xl border border-gray-200 p-3 md:p-4 shadow-sm'
);

// Shrink Badges (SOS)
code = code.replace(
  /px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-xs font-black uppercase tracking-widest border-2/g,
  'px-2 py-0.5 md:px-3 md:py-1 bg-rose-100 text-rose-600 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider border'
);

// Shrink Badges (Category)
code = code.replace(
  /px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-extrabold border-2/g,
  'px-2 py-0.5 md:px-3 md:py-1 bg-blue-50 text-blue-600 rounded-full text-xs md:text-sm font-extrabold border'
);

// Shrink Date
code = code.replace(
  /text-xs font-bold text-slate-400/g,
  'text-[10px] md:text-xs font-bold text-gray-400'
);

// Shrink Meta Row Text
code = code.replace(
  /text-sm font-semibold text-gray-700 mb-4 pt-3 border-t border-gray-100/g,
  'text-xs md:text-sm font-semibold text-gray-700 mb-3 pt-2 md:pt-3 border-t border-gray-100'
);

// Shrink Meta Row Badges
code = code.replace(
  /bg-slate-50 px-3 py-1\.5 rounded-lg/g,
  'bg-gray-50 px-2 md:px-3 py-1 md:py-1.5 rounded-lg'
);

// Shrink Avatar
code = code.replace(
  /w-10 h-10 rounded-full bg-gradient-to-br/g,
  'w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br'
);

// Shrink Button
code = code.replace(
  /px-4 py-2 rounded-xl bg-slate-100 text-slate-900 font-bold text-sm/g,
  'px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl bg-gray-100 text-gray-900 font-bold text-xs md:text-sm'
);

// Shrink text colors on title and desc slightly
code = code.replace(
  /text-sm text-gray-600 line-clamp-2 mb-4/g,
  'text-xs md:text-sm text-gray-600 line-clamp-2 mb-3'
);
code = code.replace(
  /text-lg font-bold text-gray-900 mb-1/g,
  'text-base md:text-lg font-bold text-gray-900 mb-1'
);

fs.writeFileSync(file, code);

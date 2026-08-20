const fs = require('fs');

// 1. Update Explore Page
let explorePath = 'apps/web/app/explore/page.tsx';
let exploreCode = fs.readFileSync(explorePath, 'utf8');

exploreCode = exploreCode.replace(
  /className="group bg-white rounded-2xl md:rounded-\[32px\] border border-slate-100 md:border-2 p-5 md:p-6 shadow-sm hover:shadow-\[0_20px_40px_-15px_rgba\(99,102,241,0\.2\)\] hover:border-indigo-200 hover:-translate-y-2 transition-all duration-300 flex flex-col h-full overflow-hidden relative"/g,
  'className="group bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 flex flex-col h-full overflow-hidden relative"'
);

exploreCode = exploreCode.replace(
  /<div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"><\/div>/g,
  ''
);

exploreCode = exploreCode.replace(
  /text-2xl font-black text-slate-800 mb-2 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2 relative z-10 tracking-tight/g,
  'text-lg font-bold text-gray-900 mb-1 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2 relative z-10'
);

exploreCode = exploreCode.replace(
  /text-sm text-slate-500 font-medium line-clamp-3 mb-6 flex-1/g,
  'text-sm text-gray-600 line-clamp-2 mb-4 flex-1'
);

exploreCode = exploreCode.replace(
  /flex items-center gap-4 text-sm font-semibold text-slate-700 mb-6 pt-4 border-t border-slate-100/g,
  'flex items-center gap-4 text-sm font-semibold text-gray-700 mb-4 pt-3 border-t border-gray-100'
);

fs.writeFileSync(explorePath, exploreCode);

// 2. Update Job Details Page
let jobPath = 'apps/web/app/job/[id]/page.tsx';
let jobCode = fs.readFileSync(jobPath, 'utf8');

jobCode = jobCode.replace(
  /bg-white p-5 md:p-8 rounded-2xl md:rounded-\[32px\] border md:border-2 border-indigo-100 shadow-\[0_8px_30px_rgb\(0,0,0,0\.04\)\]/g,
  'bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm'
);

jobCode = jobCode.replace(
  /bg-white p-5 md:p-6 rounded-2xl md:rounded-\[32px\] border md:border-2 border-indigo-100 shadow-\[0_8px_30px_rgb\(0,0,0,0\.04\)\]/g,
  'bg-white p-4 rounded-xl border border-gray-200 shadow-sm'
);

fs.writeFileSync(jobPath, jobCode);

// 3. Update Navigation
let navPath = 'apps/web/components/Navigation.tsx';
let navCode = fs.readFileSync(navPath, 'utf8');

navCode = navCode.replace(
  /className=\{`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 \$\{\n\s*isActive\n\s*\? "bg-black text-white shadow-md"\n\s*: "text-gray-500 hover:text-black hover:bg-gray-900\/5"\n\s*\}\`\}/g,
  'className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive ? "text-indigo-600 bg-indigo-50" : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50"}`}'
);

fs.writeFileSync(navPath, navCode);


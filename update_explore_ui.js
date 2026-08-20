const fs = require('fs');
const file = 'apps/web/app/explore/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Update search section background and styling
code = code.replace(
  /<div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-sm">/g,
  '<div className="bg-indigo-50/80 backdrop-blur-md border-b-2 border-indigo-100 sticky top-16 z-30">'
);

// Update search bar input
code = code.replace(
  /className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"/g,
  'className="w-full pl-12 pr-4 py-4 bg-white border-2 border-indigo-100 rounded-[28px] text-slate-900 font-bold focus:ring-4 focus:ring-indigo-300 focus:border-indigo-300 transition-all shadow-sm placeholder:text-indigo-300"'
);

// Update Search Icon color
code = code.replace(
  /<Search className="absolute left-4 top-1\/2 -translate-y-1\/2 w-5 h-5 text-slate-400" \/>/g,
  '<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-indigo-400" />'
);

// Update Category Pills
code = code.replace(
  /activeCategory === cat \n                    \? "bg-black text-white shadow-md shadow-black\/20" \n                    : "bg-white border border-slate-200 text-gray-600 hover:border-gray-300 hover:bg-slate-50"/g,
  'activeCategory === cat ? "bg-indigo-500 text-white shadow-lg shadow-indigo-200 border-2 border-indigo-500 transform scale-105" : "bg-white border-2 border-indigo-100 text-indigo-500 hover:bg-indigo-50 hover:border-indigo-200"'
);
code = code.replace(
  /className=\{`px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all \$\{/g,
  'className={`px-6 py-2.5 rounded-full font-extrabold text-sm whitespace-nowrap transition-all duration-300 ease-bounce ${'
);

// Update Job Card Wrapper
code = code.replace(
  /className="group bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col h-full"/g,
  'className="group bg-white rounded-[32px] border-2 border-slate-100 p-6 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)] hover:border-indigo-200 hover:-translate-y-2 transition-all duration-300 flex flex-col h-full overflow-hidden relative"'
);

// Add pastel blob background to cards
code = code.replace(
  /className="flex items-center justify-between mb-4">/g,
  'className="flex items-center justify-between mb-4 relative z-10">\n                  {/* Decorative background blob */}\n                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>'
);

// Update job title
code = code.replace(
  /text-xl font-black text-slate-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2/g,
  'text-2xl font-black text-slate-800 mb-2 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2 relative z-10 tracking-tight'
);

// Update Price Tag
code = code.replace(
  /className="text-2xl font-black text-slate-900">/g,
  'className="text-2xl font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-2xl border-2 border-emerald-100 shadow-sm">'
);

// Update Apply Button
code = code.replace(
  /className="w-full mt-4 py-3 bg-slate-900 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors"/g,
  'className="w-full mt-4 py-3.5 bg-indigo-500 hover:bg-indigo-400 hover:shadow-lg hover:shadow-indigo-200 text-white font-black rounded-2xl transition-all active:scale-95"'
);

// Update badge SOS
code = code.replace(
  /bg-red-50 text-red-700 rounded-full text-xs font-black uppercase tracking-wide border border-red-100/g,
  'bg-rose-100 text-rose-600 rounded-full text-xs font-black uppercase tracking-widest border-2 border-rose-200 shadow-sm'
);

// Update normal category badge
code = code.replace(
  /bg-slate-100 text-slate-700 rounded-full text-xs font-bold border border-slate-200/g,
  'bg-blue-50 text-blue-600 rounded-full text-sm font-extrabold border-2 border-blue-100 shadow-sm'
);

// Add emoji to title logic
code = code.replace(
  /\{job.title\}/g,
  '{job.category === "Physical" ? "🛠️ " : job.category === "Digital" ? "💻 " : job.category === "Tutoring" ? "📚 " : "✨ "}{job.title}'
);

fs.writeFileSync(file, code);

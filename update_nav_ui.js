const fs = require('fs');
const file = 'apps/web/components/Navigation.tsx';
let code = fs.readFileSync(file, 'utf8');

// Navbar background
code = code.replace(
  /className="fixed bottom-0 md:top-0 w-full bg-white border-t md:border-b border-slate-200 z-50 md:h-16"/g,
  'className="fixed bottom-0 md:top-0 w-full bg-white/90 backdrop-blur-xl border-t-2 md:border-b-2 border-indigo-100/50 z-50 md:h-[72px] shadow-sm"'
);

// Logo text
code = code.replace(
  /<span className="text-xl font-black tracking-tight text-slate-900">GigTic<\/span>/g,
  '<span className="text-2xl font-black tracking-tighter text-indigo-600 drop-shadow-sm">Gig<span className="text-pink-500">Tic</span></span>'
);

// Links
code = code.replace(
  /const isActive = pathname === href;/g,
  'const isActive = pathname === href;'
);
code = code.replace(
  /const linkClass = `flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all \$\{/g,
  'const linkClass = `flex flex-col md:flex-row items-center justify-center gap-1.5 md:gap-2.5 px-4 py-2.5 rounded-2xl text-sm font-extrabold transition-all duration-300 ${'
);
code = code.replace(
  /isActive \? "text-blue-600 bg-blue-50" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"/g,
  'isActive ? "text-indigo-600 bg-indigo-50 shadow-sm border-2 border-indigo-100 transform scale-105" : "text-slate-400 hover:text-indigo-500 hover:bg-indigo-50/50 border-2 border-transparent"'
);

// New Gig Button
code = code.replace(
  /<Link href="\/create"\n              className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-xl font-bold transition-colors"/g,
  '<Link href="/create"\n              className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 shadow-md shadow-indigo-200 text-white rounded-2xl font-black transition-all hover:-translate-y-0.5 active:scale-95"'
);

fs.writeFileSync(file, code);

const fs = require('fs');
let navPath = 'apps/web/components/Navigation.tsx';
let navCode = fs.readFileSync(navPath, 'utf8');

navCode = navCode.replace(
  /className=\{`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 \$\{\n\s*isActive \n\s*\? "bg-black text-white shadow-md" \n\s*: "text-gray-500 hover:text-black hover:bg-gray-900\/5"\n\s*\}\`\}/g,
  'className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive ? "text-indigo-600 bg-indigo-50" : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50"}`}'
);

fs.writeFileSync(navPath, navCode);

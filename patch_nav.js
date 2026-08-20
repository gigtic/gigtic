const fs = require('fs');
const file = 'apps/web/components/Navigation.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/<a href="\/admin" className="p-2\.5 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">\s*<LayoutDashboard className="w-5 h-5" \/>\s*<\/a>/, '');
code = code.replace(/<a href="\/admin" className="p-2 text-gray-400 hover:text-black">\s*<LayoutDashboard className="w-5 h-5" \/>\s*<\/a>/, '');

fs.writeFileSync(file, code);

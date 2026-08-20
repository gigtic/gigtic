const fs = require('fs');
const file = 'apps/web/components/Navigation.tsx';
let code = fs.readFileSync(file, 'utf8');

// The desktop icon
code = code.replace(/<a href="\/admin" className="p-2\.5 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">[\s\S]*?<LayoutDashboard className="w-[22px] h-\[22px\]" \/>[\s\S]*?<\/a>/, '');

// The mobile icon
code = code.replace(/<a href="\/admin" className="p-2 text-gray-400 hover:text-black">[\s\S]*?<LayoutDashboard className="w-6 h-6" \/>[\s\S]*?<\/a>/, '');

fs.writeFileSync(file, code);

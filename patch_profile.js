const fs = require('fs');
const file = 'apps/web/app/profile/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldCode = '<p className="text-gray-500 font-medium text-sm mt-1">Manage your public profile and private preferences.</p>';
const newCode = `<p className="text-gray-500 font-medium text-sm mt-1">Manage your public profile and private preferences.</p>\n            {user && (\n              <div className="mt-3 inline-flex items-center gap-2 bg-gray-100/80 px-3 py-1.5 rounded-lg border border-gray-200">\n                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Account ID</span>\n                <span className="text-xs font-mono text-gray-700 font-bold">{user.id}</span>\n              </div>\n            )}`;

code = code.replace(oldCode, newCode);
fs.writeFileSync(file, code);

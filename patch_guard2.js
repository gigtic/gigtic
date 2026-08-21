const fs = require('fs');
const file = 'apps/web/components/GlobalGuard.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
    /<p className="text-slate-600 mb-8 font-medium">Your account has been strictly \{status\} by the GigTic Admin team for violating community guidelines.<\/p>/g,
    `<p className="text-slate-600 mb-4 font-medium">Your account has been strictly {status} by the GigTic Admin team for violating community guidelines.</p>\n            {reason && (\n              <div className="bg-red-50 p-4 rounded-xl mb-8 border border-red-100 text-red-800 text-left">\n                <span className="font-bold">Reason:</span> {reason}\n              </div>\n            )}`
);

fs.writeFileSync(file, code);

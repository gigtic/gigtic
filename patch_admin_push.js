const fs = require('fs');
const file = 'apps/admin/app/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/message: msg/, 'message: "📣 GigTic Official: " + msg');

fs.writeFileSync(file, code);

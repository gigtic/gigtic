const fs = require('fs');
const file = 'apps/admin/app/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/const msg = \(document\.getElementById\('broadcastMessage'\)\)\.value;/g, "const msg = (document.getElementById('broadcastMessage') as HTMLTextAreaElement).value;");
code = code.replace(/\(document\.getElementById\('broadcastMessage'\)\)\.value = '';/g, "(document.getElementById('broadcastMessage') as HTMLTextAreaElement).value = '';");

fs.writeFileSync(file, code);

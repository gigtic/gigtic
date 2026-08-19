const fs = require('fs');
const file = 'apps/web/app/layout.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/<!-- CXNE3410 -->/g, '{/* CXNE3410 */}');

fs.writeFileSync(file, code);

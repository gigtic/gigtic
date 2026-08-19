const fs = require('fs');
const file = 'apps/web/app/layout.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/<meta name="adsterra-verification" content="CXNE3410" \/>\n\s*\{\/\* CXNE3410 \*\/\}/g, '');

fs.writeFileSync(file, code);

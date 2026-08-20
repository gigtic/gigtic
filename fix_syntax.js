const fs = require('fs');
const file = 'apps/web/app/notifications/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /<\/div>\n\s*\)\n\s*\);\n\s*\}\)/g,
  `</div>\n              );\n            })`
);

fs.writeFileSync(file, code);

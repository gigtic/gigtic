const fs = require('fs');
const file = 'apps/web/app/layout.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /pb-\[140px\] md:pb-0/g,
  'pb-24 md:pb-0'
);

fs.writeFileSync(file, code);

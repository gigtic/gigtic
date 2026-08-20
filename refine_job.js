const fs = require('fs');
const file = 'apps/web/app/job/[id]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /bg-white p-8 rounded-\[32px\] border-2/g,
  'bg-white p-5 md:p-8 rounded-2xl md:rounded-[32px] border md:border-2'
);

code = code.replace(
  /bg-white p-6 rounded-\[32px\] border-2/g,
  'bg-white p-5 md:p-6 rounded-2xl md:rounded-[32px] border md:border-2'
);

fs.writeFileSync(file, code);

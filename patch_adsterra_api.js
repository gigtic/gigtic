const fs = require('fs');
const file = 'apps/admin/app/api/adsterra/route.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /const apiKey = process\.env\.ADSTERRA_API_KEY;/,
  'const apiKey = process.env.ADSTERRA_API_KEY || "3bea4d354d54a9ea9e7e037a1002ed9d";'
);

fs.writeFileSync(file, code);

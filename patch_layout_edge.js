const fs = require('fs');
const file = 'apps/web/app/layout.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes("export const runtime = 'edge';")) {
  code = "export const runtime = 'edge';\n" + code;
  fs.writeFileSync(file, code);
}

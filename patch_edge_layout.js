const fs = require('fs');
const file = 'apps/web/app/job/[id]/layout.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes("export const runtime = 'edge';")) {
  code = code.replace(/import \{ createClient \}/, "export const runtime = 'edge';\nimport { createClient }");
  fs.writeFileSync(file, code);
}

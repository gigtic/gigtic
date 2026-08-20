const fs = require('fs');
const file = 'apps/admin/app/auth/callback/route.ts';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/const next = searchParams\.get\('next'\) \?\? '\/explore'/, "const next = searchParams.get('next') ?? '/'");
fs.writeFileSync(file, code);

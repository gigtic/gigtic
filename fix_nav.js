const fs = require('fs');
const file = 'apps/web/components/Navigation.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/let currentUserId = null;/, 'let currentUserId: string | null = null;');
code = code.replace(/\.on\('postgres', \{ event: 'INSERT', schema: 'public', table: 'notifications' \}, \(payload\) => \{/, ".on('postgres' as any, { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload: any) => {");

fs.writeFileSync(file, code);

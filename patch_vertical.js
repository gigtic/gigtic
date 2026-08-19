const fs = require('fs');
const file = 'apps/web/components/AdsterraVertical.tsx';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/wistfulseverely\.com/g, 'www.highperformanceformat.com');
fs.writeFileSync(file, code);

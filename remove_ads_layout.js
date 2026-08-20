const fs = require('fs');
const file = 'apps/web/app/layout.tsx';
let code = fs.readFileSync(file, 'utf8');

// Remove AdsterraMobileSticky
code = code.replace(/<AdWrapper>\s*<AdsterraMobileSticky adKey=\{".*?"\} \/>\s*<\/AdWrapper>/g, '');

fs.writeFileSync(file, code);

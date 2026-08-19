const fs = require('fs');
const file = 'apps/web/app/layout.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /<link rel="apple-touch-icon" href="\/icon.svg" \/>/,
  '<link rel="apple-touch-icon" href="/icon.svg" />\n        <meta name="adsterra-verification" content="CXNE3410" />\n        <!-- CXNE3410 -->'
);

fs.writeFileSync(file, code);

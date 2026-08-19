const fs = require('fs');
const file = 'apps/web/components/AdsterraUnit.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldKey = "8f3ae048c13fa680f6ccab29bf153968";
const newKey = "fb3ac0074f26c662460ca9af163c83ce";
const oldUrl = `https://wistfulseverely.com/\${adKey}/invoke.js`;
const newUrl = `https://pl30927201.effectivecpmnetwork.com/\${adKey}/invoke.js`;

code = code.replace(new RegExp(oldKey, 'g'), newKey);
code = code.replace(new RegExp(oldUrl.replace(/[\/\.\$]/g, '\\$&'), 'g'), newUrl);

fs.writeFileSync(file, code);

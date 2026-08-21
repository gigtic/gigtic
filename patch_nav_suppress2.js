const fs = require('fs');
const file = 'apps/web/components/Navigation.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldLogic = /if \(urlPart === currentUrlRef\.current \|\| currentUrlRef\.current\.startsWith\(urlPart\)\) \{\n                    shouldShow = false;\n                \}/;

const newLogic = `if (currentUrlRef.current.startsWith('/chat') && urlPart && urlPart.startsWith('/chat')) {
                    shouldShow = false;
                } else if (urlPart === currentUrlRef.current) {
                    shouldShow = false;
                }`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync(file, code);

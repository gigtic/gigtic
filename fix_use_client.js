const fs = require('fs');
const file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Remove import React from top
code = code.replace('import React from "react";\n', '');
code = code.replace('"use client";\n', '');

// Prepend them correctly
code = '"use client";\nimport React from "react";\n' + code;

fs.writeFileSync(file, code);

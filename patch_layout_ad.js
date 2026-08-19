const fs = require('fs');
const file = 'apps/web/app/layout.tsx';
let code = fs.readFileSync(file, 'utf8');

// The right sidebar has height defaulting to 300
code = code.replace(
  /<AdsterraVertical adKey=\{"018c220ae6d7a03735b0d5d50f5b3684"\} className="shadow-sm" \/>/,
  '<AdsterraVertical adKey={"dacda670c436fab7ed7cd7db964ff312"} className="shadow-sm" />'
);

fs.writeFileSync(file, code);

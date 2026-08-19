const fs = require('fs');
const file = 'apps/web/app/layout.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /<AdsterraVertical adKey=\{"018c220ae6d7a03735b0d5d50f5b3684"\} height=\{600\} className="shadow-sm" \/>/,
  '<AdsterraVertical adKey={"cf9bd791087660a2358c950080649eab"} height={600} className="shadow-sm" />'
);

fs.writeFileSync(file, code);

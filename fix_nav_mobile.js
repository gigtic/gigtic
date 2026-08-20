const fs = require('fs');
const file = 'apps/web/components/Navigation.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /h-16 z-\[100\] px-1 pb-\[env\(safe-area-inset-bottom\)\]/g,
  'h-[calc(64px+env(safe-area-inset-bottom))] z-[100] px-1 pb-[env(safe-area-inset-bottom)]'
);

fs.writeFileSync(file, code);

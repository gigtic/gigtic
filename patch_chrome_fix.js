const fs = require('fs');
const file = 'apps/web/components/Navigation.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace fixed bottom-0 with an absolute positioning hack for Chrome iOS
code = code.replace(
    'className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-white border-t border-gray-200 grid grid-cols-5 items-center h-[calc(60px+env(safe-area-inset-bottom))] z-[100] px-1 pb-[env(safe-area-inset-bottom)] shadow-sm"',
    'className="md:hidden fixed inset-x-0 w-full bg-white border-t border-gray-200 grid grid-cols-5 items-center h-[calc(60px+env(safe-area-inset-bottom))] z-[100] px-1 pb-[env(safe-area-inset-bottom)] shadow-sm" style={{ bottom: 0, position: "fixed", transform: "translateZ(0)" }}'
);

fs.writeFileSync(file, code);

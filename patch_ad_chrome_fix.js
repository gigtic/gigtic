const fs = require('fs');
const file = 'apps/web/components/AdsterraMobileSticky.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
    'className="md:hidden fixed bottom-[60px] left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-gray-200/50 flex justify-center pb-[env(safe-area-inset-bottom)] pointer-events-auto shadow-[0_-4px_12px_rgba(0,0,0,0.05)]"',
    'className="md:hidden fixed inset-x-0 z-40 bg-white/90 backdrop-blur-md border-t border-gray-200/50 flex justify-center pb-[env(safe-area-inset-bottom)] pointer-events-auto shadow-[0_-4px_12px_rgba(0,0,0,0.05)]" style={{ bottom: "60px", position: "fixed", transform: "translateZ(0)" }}'
);

fs.writeFileSync(file, code);

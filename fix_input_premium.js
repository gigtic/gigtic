const fs = require('fs');
let file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = `<div className="bg-white border-t border-gray-200 p-4 shrink-0 pb-8 sm:pb-4">`;
const replacement = `<div className="bg-white/90 backdrop-blur-xl border-t border-gray-200/60 p-3 sm:p-4 shrink-0 pb-[max(env(safe-area-inset-bottom),12px)] shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.03)] z-50">`;

code = code.replace(target, replacement);

fs.writeFileSync(file, code);

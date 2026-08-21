const fs = require('fs');
let file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = `<div className="h-[calc(100vh-64px)] flex flex-col bg-slate-50 font-sans max-w-5xl mx-auto w-full">`;
const replacement = `<div className="fixed inset-0 md:relative md:inset-auto z-40 pt-[56px] md:pt-0 h-[100dvh] md:h-[calc(100vh-64px)] flex flex-col bg-slate-50 font-sans max-w-5xl mx-auto w-full">`;

code = code.replace(target, replacement);

fs.writeFileSync(file, code);

const fs = require('fs');
let file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const wrapperTarget = /<div className="flex flex-col bg-slate-50 font-sans max-w-5xl mx-auto w-full min-h-\[calc\(100dvh-56px\)\] relative z-40">/;
const wrapperReplacement = `<div className="fixed top-[56px] md:top-[64px] bottom-0 left-0 right-0 flex flex-col bg-slate-50 font-sans max-w-5xl mx-auto w-full z-40 overflow-hidden">`;
code = code.replace(wrapperTarget, wrapperReplacement);

fs.writeFileSync(file, code);

const fs = require('fs');
let file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = `<div className="fixed top-[56px] md:top-[64px] bottom-0 left-0 right-0 flex flex-col bg-slate-50 font-sans max-w-5xl mx-auto w-full z-40 overflow-hidden">`;

const replacement = `<div className="fixed top-[56px] md:top-[64px] bottom-0 left-0 right-0 flex flex-col bg-slate-50 font-sans max-w-5xl mx-auto w-full z-40 overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: \`
        html, body {
          padding-bottom: 0px !important;
          overflow: hidden !important;
          position: fixed !important;
          width: 100% !important;
          height: 100% !important;
          touch-action: none !important;
        }
      \`}} />`;

if (!code.includes('padding-bottom: 0px !important;')) {
  code = code.replace(target, replacement);
  fs.writeFileSync(file, code);
}

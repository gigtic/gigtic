const fs = require('fs');
let file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = `export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#FAFAFA]"><Loader2 className="w-10 h-10 animate-spin text-gray-300" /></div>}>
      <style dangerouslySetInnerHTML={{__html: \`
        @media (max-width: 768px) {
          body {
            padding-bottom: 0px !important;
          }
        }
      \`}} />
      <ChatContent />
    </Suspense>
  );
}`;

const replacement = `export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#FAFAFA]"><Loader2 className="w-10 h-10 animate-spin text-gray-300" /></div>}>
      <style dangerouslySetInnerHTML={{__html: \`
        html, body {
          padding-bottom: 0px !important;
          overflow: hidden !important;
          position: fixed !important;
          width: 100% !important;
          height: 100% !important;
          touch-action: none !important;
        }
      \`}} />
      <ChatContent />
    </Suspense>
  );
}`;

code = code.replace(target, replacement);

// Also fix the onBlur to scroll to 0,0 instead of body.scrollHeight
const blurTarget = `window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });`;
const blurReplacement = `window.scrollTo({ top: 0, left: 0, behavior: 'instant' });`;
code = code.replace(blurTarget, blurReplacement);

fs.writeFileSync(file, code);

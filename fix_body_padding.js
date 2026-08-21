const fs = require('fs');
let file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = `export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#FAFAFA]"><Loader2 className="w-10 h-10 animate-spin text-gray-300" /></div>}>
      <ChatContent />
    </Suspense>
  );
}`;

const replacement = `export default function ChatPage() {
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

code = code.replace(target, replacement);
fs.writeFileSync(file, code);

const fs = require('fs');
let file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Replace the ChatPage component to inject the strict body lock
const chatPageTarget = /export default function ChatPage\(\) \{[\s\S]*?\}\n\s*\);\n\}/;
const chatPageReplacement = `export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#FAFAFA]"><Loader2 className="w-10 h-10 animate-spin text-gray-300" /></div>}>
      <style dangerouslySetInnerHTML={{__html: \`
        body {
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
code = code.replace(chatPageTarget, chatPageReplacement);

// 2. Fix the Chat Room Wrapper to be absolutely fixed from 56px to bottom
const wrapperTarget = /<div className="-mb-24 md:-mb-0 flex flex-col bg-slate-50 font-sans max-w-5xl mx-auto w-full min-h-\[calc\(100dvh-56px\)\] relative z-40">/;
const wrapperReplacement = `<div className="fixed top-[56px] md:top-[64px] bottom-0 left-0 right-0 flex flex-col bg-slate-50 font-sans max-w-5xl mx-auto w-full z-40 overflow-hidden">`;
code = code.replace(wrapperTarget, wrapperReplacement);

// 3. Revert Chat Header from sticky to normal flex child
const headerTarget = /<div className="sticky top-\[56px\] md:top-\[64px\] bg-white\/80 backdrop-blur-xl border-b-2 border-indigo-100 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-30">/;
const headerReplacement = `<div className="bg-white/80 backdrop-blur-xl border-b-2 border-indigo-100 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-30">`;
code = code.replace(headerTarget, headerReplacement);

// 4. Revert Messages Area to have overflow-y-auto so it scrolls INDEPENDENTLY of the body
const messagesTarget = /<div className="flex-1 p-4 sm:p-6 space-y-1\.5 bg-\[\#FAFAFA\]">/;
const messagesReplacement = `<div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-1.5 bg-[#FAFAFA] scroll-smooth relative" style={{ touchAction: 'pan-y' }}>`;
code = code.replace(messagesTarget, messagesReplacement);

// 5. Revert Input Area from sticky to normal flex child
const inputTarget = /<div className="sticky bottom-0 bg-white\/90 backdrop-blur-xl border-t border-gray-200\/60 p-3 sm:p-4 shrink-0 pb-\[max\(env\(safe-area-inset-bottom\),12px\)\] shadow-\[0_-10px_40px_-10px_rgba\(0,0,0,0\.03\)\] z-50">/;
const inputReplacement = `<div className="bg-white/90 backdrop-blur-xl border-t border-gray-200/60 p-3 sm:p-4 shrink-0 pb-[max(env(safe-area-inset-bottom),12px)] shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.03)] z-50">`;
code = code.replace(inputTarget, inputReplacement);

fs.writeFileSync(file, code);

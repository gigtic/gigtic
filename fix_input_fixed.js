const fs = require('fs');
let file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Change sticky bottom-0 to fixed bottom-0
const inputTarget = `<div className="sticky bottom-0 bg-white/90 backdrop-blur-xl border-t border-gray-200/60 p-3 sm:p-4 shrink-0 pb-[max(env(safe-area-inset-bottom),12px)] shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.03)] z-50">`;
const inputReplacement = `<div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200/60 p-3 sm:p-4 pb-[max(env(safe-area-inset-bottom),12px)] shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.03)] z-50">`;
code = code.replace(inputTarget, inputReplacement);

// Add bottom padding to the messages area so the last message isn't covered by the fixed input
// We can just add pb-24 to the flex-1 container.
const messagesTarget = `<div className="flex-1 p-4 sm:p-6 space-y-1.5 bg-[#FAFAFA]">`;
const messagesReplacement = `<div className="flex-1 p-4 sm:p-6 pb-[100px] sm:pb-[100px] space-y-1.5 bg-[#FAFAFA]">`;
code = code.replace(messagesTarget, messagesReplacement);

// Optional: we can remove the onBlur workaround if we want, or keep it. It's harmless.
fs.writeFileSync(file, code);

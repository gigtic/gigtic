const fs = require('fs');
let file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Update Wrapper
const wrapperTarget = /<div className="fixed inset-0 md:relative md:inset-auto z-40 pt-\[56px\] md:pt-0 h-\[100dvh\] md:h-\[calc\(100vh-64px\)\] flex flex-col bg-slate-50 font-sans max-w-5xl mx-auto w-full">/;
const wrapperReplacement = `<div className="-mb-24 md:-mb-0 flex flex-col bg-slate-50 font-sans max-w-5xl mx-auto w-full min-h-[calc(100dvh-56px)] relative z-40">`;
code = code.replace(wrapperTarget, wrapperReplacement);

// 2. Update Header to be sticky
const headerTarget = `<div className="bg-white/80 backdrop-blur-xl border-b-2 border-indigo-100 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">`;
const headerReplacement = `<div className="sticky top-[56px] md:top-[64px] bg-white/80 backdrop-blur-xl border-b-2 border-indigo-100 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-30">`;
code = code.replace(headerTarget, headerReplacement);

// 3. Update Messages Area to remove overflow-y-auto and just be a natural flex child
const messagesTarget = `<div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-1.5 bg-[#FAFAFA] scroll-smooth">`;
const messagesReplacement = `<div className="flex-1 p-4 sm:p-6 space-y-1.5 bg-[#FAFAFA]">`;
code = code.replace(messagesTarget, messagesReplacement);

// 4. Update Input Area to be sticky bottom
const inputTarget = `<div className="bg-white/90 backdrop-blur-xl border-t border-gray-200/60 p-3 sm:p-4 shrink-0 pb-[max(env(safe-area-inset-bottom),12px)] shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.03)] z-50">`;
const inputReplacement = `<div className="sticky bottom-0 bg-white/90 backdrop-blur-xl border-t border-gray-200/60 p-3 sm:p-4 shrink-0 pb-[max(env(safe-area-inset-bottom),12px)] shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.03)] z-50">`;
code = code.replace(inputTarget, inputReplacement);

// 5. Update scrollIntoView logic
// Since the whole page is scrolling now, we might need to scroll window, but messagesEndRef still works because it's at the bottom of the messages div.
// Wait, when scrolling, if the input is sticky bottom, scrolling to messagesEndRef might put it UNDER the input field.
// We can use scrollMarginBottom on messagesEndRef.
const endRefTarget = `<div ref={messagesEndRef} />`;
const endRefReplacement = `<div ref={messagesEndRef} className="scroll-m-[150px]" />`;
code = code.replace(endRefTarget, endRefReplacement);

fs.writeFileSync(file, code);

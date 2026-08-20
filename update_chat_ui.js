const fs = require('fs');
const file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Back button link
code = code.replace(
  /<Link href=\{dmParam \? "\/chat" : `\/chat\?job=\$\{jobId\}`\} className="p-2 mr-2 -ml-2 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-gray-100">/g,
  '<Link href={dmParam ? "/chat" : (isRequester && conversationParam ? `/chat?job=${jobId}` : `/job/${jobId}`)} className="p-2 mr-2 -ml-2 text-indigo-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-indigo-50">'
);

// 2. Chat Layout Wrapper
code = code.replace(
  /className="h-\[calc\(100vh-64px\)\] flex flex-col bg-\[#FAFAFA\] font-sans max-w-5xl mx-auto w-full"/g,
  'className="h-[calc(100vh-64px)] flex flex-col bg-slate-50 font-sans max-w-5xl mx-auto w-full"'
);

// 3. Chat Header
code = code.replace(
  /className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-10"/g,
  'className="bg-white/80 backdrop-blur-xl border-b-2 border-indigo-100 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-10"'
);

// 4. Header Avatar
code = code.replace(
  /className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center text-white shadow-md"/g,
  'className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 transform hover:scale-105 transition-transform"'
);

// 5. My message bubble
code = code.replace(
  /bg-gradient-to-br from-gray-900 to-black text-white rounded-3xl rounded-br-sm/g,
  'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-[24px] rounded-br-sm shadow-md shadow-indigo-200/50'
);

// 6. Other message bubble
code = code.replace(
  /bg-white text-gray-900 border border-gray-100 rounded-3xl rounded-bl-sm/g,
  'bg-white text-gray-800 border-2 border-indigo-50 rounded-[24px] rounded-bl-sm shadow-sm'
);

// 7. Input area
code = code.replace(
  /className="bg-white border-t border-gray-200 p-4 shrink-0 shadow-\[0_-4px_6px_-1px_rgb\(0,0,0,0.02\)\] z-10"/g,
  'className="bg-white/80 backdrop-blur-xl border-t-2 border-indigo-100 p-4 shrink-0 z-10"'
);
code = code.replace(
  /className="flex items-center gap-3 bg-gray-50 border border-gray-200 p-2 rounded-2xl focus-within:border-black focus-within:ring-2 focus-within:ring-black\/5 transition-all shadow-inner"/g,
  'className="flex items-center gap-3 bg-white border-2 border-indigo-100 p-2 rounded-3xl focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-100 transition-all shadow-sm"'
);

// 8. Send button
code = code.replace(
  /className="p-3 bg-black text-white rounded-xl hover:bg-gray-900 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 shadow-md"/g,
  'className="p-3.5 bg-indigo-500 text-white rounded-[20px] hover:bg-indigo-400 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-indigo-200"'
);

// 9. Assign Button
code = code.replace(
  /className="px-5 py-2\.5 rounded-xl font-bold text-sm bg-black text-white hover:bg-gray-900 active:scale-95 transition-all shadow-md"/g,
  'className="px-6 py-2.5 rounded-2xl font-black text-sm bg-indigo-500 text-white hover:bg-indigo-400 active:scale-95 transition-all shadow-lg shadow-indigo-200"'
);

fs.writeFileSync(file, code);

const fs = require('fs');
const file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Inbox list items
code = code.replace(
  /className="flex items-center gap-4 bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group"/g,
  'className="flex items-center gap-4 bg-white border-2 border-indigo-50 p-5 rounded-[24px] shadow-sm hover:border-indigo-200 hover:shadow-md hover:-translate-y-1 transition-all group duration-300"'
);

// Inbox avatars
code = code.replace(
  /className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center text-white"/g,
  'className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-200"'
);

// New Chat button
code = code.replace(
  /className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-900 transition-all shadow-sm active:scale-95"/g,
  'className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 text-white rounded-2xl font-black text-sm hover:bg-indigo-400 hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-95"'
);

// Interested workers avatars (isRequester)
code = code.replace(
  /className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600"/g,
  'className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-indigo-600 border-2 border-white shadow-sm"'
);

fs.writeFileSync(file, code);

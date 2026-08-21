const fs = require('fs');
let file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = `<form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-end gap-3">
            <div className="flex-1 bg-white border border-gray-200/80 rounded-[28px] focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all shadow-sm flex items-center overflow-hidden pr-2">`;
const replacement = `<form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-end">
            <div className="flex-1 bg-white border border-gray-200/80 rounded-full focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all shadow-sm flex items-center pr-1.5 pl-1.5 min-h-[48px]">`;

code = code.replace(target, replacement);

const buttonTarget = `</div>
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="w-14 h-[52px] bg-black text-white rounded-2xl flex items-center justify-center hover:bg-gray-900 disabled:opacity-50 transition-all shadow-md shadow-black/10 active:scale-95 shrink-0"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>`;
            
const newButton = `
              <button 
                type="submit"
                disabled={!newMessage.trim()}
                className="w-[36px] h-[36px] bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 disabled:bg-gray-300 transition-all shadow-sm active:scale-90 shrink-0 self-end mb-[5px] mr-[2px]"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>`;

code = code.replace(buttonTarget, newButton);

fs.writeFileSync(file, code);

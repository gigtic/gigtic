const fs = require('fs');
let file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldInput = `<div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl focus-within:border-black focus-within:ring-2 focus-within:ring-black/5 transition-all">`;
const newInput = `<div className="flex-1 bg-white border border-gray-200/80 rounded-[28px] focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all shadow-sm flex items-center overflow-hidden pr-2">`;
code = code.replace(oldInput, newInput);

const oldTextarea = `className="w-full bg-transparent px-4 py-3.5 outline-none text-gray-900 font-medium resize-none min-h-[52px] max-h-32"`;
const newTextarea = `className="w-full bg-transparent px-5 py-3 outline-none text-gray-900 text-[15px] resize-none min-h-[46px] max-h-32 self-center pt-[12px] leading-relaxed"`;
code = code.replace(oldTextarea, newTextarea);

const oldButton = `<button 
              type="submit"
              disabled={!newMessage.trim()}
              className="w-14 h-[52px] bg-black text-white rounded-2xl flex items-center justify-center hover:bg-gray-900 disabled:opacity-50 transition-all shadow-md shadow-black/10 active:scale-95 shrink-0"
            >
              <Send className="w-6 h-6 ml-1" />`;
const newButton = `<button 
              type="submit"
              disabled={!newMessage.trim()}
              className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 disabled:bg-gray-400 transition-all shadow-sm active:scale-90 shrink-0 mb-[3px]"
            >
              <Send className="w-5 h-5 ml-0.5" />`;
code = code.replace(oldButton, newButton);

fs.writeFileSync(file, code);

const fs = require('fs');
let file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = `            {/* Inline Ad after every 6th message */}
            {(idx + 1) % 6 === 0 && (
               <div className="w-full flex justify-center my-4 overflow-hidden py-3 bg-white border border-gray-100 rounded-3xl shadow-sm">
                 <div className="transform scale-[0.68] sm:scale-100 origin-center flex items-center justify-center w-[468px] h-[60px]">
                   <AdsterraUnit />
                 </div>
               </div>
            )}`;

const replacement = `            {/* Inline Ad after every 6th message */}
            {(idx + 1) % 6 === 0 && (
               <div className="w-full flex justify-center my-4 overflow-hidden py-2 bg-gray-50/80 border border-gray-100 rounded-2xl shadow-sm relative">
                 <div className="absolute top-0 right-0 bg-black/5 backdrop-blur-sm text-[8px] font-black uppercase text-gray-400 tracking-wider z-10 px-1 py-0.5 rounded-bl pointer-events-none">
                   Ad
                 </div>
                 <div className="flex items-center justify-center w-[320px] h-[50px]">
                   <iframe 
                     src="/ad?key=db6b0a3d8c5a222759075b2244521418&w=320&h=50"
                     width="320" 
                     height="50" 
                     frameBorder="0" 
                     scrolling="no"
                     className="w-full h-full border-none rounded-xl"
                     sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
                   />
                 </div>
               </div>
            )}`;

code = code.replace(target, replacement);
fs.writeFileSync(file, code);

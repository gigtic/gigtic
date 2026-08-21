const fs = require('fs');
let file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = `<button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white backdrop-blur-lg transition-colors z-[110]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>`;

const replacement = `<button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-[max(env(safe-area-inset-top,24px),24px)] right-4 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white backdrop-blur-xl shadow-2xl transition-all z-[999] pointer-events-auto active:scale-90"
            style={{ position: 'fixed' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>

          {/* Fallback close button at bottom just in case top is unreachable */}
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute bottom-[max(env(safe-area-inset-bottom,40px),40px)] left-1/2 -translate-x-1/2 px-8 py-3 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white font-bold tracking-wide backdrop-blur-xl shadow-2xl transition-all z-[999] pointer-events-auto active:scale-90"
            style={{ position: 'fixed' }}
          >
            Close Photo
          </button>`;

code = code.replace(target, replacement);
fs.writeFileSync(file, code);

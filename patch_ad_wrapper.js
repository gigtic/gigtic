const fs = require('fs');
const file = 'apps/web/components/AdsterraMobileSticky.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldAd = `<div className="md:hidden fixed bottom-[60px] left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-gray-200/50 flex justify-center pb-[env(safe-area-inset-bottom)] pointer-events-auto shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">`;

const newAd = `<div className="md:hidden fixed inset-0 pointer-events-none z-40 flex items-end">\n    <div className="absolute bottom-[calc(60px+env(safe-area-inset-bottom))] left-0 right-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-200/50 flex justify-center pointer-events-auto shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">`;

code = code.replace(oldAd, newAd);
code = code.replace('</div>\n    </div>\n  );\n}', '</div>\n    </div>\n    </div>\n  );\n}');

fs.writeFileSync(file, code);

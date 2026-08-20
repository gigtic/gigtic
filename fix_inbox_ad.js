const fs = require('fs');
let chatPath = 'apps/web/app/chat/page.tsx';
let chatCode = fs.readFileSync(chatPath, 'utf8');

const target = `<AdsterraUnit />`;
const replacement = `<div className="w-full overflow-hidden flex justify-center items-center bg-gray-50 rounded-2xl border border-gray-100 p-2">
                        <iframe 
                          src="/ad?key=db6b0a3d8c5a222759075b2244521418&w=468&h=60"
                          width="468" 
                          height="60" 
                          frameBorder="0" 
                          scrolling="no"
                          className="max-w-full"
                          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
                        />
                      </div>`;

chatCode = chatCode.replace(target, replacement);

fs.writeFileSync(chatPath, chatCode);

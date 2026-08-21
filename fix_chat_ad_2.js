const fs = require('fs');
let file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const endTarget = `                {isMe && (
                  readReceiptsUnlocked ? (
                    <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                  ) : (
                    <CheckCheck className="w-3.5 h-3.5 text-gray-300" />
                  )
                )}
              </div>
            </div>
          );
        })}`;

const endReplacement = `                {isMe && (
                  readReceiptsUnlocked ? (
                    <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                  ) : (
                    <CheckCheck className="w-3.5 h-3.5 text-gray-300" />
                  )
                )}
              </div>
            </div>

            {/* Inline Ad after every 6th message */}
            {(idx + 1) % 6 === 0 && (
               <div className="w-full flex justify-center my-4 overflow-hidden py-3 bg-white border border-gray-100 rounded-3xl shadow-sm">
                 <div className="transform scale-[0.68] sm:scale-100 origin-center flex items-center justify-center w-[468px] h-[60px]">
                   <AdsterraUnit />
                 </div>
               </div>
            )}
            </React.Fragment>
          );
        })}`;

if (!code.includes('Inline Ad after every 6th message')) {
  code = code.replace(endTarget, endReplacement);
  fs.writeFileSync(file, code);
}

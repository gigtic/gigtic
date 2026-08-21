const fs = require('fs');
let file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = `{messages.map((msg, idx) => {
          const isMe = msg.sender_id === currentUser?.id;
          return (
            <div key={idx} className={\`flex flex-col \${isMe ? 'items-end' : 'items-start'} group\`}>`;

const replacement = `{messages.map((msg, idx) => {
          const isMe = msg.sender_id === currentUser?.id;
          return (
            <React.Fragment key={idx}>
            <div className={\`flex flex-col \${isMe ? 'items-end' : 'items-start'} group\`}>`;

if (!code.includes('<React.Fragment key={idx}>')) {
  code = code.replace(target, replacement);
  
  // Now replace the end of the message div to close the fragment and add the ad
  const endTarget = `              <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity px-2">
                <span className="text-[10px] font-bold text-gray-300">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {isMe && readReceiptsUnlocked && msg.read_at && (
                  <CheckCheck className="w-3 h-3 text-blue-500" />
                )}
                {isMe && readReceiptsUnlocked && !msg.read_at && (
                  <CheckCircle2 className="w-3 h-3 text-gray-300" />
                )}
              </div>
            </div>
          );
        })}`;

  const endReplacement = `              <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity px-2">
                <span className="text-[10px] font-bold text-gray-300">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {isMe && readReceiptsUnlocked && msg.read_at && (
                  <CheckCheck className="w-3 h-3 text-blue-500" />
                )}
                {isMe && readReceiptsUnlocked && !msg.read_at && (
                  <CheckCircle2 className="w-3 h-3 text-gray-300" />
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

  code = code.replace(endTarget, endReplacement);
  fs.writeFileSync(file, code);
}

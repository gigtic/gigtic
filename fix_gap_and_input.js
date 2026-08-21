const fs = require('fs');
let file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Fix gap between messages
code = code.replace(/className="flex-1 overflow-y-auto p-6 space-y-5 bg-\[\#FAFAFA\] scroll-smooth"/, 'className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-1.5 bg-[#FAFAFA] scroll-smooth"');

// 2. Fix the auto-grow of the textarea
const oldTextareaOnChange = `onChange={(e) => {
                  setNewMessage(e.target.value);
                  const now = Date.now();
                  if (now - lastTypingEventRef.current > 1000 && broadcastChannelRef.current) {
                    lastTypingEventRef.current = now;
                    broadcastChannelRef.current.send({
                      type: 'broadcast',
                      event: 'typing',
                      payload: { userId: currentUser?.id }
                    });
                  }
                }}`;

const newTextareaOnChange = `onChange={(e) => {
                  setNewMessage(e.target.value);
                  
                  // Auto-grow logic
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';

                  const now = Date.now();
                  if (now - lastTypingEventRef.current > 1000 && broadcastChannelRef.current) {
                    lastTypingEventRef.current = now;
                    broadcastChannelRef.current.send({
                      type: 'broadcast',
                      event: 'typing',
                      payload: { userId: currentUser?.id }
                    });
                  }
                }}`;

code = code.replace(oldTextareaOnChange, newTextareaOnChange);

fs.writeFileSync(file, code);

const fs = require('fs');
let file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = `onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (newMessage.trim()) {
                      e.currentTarget.form?.requestSubmit();
                    }
                  }
                }}
              />`;

const replacement = `onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (newMessage.trim()) {
                      e.currentTarget.form?.requestSubmit();
                    }
                  }
                }}
                onBlur={() => {
                  // iOS Safari keyboard dismissal bug fix: force layout recalculation
                  setTimeout(() => {
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });
                  }, 100);
                }}
              />`;

code = code.replace(target, replacement);
fs.writeFileSync(file, code);

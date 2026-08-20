const fs = require('fs');
let navPath = 'apps/web/components/Navigation.tsx';
let navCode = fs.readFileSync(navPath, 'utf8');

const target = `toast(payload.new.message, {
              icon: '🔔',
              duration: 5000,
              style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 'bold'
              },
            });`;

const replacement = `const urlPart = typeof payload.new.type === 'string' && payload.new.type.includes('|') ? payload.new.type.split('|')[1] : null;
            if (urlPart) {
              toast(
                (t) => (
                  <div 
                    onClick={() => {
                      toast.dismiss(t.id);
                      window.location.href = urlPart;
                    }}
                    className="flex items-center gap-2 cursor-pointer w-full h-full"
                  >
                    <span>🔔</span>
                    <span>{payload.new.message}</span>
                  </div>
                ),
                {
                  duration: 5000,
                  style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    padding: '12px 16px',
                  },
                }
              );
            } else {
              toast(payload.new.message, {
                icon: '🔔',
                duration: 5000,
                style: {
                  borderRadius: '10px',
                  background: '#333',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 'bold'
                },
              });
            }`;

navCode = navCode.replace(target, replacement);

fs.writeFileSync(navPath, navCode);

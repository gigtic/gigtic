const fs = require('fs');
const file = 'apps/web/components/Navigation.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldCode = `const urlPart = typeof payload.new.type === 'string' && payload.new.type.includes('|') ? payload.new.type.split('|')[1] : null;
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
                    minWidth: '250px',
                    padding: '16px',
                    borderRadius: '12px',
                    background: '#312e81',
                    color: '#fff',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  }
                }
              );
            }`;

const newCode = `const urlPart = typeof payload.new.type === 'string' && payload.new.type.includes('|') ? payload.new.type.split('|')[1] : null;
            toast(
              (t) => (
                <div 
                  onClick={() => {
                    toast.dismiss(t.id);
                    if (urlPart) window.location.href = urlPart;
                  }}
                  className={\`flex items-center gap-2 w-full h-full \${urlPart ? 'cursor-pointer' : ''}\`}
                >
                  <span>🔔</span>
                  <span>{payload.new.message}</span>
                </div>
              ),
              {
                duration: 5000,
                style: {
                  minWidth: '250px',
                  padding: '16px',
                  borderRadius: '12px',
                  background: '#312e81',
                  color: '#fff',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                }
              }
            );`;

code = code.replace(oldCode, newCode);
fs.writeFileSync(file, code);

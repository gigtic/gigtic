const fs = require('fs');
const file = 'apps/web/app/notifications/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// We will change the mapping of notifications to wrap it in a <Link> if there's a URL in the type
const target = `<div 
                key={notification.id} 
                className={\`p-5 flex items-start gap-4 transition-colors \${!notification.is_read ? 'bg-indigo-50/30' : 'hover:bg-gray-50'}\`}
              >`;

const replacement = `const urlPart = typeof notification.type === 'string' && notification.type.includes('|') ? notification.type.split('|')[1] : null;
              
              const ContentWrapper = urlPart ? Link : 'div';
              const wrapperProps = urlPart ? { href: urlPart } : {};
              
              return (
              <ContentWrapper 
                {...wrapperProps}
                key={notification.id} 
                className={\`p-5 flex items-start gap-4 transition-colors block w-full text-left \${!notification.is_read ? 'bg-indigo-50/30' : 'hover:bg-gray-50'}\`}
              >`;

code = code.replace(target, replacement);

// Also need to close ContentWrapper instead of div
const targetClose = `</p>
                </div>
              </div>`;

const replaceClose = `</p>
                </div>
              </ContentWrapper>`;

code = code.replace(targetClose, replaceClose);

// Also we changed notifications.map((notification) => ( ... )) to a return block, so we need to add curly braces
code = code.replace(
  /\{notifications\.map\(\(notification\) => \(/g,
  '{notifications.map((notification) => {'
);
code = code.replace(
  /<\/ContentWrapper>\n\s*\)\)}\n\s*<\/div>/g,
  `</ContentWrapper>\n              );\n            })}\n          </div>`
);

// We need to import Link from next/link! It is already imported!
// Let's check imports
if (!code.includes('import Link')) {
  code = `import Link from 'next/link'\n` + code;
}

fs.writeFileSync(file, code);

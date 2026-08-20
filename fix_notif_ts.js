const fs = require('fs');
const file = 'apps/web/app/notifications/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = `const urlPart = typeof notification.type === 'string' && notification.type.includes('|') ? notification.type.split('|')[1] : null;
              
              const ContentWrapper = urlPart ? Link : 'div';
              const wrapperProps = urlPart ? { href: urlPart } : {};
              
              return (
              <ContentWrapper 
                {...wrapperProps}
                key={notification.id} 
                className={\`p-5 flex items-start gap-4 transition-colors block w-full text-left \${!notification.is_read ? 'bg-indigo-50/30' : 'hover:bg-gray-50'}\`}
              >
                <div className="mt-1">
                  {!notification.is_read ? (
                    <Circle className="w-3 h-3 fill-indigo-500 text-indigo-500" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={\`text-[15px] leading-relaxed \${!notification.is_read ? 'font-semibold text-slate-800' : 'text-gray-600'}\`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-2 font-medium uppercase tracking-wider">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
              </ContentWrapper>`;

const innerContent = `<div className="mt-1">
                  {!notification.is_read ? (
                    <Circle className="w-3 h-3 fill-indigo-500 text-indigo-500" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={\`text-[15px] leading-relaxed \${!notification.is_read ? 'font-semibold text-slate-800' : 'text-gray-600'}\`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-2 font-medium uppercase tracking-wider">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>`;

const replacement = `const urlPart = typeof notification.type === 'string' && notification.type.includes('|') ? notification.type.split('|')[1] : null;
              const classNameStr = \`p-5 flex items-start gap-4 transition-colors block w-full text-left \${!notification.is_read ? 'bg-indigo-50/30' : 'hover:bg-gray-50'}\`;
              
              if (urlPart) {
                return (
                  <Link href={urlPart} key={notification.id} className={classNameStr}>
                    ${innerContent}
                  </Link>
                );
              }
              
              return (
                <div key={notification.id} className={classNameStr}>
                  ${innerContent}
                </div>
              )`;

code = code.replace(target, replacement);

fs.writeFileSync(file, code);

const fs = require('fs');
let file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = `{msg.content}
              </div>`;

const replacement = `{msg.content}
                {msg.image_url && (
                  <div className="mt-2 rounded-xl overflow-hidden shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <a href={msg.image_url} target="_blank" rel="noopener noreferrer">
                      <img src={msg.image_url} alt="Shared photo" className="max-w-full w-[250px] h-auto max-h-[300px] object-cover" />
                    </a>
                  </div>
                )}
              </div>`;

code = code.replace(target, replacement);
fs.writeFileSync(file, code);

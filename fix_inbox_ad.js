const fs = require('fs');
const file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /globalConversations\.map\(conv => \{/g,
  'globalConversations.map((conv, index) => {'
);

code = code.replace(
  /return \(\n\s*<Link \n\s*key=\{conv\.id\}/g,
  `return (
                <React.Fragment key={conv.id}>
                  {index > 0 && index % 3 === 0 && (
                    <div className="py-2">
                      <AdsterraUnit />
                    </div>
                  )}
                  <Link 
                    key={conv.id}`
);

// We need to close the React.Fragment around the Link
code = code.replace(
  /<\/Link>\n\s*\);\n\s*\}\)\n\s*\)}/g,
  `</Link>
                </React.Fragment>
              );
            })
          )}`
);

fs.writeFileSync(file, code);

const fs = require('fs');
let chatPath = 'apps/web/app/chat/page.tsx';
let chatCode = fs.readFileSync(chatPath, 'utf8');

const target = `{/* Discreet Ad Unit Below Header */}
      <div className="w-full flex justify-center bg-gray-50 border-b border-gray-200 py-2 shrink-0 hidden md:flex">
        <div className="w-[320px] h-[50px] relative">
          <div className="absolute top-0 right-0 bg-white/90 backdrop-blur-sm text-[8px] font-black uppercase text-gray-400 tracking-wider z-10 px-1.5 py-0.5 rounded-bl shadow-sm">Ad</div>
          <iframe 
            srcDoc={\`
              <!DOCTYPE html>
              <html>
                <head>
                  <style>
                    body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; }
                  </style>
                </head>
                <body>
                  <script type="text/javascript">
                    atOptions = {
                      'key' : 'b8e48a108a8fec93539050d2bb525545',
                      'format' : 'iframe',
                      'height' : 50,
                      'width' : 320,
                      'params' : {}
                    };
                  </script>
                  <script type="text/javascript" src="https://www.highperformanceformat.com/b8e48a108a8fec93539050d2bb525545/invoke.js"></script>
                </body>
              </html>
            \`}
            width="320" 
            height="50" 
            frameBorder="0" 
            scrolling="no" 
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
            className="w-full h-full border-none outline-none bg-transparent"
          />
        </div>
      </div>
      <div className="w-full flex justify-center bg-gray-50 border-b border-gray-200 py-2 shrink-0 md:hidden">
         <div className="w-[320px] h-[50px] relative">
          <div className="absolute top-0 right-0 bg-white/90 backdrop-blur-sm text-[8px] font-black uppercase text-gray-400 tracking-wider z-10 px-1.5 py-0.5 rounded-bl shadow-sm">Ad</div>
          <iframe 
            srcDoc={\`
              <!DOCTYPE html>
              <html>
                <head>
                  <style>
                    body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; }
                  </style>
                </head>
                <body>
                  <script type="text/javascript">
                    atOptions = {
                      'key' : 'b8e48a108a8fec93539050d2bb525545',
                      'format' : 'iframe',
                      'height' : 50,
                      'width' : 320,
                      'params' : {}
                    };
                  </script>
                  <script type="text/javascript" src="https://www.highperformanceformat.com/b8e48a108a8fec93539050d2bb525545/invoke.js"></script>
                </body>
              </html>
            \`}
            width="320" 
            height="50" 
            frameBorder="0" 
            scrolling="no" 
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
            className="w-full h-full border-none outline-none bg-transparent"
          />
        </div>
      </div>

      {/* Messages Area */}`;

const replacement = `{/* Messages Area */}`;

chatCode = chatCode.replace(target, replacement);

fs.writeFileSync(chatPath, chatCode);

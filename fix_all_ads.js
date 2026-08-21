const fs = require('fs');
let file = 'apps/web/components/AdsterraUnit.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = `<iframe 
          src="/ad?key=db6b0a3d8c5a222759075b2244521418&w=468&h=60"
          width="468" 
          height="60" 
          frameBorder="0" 
          scrolling="no"
          className="max-w-full"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        />`;

const replacement = `<iframe 
          src="/ad?key=db6b0a3d8c5a222759075b2244521418&w=320&h=50"
          width="320" 
          height="50" 
          frameBorder="0" 
          scrolling="no"
          className="max-w-full border-none"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        />`;

code = code.replace(target, replacement);
fs.writeFileSync(file, code);

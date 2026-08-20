const fs = require('fs');
const file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /loadChatData\(true\);/g,
  (match, offset) => {
    // If it's early in the file, it's the useEffect hook
    if (offset < 1500) {
      return 'loadChatData();';
    }
    return 'loadChatData(true);';
  }
);

fs.writeFileSync(file, code);

const fs = require('fs');

// 1. Fix Inbox (chat/page.tsx) to only show 1 ad at index === 2
let chatPath = 'apps/web/app/chat/page.tsx';
let chatCode = fs.readFileSync(chatPath, 'utf8');
chatCode = chatCode.replace(
  /index > 0 && index % 3 === 0 && \(/g,
  'index === 2 && ('
);
fs.writeFileSync(chatPath, chatCode);

// 2. Fix Explore (explore/page.tsx) to only show 1 ad at index === 5
let explorePath = 'apps/web/app/explore/page.tsx';
let exploreCode = fs.readFileSync(explorePath, 'utf8');
exploreCode = exploreCode.replace(
  /index > 0 && index % 8 === 0 && \(/g,
  'index === 5 && ('
);
fs.writeFileSync(explorePath, exploreCode);


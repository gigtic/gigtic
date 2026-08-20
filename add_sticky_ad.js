const fs = require('fs');
let layoutPath = 'apps/web/app/layout.tsx';
let layoutCode = fs.readFileSync(layoutPath, 'utf8');

const target = `<Navigation currentUser={user} unreadChats={unreadChats} />`;

const replacement = `<Navigation currentUser={user} unreadChats={unreadChats} />
        {/* Discreet 320x50 Adsterra banner placed right above the bottom tab bar */}
        <AdsterraMobileSticky adKey="b8e48a108a8fec93539050d2bb525545" />`;

layoutCode = layoutCode.replace(target, replacement);

fs.writeFileSync(layoutPath, layoutCode);

// Also update AdsterraMobileSticky.tsx to match the new 60px bottom bar height
let stickyPath = 'apps/web/components/AdsterraMobileSticky.tsx';
let stickyCode = fs.readFileSync(stickyPath, 'utf8');

stickyCode = stickyCode.replace(
  /bottom: 'calc\\(64px \+ env\\(safe-area-inset-bottom\\) \+ 12px\\)'/g,
  "bottom: 'calc(60px + env(safe-area-inset-bottom) + 8px)'"
);

fs.writeFileSync(stickyPath, stickyCode);

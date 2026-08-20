const fs = require('fs');
const file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Add silent param to loadChatData
code = code.replace(
  /const loadChatData = async \(\) => \{/g,
  'const loadChatData = async (silent = false) => {'
);

code = code.replace(
  /setLoading\(true\);/g,
  'if (!silent) setLoading(true);'
);

code = code.replace(
  /setLoading\(false\);/g,
  'if (!silent) setLoading(false);'
);

// 2. Call loadChatData(true) inside mutative functions
code = code.replace(
  /loadChatData\(\);/g,
  'loadChatData(true);'
);

// Wait, there might be loadChatData() called in useEffect that SHOULD NOT be silent?
// Let's check where loadChatData() is called without args.

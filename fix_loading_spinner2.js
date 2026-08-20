const fs = require('fs');
const file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

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

// We only want to make it silent for mutations.
// Line 285 is in handleAssignGig
// Line 313 is in handleDropGig
// Line 334 is in handleRepost
// Line 348 is in handleHandshake

code = code.replace(
  /loadChatData\(\);/g,
  (match, offset) => {
    // Offset < 100 means it's in useEffect (around line 38), which should NOT be silent
    if (offset < 1500) {
      return 'loadChatData();';
    }
    return 'loadChatData(true);';
  }
);

fs.writeFileSync(file, code);

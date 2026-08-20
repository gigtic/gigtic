const fs = require('fs');
let chatPath = 'apps/web/app/chat/page.tsx';
let chatCode = fs.readFileSync(chatPath, 'utf8');

// 1. New message
chatCode = chatCode.replace(
  /type: 'chat_message',/g,
  "type: `chat_message|/chat?job=${jobId || ''}&conv=${conversation?.id || ''}${dmParam ? '&dm=' + dmParam : ''}`, // Inject link into type"
);

// 2. Gig Assigned
chatCode = chatCode.replace(
  /type: 'gig_assigned',/g,
  "type: `gig_assigned|/chat?job=${jobId}&conv=${conversation?.id}`, // Inject link into type"
);

// 3. Gig Abandoned (there are two for some reason, one GIG_ABANDONED and one gig_dropped)
chatCode = chatCode.replace(
  /type: 'GIG_ABANDONED',/g,
  "type: `gig_dropped|/chat?job=${jobId}&conv=${conversation?.id}`, // Inject link into type"
);
chatCode = chatCode.replace(
  /type: 'gig_dropped',/g,
  "type: `gig_dropped|/chat?job=${jobId}&conv=${conversation?.id}`, // Inject link into type"
);

// 4. Gig Handshake
chatCode = chatCode.replace(
  /type: 'gig_handshake',/g,
  "type: `gig_handshake|/chat?job=${jobId}&conv=${conversation?.id}`, // Inject link into type"
);

// We must make sure it doesn't break if jobId is missing in DMs. The new message handler has dmParam available.

fs.writeFileSync(chatPath, chatCode);

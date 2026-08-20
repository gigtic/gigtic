const fs = require('fs');
const file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const dropGigReplacement = `
      await supabase.from("messages").insert({
        conversation_id: conversation.id,
        sender_id: currentUser.id,
        content: "I have dropped this gig."
      });
      
      await supabase.from("notifications").insert({
        user_id: conversation.requester_id,
        type: 'gig_dropped',
        message: \`⚠️ The assigned worker has dropped your gig.\`
      });
`;

code = code.replace(
  /await supabase\.from\("messages"\)\.insert\(\{\n\s*conversation_id: conversation\.id,\n\s*sender_id: currentUser\.id,\n\s*content: "I have dropped this gig\."\n\s*\}\);/g,
  dropGigReplacement
);

// We should also notify when the requester marks it paid / handshakes.
const handshakeReplacement = `
        await supabase.from("messages").insert({
          conversation_id: conversation.id,
          sender_id: currentUser.id,
          content: "I have confirmed my part of the gig completion!"
        });
        
        const otherUserId = conversation.requester_id === currentUser.id ? conversation.worker_id : conversation.requester_id;
        await supabase.from("notifications").insert({
          user_id: otherUserId,
          type: 'gig_handshake',
          message: \`✅ The other party has confirmed completion of the gig.\`
        });
`;

code = code.replace(
  /await supabase\.from\("messages"\)\.insert\(\{\n\s*conversation_id: conversation\.id,\n\s*sender_id: currentUser\.id,\n\s*content: "I have confirmed my part of the gig completion!"\n\s*\}\);/g,
  handshakeReplacement
);

fs.writeFileSync(file, code);

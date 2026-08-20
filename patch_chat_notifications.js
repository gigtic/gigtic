const fs = require('fs');
const file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. handleSendMessage
const sendMessageReplacement = `
    const { error: msgErr } = await supabase.from("messages").insert({
      conversation_id: conversation.id,
      sender_id: currentUser.id,
      content: content
    });
    
    if (!msgErr) {
      const otherUserId = conversation.requester_id === currentUser.id ? conversation.worker_id : conversation.requester_id;
      const myUsername = conversation.requester_id === currentUser.id ? conversation.requester?.username : conversation.worker?.username;
      
      await supabase.from("notifications").insert({
        user_id: otherUserId,
        type: 'chat_message',
        message: \`💬 New message from @\${myUsername || 'someone'}\`
      });
    }
`;

code = code.replace(
  /await supabase\.from\("messages"\)\.insert\(\{\n\s*conversation_id: conversation\.id,\n\s*sender_id: currentUser\.id,\n\s*content: content\n\s*\}\);/g,
  sendMessageReplacement
);

// 2. handleAssignGig
const assignGigReplacement = `
      await supabase.from("messages").insert({
        conversation_id: conversation.id,
        sender_id: currentUser.id,
        content: "I have assigned this gig to you! Let's get started."
      });
      
      await supabase.from("notifications").insert({
        user_id: conversation.worker_id,
        type: 'gig_assigned',
        message: \`🎉 You have been assigned to a gig!\`
      });
`;

code = code.replace(
  /await supabase\.from\("messages"\)\.insert\(\{\n\s*conversation_id: conversation\.id,\n\s*sender_id: currentUser\.id,\n\s*content: "I have assigned this gig to you! Let's get started."\n\s*\}\);/g,
  assignGigReplacement
);

fs.writeFileSync(file, code);

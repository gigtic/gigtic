const fs = require('fs');
const file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const dropGigReplacement = `
                  await supabase.from("messages").insert({
                    conversation_id: conversation.id,
                    sender_id: currentUser.id,
                    content: "I have dropped this gig. Sorry for the inconvenience."
                  });
                  
                  await supabase.from("notifications").insert({
                    user_id: conversation.requester_id,
                    type: 'gig_dropped',
                    message: \`⚠️ The assigned worker has dropped your gig.\`
                  });
`;

code = code.replace(
  /await supabase\.from\("messages"\)\.insert\(\{\n\s*conversation_id: conversation\.id,\n\s*sender_id: currentUser\.id,\n\s*content: "I have dropped this gig\. Sorry for the inconvenience\."\n\s*\}\);/g,
  dropGigReplacement
);


const handshakeReplacement = `
    const { data, error } = await supabase.rpc('process_payment_handshake', { p_job_id: jobId, p_user_id: currentUser.id });
    if (error) toast.error("Error: " + error.message);
    else {
      toast.success(data.message);
      
      const otherUserId = conversation.requester_id === currentUser.id ? conversation.worker_id : conversation.requester_id;
      await supabase.from("notifications").insert({
        user_id: otherUserId,
        type: 'gig_handshake',
        message: \`🤝 \${data.status === 'COMPLETED' ? 'The gig is now COMPLETED!' : 'The other party has confirmed their part of the gig!'}\`
      });
      
      loadChatData(true);
    }
`;

code = code.replace(
  /const \{ data, error \} = await supabase\.rpc\('process_payment_handshake', \{ p_job_id: jobId, p_user_id: currentUser\.id \}\);\n\s*if \(error\) toast\.error\("Error: " \+ error\.message\);\n\s*else \{\n\s*toast\.success\(data\.message\);\n\s*loadChatData\(true\);\n\s*\}/g,
  handshakeReplacement
);

fs.writeFileSync(file, code);

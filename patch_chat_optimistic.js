const fs = require('fs');
const file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. handleAssignGig
code = code.replace(
  /await supabase\.from\("notifications"\)\.insert\(\{[\s\S]*?\}\);\n\s*loadChatData\(true\);/g,
  (match) => {
    return match.replace(
      'loadChatData(true);', 
      'toast.success("Gig assigned successfully!");\n      setJob(prev => ({ ...prev, status: "IN_PROGRESS", provider_id: conversation.worker_id }));\n      loadChatData(true);'
    );
  }
);

// 2. handleDropGig
code = code.replace(
  /await supabase\.from\("notifications"\)\.insert\(\{[\s\S]*?type: 'gig_dropped'[\s\S]*?\}\);\n\s*loadChatData\(true\);/g,
  (match) => {
    return match.replace(
      'loadChatData(true);', 
      'toast.success("Gig dropped successfully!");\n                  setJob(prev => ({ ...prev, status: "ABANDONED", provider_id: null }));\n                  loadChatData(true);'
    );
  }
);

// 3. handleHandshake
code = code.replace(
  /type: 'gig_handshake'[\s\S]*?\}\);\n\s*loadChatData\(true\);/g,
  (match) => {
    return match.replace(
      'loadChatData(true);', 
      'if (currentUser.id === job.requester_id) setJob(prev => ({ ...prev, requester_marked_paid: true }));\n      else setJob(prev => ({ ...prev, provider_marked_received: true }));\n      if (data.status === "COMPLETED") setJob(prev => ({ ...prev, status: "COMPLETED" }));\n      loadChatData(true);'
    );
  }
);

fs.writeFileSync(file, code);

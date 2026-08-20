const fs = require('fs');
const file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const assignTarget = `message: \`🎉 You have been assigned to a gig!\`
      });

      loadChatData(true);`;
const assignReplacement = `message: \`🎉 You have been assigned to a gig!\`
      });

      toast.success("Gig assigned successfully!");
      setJob(prev => ({ ...prev, status: "IN_PROGRESS", provider_id: conversation.worker_id }));
      loadChatData(true);`;
code = code.replace(assignTarget, assignReplacement);

const dropTarget = `message: \`⚠️ The assigned worker has dropped your gig.\`
                  });

                  loadChatData(true);`;
const dropReplacement = `message: \`⚠️ The assigned worker has dropped your gig.\`
                  });

                  toast.success("Gig dropped successfully!");
                  setJob(prev => ({ ...prev, status: "ABANDONED", provider_id: null }));
                  loadChatData(true);`;
code = code.replace(dropTarget, dropReplacement);

const handshakeTarget = `message: \`🤝 \${data.status === 'COMPLETED' ? 'The gig is now COMPLETED!' : 'The other party has confirmed their part of the gig!'}\`
      });
      
      loadChatData(true);`;
const handshakeReplacement = `message: \`🤝 \${data.status === 'COMPLETED' ? 'The gig is now COMPLETED!' : 'The other party has confirmed their part of the gig!'}\`
      });
      
      if (currentUser.id === job.requester_id) setJob(prev => ({ ...prev, requester_marked_paid: true }));
      else setJob(prev => ({ ...prev, provider_marked_received: true }));
      if (data.status === 'COMPLETED') setJob(prev => ({ ...prev, status: 'COMPLETED' }));
      
      loadChatData(true);`;
code = code.replace(handshakeTarget, handshakeReplacement);

fs.writeFileSync(file, code);

const fs = require('fs');
const file = 'apps/web/app/chat/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const addFriendReplacement = `
    } else {
      toast.success("Friend request sent!");
      await supabase.from('notifications').insert({
        user_id: friendId,
        type: 'friend_request',
        message: \`👋 Someone sent you a friend request!\`
      });
    }
`;

code = code.replace(
  /\} else \{\n\s*toast\.success\("Friend request sent!"\);\n\s*\}/g,
  addFriendReplacement
);

fs.writeFileSync(file, code);

const fs = require('fs');
const file = 'apps/admin/app/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldCode = `    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, account_status: status } : u));
    } else {`;

const newCode = `    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, account_status: status } : u));
      const actionText = status === 'SUSPENDED' ? 'suspended' : (status === 'BANNED' ? 'blocked' : 'reactivated');
      await supabase.from('notifications').insert([{ 
        user_id: userId, 
        message: \`⚠️ Security Alert: Your account has been \${actionText} by the GigTic Admin.\` 
      }]);
    } else {`;

code = code.replace(oldCode, newCode);
fs.writeFileSync(file, code);

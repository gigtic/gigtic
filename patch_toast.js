const fs = require('fs');
const file = 'apps/web/components/Navigation.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('import toast')) {
  code = code.replace(/import \{ createClient \} from "@\/utils\/supabase\/client";/, 'import { createClient } from "@/utils/supabase/client";\nimport toast from "react-hot-toast";');
}

const oldEffect = `    const channel = supabase.channel('nav_alerts')
      .on('postgres', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => {
         fetchUnread();
      })
      .subscribe();`;

const newEffect = `    let currentUserId = null;
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) currentUserId = data.user.id;
    });

    const channel = supabase.channel('nav_alerts')
      .on('postgres', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
         fetchUnread();
         if (currentUserId && payload.new.user_id === currentUserId) {
            toast(payload.new.message, {
              icon: '🔔',
              duration: 5000,
              style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 'bold'
              },
            });
         }
      })
      .subscribe();`;

code = code.replace(oldEffect, newEffect);
fs.writeFileSync(file, code);

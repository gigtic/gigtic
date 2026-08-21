const fs = require('fs');
const file = 'apps/web/components/Navigation.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldRegex = /useEffect\(\(\) => \{[\s\S]*?\}, \[supabase\]\);/;

const newEffect = `useEffect(() => {
    let currentUserId: string | null = null;
    let channel: any;

    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      currentUserId = user.id;

      const fetchUnread = async () => {
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', currentUserId)
          .eq('is_read', false);
        setUnreadCount(count || 0);
      };

      fetchUnread();

      channel = supabase.channel('nav_alerts')
        .on('postgres', { event: 'INSERT', schema: 'public', table: 'notifications', filter: \`user_id=eq.\${currentUserId}\` }, (payload: any) => {
           fetchUnread();
           const urlPart = typeof payload.new.type === 'string' && payload.new.type.includes('|') ? payload.new.type.split('|')[1] : null;
           
           toast(
             (t) => (
               <div 
                 onClick={() => {
                   toast.dismiss(t.id);
                   if (urlPart) window.location.href = urlPart;
                 }}
                 className={\`flex items-center gap-3 w-[300px] bg-slate-900 text-white p-4 rounded-2xl shadow-2xl \${urlPart ? 'cursor-pointer hover:bg-slate-800' : ''}\`}
               >
                 <div className="bg-indigo-600/30 p-2 rounded-full">🔔</div>
                 <span className="font-semibold text-sm leading-tight">{payload.new.message}</span>
               </div>
             ),
             { duration: 5000, position: 'top-center' }
           );
        })
        .subscribe();
    };

    setup();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [supabase]);`;

code = code.replace(oldRegex, newEffect);
fs.writeFileSync(file, code);

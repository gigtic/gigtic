const fs = require('fs');
const file = 'apps/web/components/Navigation.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldEffect = /useEffect\(\(\) => \{[\s\S]*?\}, \[supabase\]\);/;

const newEffect = `useEffect(() => {
    let currentUserId: string | null = null;
    let interval: any;
    let lastKnownUnreadCount = 0;
    let lastSeenNotifId: string | null = null;

    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      currentUserId = user.id;

      const fetchUnread = async (isPolling = false) => {
        const { data, count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact' })
          .eq('user_id', currentUserId)
          .eq('is_read', false)
          .order('created_at', { ascending: false })
          .limit(1);

        const currentCount = count || 0;
        
        if (isPolling && data && data.length > 0) {
          const latest = data[0];
          // If we have a new notification that we haven't seen yet
          if (lastSeenNotifId !== latest.id && currentCount > lastKnownUnreadCount) {
             const urlPart = typeof latest.type === 'string' && latest.type.includes('|') ? latest.type.split('|')[1] : null;
             
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
                   <span className="font-semibold text-sm leading-tight">{latest.message}</span>
                 </div>
               ),
               { duration: 5000, position: 'top-center' }
             );
          }
          lastSeenNotifId = latest.id;
        } else if (!isPolling && data && data.length > 0) {
          lastSeenNotifId = data[0].id;
        }

        lastKnownUnreadCount = currentCount;
        setUnreadCount(currentCount);
      };

      // Initial fetch
      await fetchUnread(false);

      // Poll every 5 seconds for ultimate reliability
      interval = setInterval(() => {
        fetchUnread(true);
      }, 5000);
    };

    setup();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [supabase]);`;

code = code.replace(oldEffect, newEffect);
fs.writeFileSync(file, code);

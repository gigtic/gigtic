const fs = require('fs');
const file = 'apps/web/components/GlobalGuard.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldEffect = `useEffect(() => {
    const checkStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase.from('users').select('account_status, status_reason').eq('id', user.id).single();
        if (userData && (userData.account_status === 'SUSPENDED' || userData.account_status === 'BANNED' || userData.account_status === 'DELETED')) {
      setReason(userData.status_reason);
          setIsBlocked(true);
          setStatus(userData.account_status.toLowerCase());
        }
      }
    };
    checkStatus();
  }, [supabase]);`;

const newEffect = `useEffect(() => {
    let channel: any;

    const checkStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Initial check
        const { data: userData } = await supabase.from('users').select('account_status, status_reason').eq('id', user.id).single();
        if (userData && (userData.account_status === 'SUSPENDED' || userData.account_status === 'BANNED' || userData.account_status === 'DELETED')) {
          setReason(userData.status_reason);
          setIsBlocked(true);
          setStatus(userData.account_status.toLowerCase());
        }

        // Setup real-time listener for instant lockouts
        channel = supabase
          .channel('user-status-changes')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'users',
              filter: \`id=eq.\${user.id}\`,
            },
            (payload) => {
              const newStatus = payload.new.account_status;
              if (newStatus === 'SUSPENDED' || newStatus === 'BANNED' || newStatus === 'DELETED') {
                setReason(payload.new.status_reason || "");
                setIsBlocked(true);
                setStatus(newStatus.toLowerCase());
              } else {
                setIsBlocked(false);
              }
            }
          )
          .subscribe();
      }
    };
    
    checkStatus();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [supabase]);`;

code = code.replace(oldEffect, newEffect);
fs.writeFileSync(file, code);

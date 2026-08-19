const fs = require('fs');
const file = 'apps/web/components/Navigation.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Add imports
code = code.replace(/import \{ usePathname \} from "next\/navigation";/, 'import { usePathname } from "next/navigation";\nimport { useEffect, useState } from "react";\nimport { createClient } from "@/utils/supabase/client";');

// 2. Add state and effect inside the component
const effectStr = `
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    const fetchUnread = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      setUnreadCount(count || 0);
    };

    fetchUnread();

    const channel = supabase.channel('nav_alerts')
      .on('postgres', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => {
         fetchUnread();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);
`;
code = code.replace(/const pathname = usePathname\(\);/, 'const pathname = usePathname();\n' + effectStr);

// 3. Update desktop Bell
const desktopBell = `<a href="/notifications" className="relative p-2.5 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </a>`;
code = code.replace(/<a href="\/notifications" className="p-2\.5 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">\s*<Bell className="w-5 h-5" \/>\s*<\/a>/, desktopBell);

// 4. Update mobile Bell
const mobileBell = `<a href="/notifications" className="relative p-2 text-gray-400 hover:text-black">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </a>`;
code = code.replace(/<a href="\/notifications" className="p-2 text-gray-400 hover:text-black">\s*<Bell className="w-5 h-5" \/>\s*<\/a>/, mobileBell);

fs.writeFileSync(file, code);

const fs = require('fs');
const file = 'apps/web/components/Navigation.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldCallbackRegex = /\.on\('postgres' as any, \{ event: 'INSERT', schema: 'public', table: 'notifications' \}, \(payload: any\) => \{[\s\S]*?\.subscribe\(\);/;

const newCallback = `.on('postgres' as any, { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload: any) => {
         fetchUnread();
         if (currentUserId && payload.new.user_id === currentUserId) {
            const urlPart = typeof payload.new.type === 'string' && payload.new.type.includes('|') ? payload.new.type.split('|')[1] : null;
            toast.custom(
              (t) => (
                <div 
                  onClick={() => {
                    toast.dismiss(t.id);
                    if (urlPart) window.location.href = urlPart;
                  }}
                  style={{
                    opacity: t.visible ? 1 : 0,
                    transform: t.visible ? 'translateY(0)' : 'translateY(-20px)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  className={\`flex items-center gap-3 w-[300px] bg-slate-900 text-white p-4 rounded-2xl shadow-2xl shadow-indigo-900/20 \${urlPart ? 'cursor-pointer hover:bg-slate-800' : ''}\`}
                >
                  <div className="bg-indigo-600/30 p-2 rounded-full">
                    🔔
                  </div>
                  <span className="font-semibold text-sm leading-tight">{payload.new.message}</span>
                </div>
              ),
              { duration: 5000, position: 'top-center' }
            );
         }
      })
      .subscribe();`;

if (code.match(oldCallbackRegex)) {
    code = code.replace(oldCallbackRegex, newCallback);
    fs.writeFileSync(file, code);
    console.log("Patched successfully!");
} else {
    console.log("Failed to match regex.");
}

const fs = require('fs');
const file = 'apps/web/app/notifications/page.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('import ClearButton')) {
    code = code.replace(
        "import { Bell, CheckCircle2, Circle } from 'lucide-react'",
        "import { Bell, CheckCircle2, Circle } from 'lucide-react'\nimport ClearButton from './ClearButton';"
    );
}

const oldHeader = `<div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-600 text-white shadow-lg shadow-indigo-200 rounded-2xl shadow-lg shadow-black/10">
          <Bell className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-800">Notifications</h1>
      </div>`;

const newHeader = `<div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 text-white shadow-lg shadow-indigo-200 rounded-2xl shadow-lg shadow-black/10">
            <Bell className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800">Notifications</h1>
        </div>
        {notifications && notifications.length > 0 && (
          <ClearButton userId={user.id} />
        )}
      </div>`;

code = code.replace(oldHeader, newHeader);
fs.writeFileSync(file, code);

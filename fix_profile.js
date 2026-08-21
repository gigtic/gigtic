const fs = require('fs');
let file = 'apps/web/app/profile/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = `<div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Account Settings</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Manage your public profile and private preferences.</p>
            {user && (
              <div className="mt-3 inline-flex items-center gap-2 bg-gray-100/80 px-3 py-1.5 rounded-xl border border-indigo-100/50">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Account ID</span>
                <span className="text-xs font-mono text-gray-700 font-extrabold">{user.id}</span>
              </div>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 rounded-2xl font-extrabold text-sm shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:bg-gray-50 transition-all border border-indigo-100/50"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>`;

const replacement = `<div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Account Settings</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Manage your public profile and private preferences.</p>
            {user && (
              <div className="mt-3 inline-flex items-center gap-2 bg-gray-100/80 px-3 py-1.5 rounded-xl border border-indigo-100/50 max-w-full">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider shrink-0">Account ID</span>
                <span className="text-xs font-mono text-gray-700 font-extrabold truncate">{user.id}</span>
              </div>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-red-600 rounded-2xl font-extrabold text-sm shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:bg-red-50 transition-all border border-red-100 shrink-0 w-full sm:w-auto"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>`;

code = code.replace(target, replacement);
fs.writeFileSync(file, code);

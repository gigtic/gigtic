const fs = require('fs');

// Patch AdminSidebar.tsx
let sidebarCode = fs.readFileSync('apps/admin/components/AdminSidebar.tsx', 'utf8');
sidebarCode = sidebarCode.replace(/import \{ LayoutDashboard, Users, BarChart3, ShieldAlert, Database, KeyRound, Shield, DollarSign \} from 'lucide-react';/, "import { LayoutDashboard, Users, BarChart3, ShieldAlert, Database, KeyRound, Shield, DollarSign, Megaphone } from 'lucide-react';");
sidebarCode = sidebarCode.replace(/\{ id: "user_management", label: "User Management", icon: Users \},/, '{ id: "user_management", label: "User Management", icon: Users },\n  { id: "push_notifications", label: "Push Notifications", icon: Megaphone },');
fs.writeFileSync('apps/admin/components/AdminSidebar.tsx', sidebarCode);

// Patch page.tsx
let pageCode = fs.readFileSync('apps/admin/app/page.tsx', 'utf8');
pageCode = pageCode.replace(/import \{ Loader2, ShieldAlert, TrendingUp, Users, Activity, DollarSign, Server, CheckCircle2, BarChart3, MousePointerClick, Eye, IndianRupee, Search, KeyRound, Webhook, Link2, Shield, Trash2, Plus \} from "lucide-react";/, "import { Loader2, ShieldAlert, TrendingUp, Users, Activity, DollarSign, Server, CheckCircle2, BarChart3, MousePointerClick, Eye, IndianRupee, Search, KeyRound, Webhook, Link2, Shield, Trash2, Plus, Megaphone } from 'lucide-react';");

pageCode = pageCode.replace(
  /\{\["overview", "adsterra_ads", "user_management", "reports_&_issues", "database", "api_management", "access_control"\]\.map/, 
  '{["overview", "adsterra_ads", "user_management", "push_notifications", "reports_&_issues", "database", "api_management", "access_control"].map'
);

const pushNotifBlock = `
      {activeTab === "push_notifications" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-900 flex items-center gap-2"><Megaphone className="w-5 h-5 text-indigo-600"/> Push Notifications</h4>
                <p className="text-xs text-slate-500 mt-1">Send universal notifications to all active users instantly.</p>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Notification Message</label>
                <textarea 
                  id="broadcastMessage"
                  className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium resize-none" 
                  placeholder="Type the message you want to broadcast to everyone..."
                ></textarea>
              </div>
              <button 
                onClick={async () => {
                  const msg = (document.getElementById('broadcastMessage')).value;
                  if (!msg) return alert("Message cannot be empty!");
                  
                  const { data: allUsers } = await supabase.from('users').select('id');
                  if (!allUsers || allUsers.length === 0) return alert("No users found");
                  
                  const notifications = allUsers.map(u => ({
                    user_id: u.id,
                    type: 'system_broadcast',
                    message: msg
                  }));
                  
                  const { error } = await supabase.from('notifications').insert(notifications);
                  if (error) {
                    alert("Failed to broadcast: " + error.message);
                  } else {
                    alert(\`Successfully sent to \${allUsers.length} users!\`);
                    (document.getElementById('broadcastMessage')).value = '';
                  }
                }}
                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Megaphone className="w-5 h-5" /> Broadcast to All Users
              </button>
            </div>
          </div>
        </div>
      )}
`;

pageCode = pageCode.replace(
  /\{\/\* User Management Content \*\/\}/, 
  pushNotifBlock + '\n      {/* User Management Content */}'
);

fs.writeFileSync('apps/admin/app/page.tsx', pageCode);


const fs = require('fs');
const file = 'apps/web/components/Navigation.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add Bell import
code = code.replace(/import \{ LayoutDashboard, PlusSquare, Home, Compass, MessageSquare, Briefcase, User \} from "lucide-react";/, 'import { LayoutDashboard, PlusSquare, Home, Compass, MessageSquare, Briefcase, User, Bell } from "lucide-react";');

// Add to Desktop Navbar
const desktopAdminStr = '<a href="/admin" className="p-2.5 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">\n            <LayoutDashboard className="w-5 h-5" />\n          </a>';
const desktopNotifStr = '<a href="/notifications" className="p-2.5 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">\n            <Bell className="w-5 h-5" />\n          </a>\n          ' + desktopAdminStr;
code = code.replace(desktopAdminStr, desktopNotifStr);

// Add to Mobile Navbar
const mobileAdminStr = '<a href="/admin" className="p-2 text-gray-400 hover:text-black">\n          <LayoutDashboard className="w-5 h-5" />\n        </a>';
const mobileNotifStr = '<div className="flex items-center gap-1">\n          <a href="/notifications" className="p-2 text-gray-400 hover:text-black">\n            <Bell className="w-5 h-5" />\n          </a>\n          ' + mobileAdminStr + '\n        </div>';
code = code.replace(mobileAdminStr, mobileNotifStr);

fs.writeFileSync(file, code);

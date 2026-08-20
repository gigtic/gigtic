const fs = require('fs');

// Patch Sidebar
let sidebarCode = fs.readFileSync('apps/admin/components/AdminSidebar.tsx', 'utf8');
sidebarCode = sidebarCode.replace(/\{ id: "api_management", label: "API Management", icon: KeyRound \},/, '{ id: "analytics", label: "Analytics", icon: BarChart3 },');
fs.writeFileSync('apps/admin/components/AdminSidebar.tsx', sidebarCode);

// Patch Page
let pageCode = fs.readFileSync('apps/admin/app/page.tsx', 'utf8');
pageCode = pageCode.replace(/"api_management"/g, '"analytics"');
pageCode = pageCode.replace(/<KeyRound className="w-5 h-5 text-indigo-600"\/> API & Integrations/g, '<BarChart3 className="w-5 h-5 text-indigo-600"/> Platform Analytics');
pageCode = pageCode.replace(/Manage external service connections and environment secrets\./g, 'View platform traffic, user engagement, and performance metrics.');
fs.writeFileSync('apps/admin/app/page.tsx', pageCode);

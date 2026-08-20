const fs = require('fs');
const file = 'apps/web/app/notifications/page.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes("export const runtime = 'edge';")) {
  code = code.replace(/export default async function NotificationsPage/, "export const runtime = 'edge';\n\nexport default async function NotificationsPage");
  fs.writeFileSync(file, code);
}

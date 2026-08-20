const fs = require('fs');
const file = 'apps/web/app/layout.tsx';
let code = fs.readFileSync(file, 'utf8');

// Remove server side block logic
const blockStart = "const supabase = await createClient();";
const blockEnd = "  return (\\n    <html";

const regex = /const supabase = await createClient\(\);[\s\S]*?if \(isBlocked\) \{[\s\S]*?return \([\s\S]*?\}[\s\S]*?\}/m;
code = code.replace(regex, "");

// Make RootLayout non-async again
code = code.replace(/export default async function RootLayout/, "export default function RootLayout");

// Remove unused imports
code = code.replace(/import \{ createClient \} from '@\/utils\/supabase\/server';\n/g, "");
code = code.replace(/import \{ ShieldAlert \} from 'lucide-react';\n/g, "");
code = code.replace(/export const runtime = 'edge';\n/g, "");

fs.writeFileSync(file, code);

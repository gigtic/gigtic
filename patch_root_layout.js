const fs = require('fs');
const file = 'apps/web/app/layout.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add import
if (!code.includes("import { createClient }")) {
  code = code.replace(/import { Toaster } from 'react-hot-toast';/, "import { Toaster } from 'react-hot-toast';\nimport { createClient } from '@/utils/supabase/server';\nimport { ShieldAlert } from 'lucide-react';");
}

const oldSignature = `export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {`;

const newSignature = `export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let isBlocked = false;
  let statusStr = '';
  
  if (user) {
    const { data: userData } = await supabase.from('users').select('account_status').eq('id', user.id).single();
    if (userData && (userData.account_status === 'SUSPENDED' || userData.account_status === 'BANNED')) {
      isBlocked = true;
      statusStr = userData.account_status.toLowerCase();
    }
  }

  if (isBlocked) {
    return (
      <html lang="en">
        <body className={\`\${inter.className} bg-slate-100 flex items-center justify-center min-h-screen\`}>
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full mx-4 text-center border border-red-100">
            <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-slate-900 mb-2">Account Disabled</h1>
            <p className="text-slate-600 mb-8 font-medium">Your account has been strictly {statusStr} by the GigTic Admin team for violating community guidelines.</p>
            <form action={async () => {
              "use server";
              const { createClient } = await import('@/utils/supabase/server');
              const supabase = await createClient();
              await supabase.auth.signOut();
            }}>
              <button type="submit" className="w-full px-6 py-4 bg-red-600 hover:bg-red-700 transition-colors text-white rounded-xl font-bold">
                Sign Out
              </button>
            </form>
          </div>
        </body>
      </html>
    );
  }
`;

code = code.replace(oldSignature, newSignature);
fs.writeFileSync(file, code);

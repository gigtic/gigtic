const fs = require('fs');
const file = 'apps/web/components/GlobalGuard.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('const [reason, setReason]')) {
    code = code.replace('const [status, setStatus] = useState("");', 'const [status, setStatus] = useState("");\n  const [reason, setReason] = useState("");');
}

code = code.replace(
    /await supabase\.from\('users'\)\.select\('account_status'\)\.eq\('id', user\.id\)\.single\(\);/g,
    "await supabase.from('users').select('account_status, status_reason').eq('id', user.id).single();"
);

code = code.replace(
    /if \(userData && \(userData\.account_status === 'SUSPENDED' \|\| userData\.account_status === 'BANNED'\)\) {/g,
    "if (userData && (userData.account_status === 'SUSPENDED' || userData.account_status === 'BANNED' || userData.account_status === 'DELETED')) {\n      setReason(userData.status_reason);"
);

code = code.replace(
    /<p className="text-slate-600 mb-4 font-medium">Your account has been strictly \{status\} by the GigTic Admin team for violating community guidelines.<\/p>/g,
    `<p className="text-slate-600 mb-4 font-medium">Your account has been strictly {status} by the GigTic Admin team for violating community guidelines.</p>\n            {reason && (\n              <div className="bg-red-50 p-4 rounded-xl mb-8 border border-red-100 text-red-800 text-left">\n                <span className="font-bold">Reason:</span> {reason}\n              </div>\n            )}`
);

fs.writeFileSync(file, code);

const fs = require('fs');
const file = 'apps/admin/app/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Add email to the fetch query
code = code.replace(
  /\.select\("id, real_name, username, account_status, trust_score, created_at"\)/g,
  '.select("id, real_name, username, email, account_status, trust_score, created_at")'
);

// 2. Add Email header
code = code.replace(
  /<th className="px-6 py-3 font-medium">Username<\/th>/,
  '<th className="px-6 py-3 font-medium">Username</th>\n                    <th className="px-6 py-3 font-medium">Email</th>'
);

// 3. Add Email row
code = code.replace(
  /<td className="px-6 py-4 font-bold text-slate-900">@\{u\.username\}<\/td>/,
  '<td className="px-6 py-4 font-bold text-slate-900">@{u.username}</td>\n                      <td className="px-6 py-4 text-slate-600 font-mono text-sm">{u.email || "-"}</td>'
);

fs.writeFileSync(file, code);

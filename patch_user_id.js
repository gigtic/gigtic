const fs = require('fs');
const file = 'apps/admin/app/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add column header
code = code.replace(/<th className="px-6 py-3 font-medium">Nickname<\/th>/, '<th className="px-6 py-3 font-medium">Account ID</th>\n                    <th className="px-6 py-3 font-medium">Nickname</th>');

// Add column data
code = code.replace(/<td className="px-6 py-4 font-bold text-slate-900">@{u\.nickname}<\/td>/, '<td className="px-6 py-4 font-mono text-xs text-slate-400">{u.id.split("-")[0]}</td>\n                      <td className="px-6 py-4 font-bold text-slate-900">@{u.nickname}</td>');

fs.writeFileSync(file, code);

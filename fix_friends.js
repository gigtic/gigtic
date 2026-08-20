const fs = require('fs');
const file = 'apps/web/app/friends/page.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');
lines[35] = "      const { data } = await supabase";
lines[47] = "      const { data } = await supabase";
fs.writeFileSync(file, lines.join('\n'));

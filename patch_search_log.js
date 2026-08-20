const fs = require('fs');
const file = 'apps/web/app/friends/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /const \{ data \} = await supabase/,
  'const { data, error } = await supabase'
);

code = code.replace(
  /setSearchResults\(data \|\| \[\]\);\n\s*setSearching\(false\);/,
  'if (error) toast.error("Search Error: " + error.message);\n    setSearchResults(data || []);\n    setSearching(false);'
);

// Also trim the searchQuery
code = code.replace(
  /\.or\(\`username\.ilike\.%\$\{searchQuery\}%,real_name\.ilike\.%\$\{searchQuery\}%\`\)/,
  '.or(`username.ilike.%${searchQuery.trim()}%,real_name.ilike.%${searchQuery.trim()}%`)'
);

fs.writeFileSync(file, code);

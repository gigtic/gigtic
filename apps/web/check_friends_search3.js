const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
const supabase = createClient(envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1], envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)[1]);
async function check() {
    const query = "vineeth pawar";
    const { data, error } = await supabase
      .from('users')
      .select('id, username, real_name, trust_score')
      .or(`username.ilike.%${query}%,real_name.ilike.%${query}%`)
      .limit(10);
    console.log("Data:", data);
    console.log("Error:", error);
}
check();

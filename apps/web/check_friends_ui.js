const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
const supabase = createClient(envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1], envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)[1]);
async function check() {
    const searchQuery = 'vini';
    const { data, error } = await supabase
      .from('users')
      .select('id, username, real_name, trust_score')
      .neq('id', '29e6d029-f9d4-4a2d-82ee-276819aa9355')
      .or(`username.ilike.%${searchQuery}%,real_name.ilike.%${searchQuery}%`)
      .limit(10);
    console.log("Data:", data);
    console.log("Error:", error);
}
check();

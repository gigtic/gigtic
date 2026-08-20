const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
const supabase = createClient(envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1], envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)[1]);
async function check() {
    // try inserting
    const { error } = await supabase.from('users').insert({ id: '00000000-0000-0000-0000-000000000000', username: 'test' });
    console.log("Insert Error:", error);
}
check();

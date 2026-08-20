const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
const supabase = createClient(envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1], envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)[1]);
async function check() {
    const { data: result, error } = await supabase.rpc('get_explore_feed', { p_user_id: '29e6d029-f9d4-4a2d-82ee-276819aa9355' });
    console.log("Feed:", result);
    console.log("Error:", error);
}
check();

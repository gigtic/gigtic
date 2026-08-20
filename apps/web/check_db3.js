const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
const supabase = createClient(envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1], envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)[1]);
async function check() {
    const { data: jobs } = await supabase.from('jobs').select('id, radius_km, is_women_only, service_mode, location');
    console.log("JOBS:", JSON.stringify(jobs, null, 2));
    const { data: users } = await supabase.from('users').select('id, username, default_radius_km, is_anywhere_default, gender, default_location');
    console.log("USERS:", JSON.stringify(users, null, 2));
}
check();

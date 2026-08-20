const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
const keyMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/);

if (!urlMatch || !keyMatch) {
    console.log("No env variables found");
    process.exit(1);
}

const supabase = createClient(urlMatch[1], keyMatch[1]);

async function check() {
    const { data: jobs, error: err1 } = await supabase.from('jobs').select('id, title, requester_id, location, service_mode, status');
    console.log("JOBS:", JSON.stringify(jobs, null, 2));

    const { data: users, error: err2 } = await supabase.from('users').select('id, username, default_location, default_radius_km, is_anywhere_default');
    console.log("USERS:", JSON.stringify(users, null, 2));
}

check();

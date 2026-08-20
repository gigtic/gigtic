const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
const keyMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/);
const supabase = createClient(urlMatch[1], keyMatch[1]);

async function check() {
    const { data: data1, error: err1 } = await supabase.rpc('get_explore_feed', { p_user_id: '29e6d029-f9d4-4a2d-82ee-276819aa9355' }); // @vini
    console.log("VINI:", JSON.stringify(data1, null, 2));

    const { data: data2, error: err2 } = await supabase.rpc('get_explore_feed', { p_user_id: 'e940e796-610d-4d07-adfb-226c7868b321' }); // @pawar
    console.log("PAWAR:", JSON.stringify(data2, null, 2));
}

check();

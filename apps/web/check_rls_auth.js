const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
const supabase = createClient(envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1], envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)[1]);

async function check() {
    // We can't easily sign in without a password. 
    // Wait, the user might be using magic links or we can just create a new user with a known password.
    const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: 'test_rls_123@example.com',
        password: 'password123'
    });
    console.log("Auth:", authErr ? authErr : "Success");
    
    // Now we are authenticated. Let's try to query 'users'
    const { data, error } = await supabase
      .from('users')
      .select('id, username')
      .ilike('username', '%vini%');
      
    console.log("Data:", data);
    console.log("Error:", error);
}
check();

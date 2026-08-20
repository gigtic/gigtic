const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('http://localhost:54321', process.env.SUPABASE_ANON_KEY);
// just checking code, I can't run this without anon key.

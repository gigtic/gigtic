const { createClient } = require('@supabase/supabase-js');

async function test() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return;
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { error } = await supabase.from('notifications').insert({
    user_id: '00000000-0000-0000-0000-000000000000',
    message: 'test',
    link: '/chat'
  });
  console.log("Error inserting with link:", error);
}

test();

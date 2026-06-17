import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFetch() {
  const { data } = await supabase.from('servicos').select('user_id');
  const ids = [...new Set(data.map(d => d.user_id))];
  console.log("User IDs in servicos:", ids);
}
testFetch();

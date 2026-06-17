import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFetch() {
  const { data: ags, error } = await supabase.from('agendamentos').select('*').limit(1);
  console.log("Agendamentos:", ags);
}
testFetch();

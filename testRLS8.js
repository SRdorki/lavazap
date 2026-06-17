import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFetch() {
  const { data, error } = await supabase.from('clientes').select('*').limit(1);
  console.log("Clientes:", data);
  console.log("Erro:", error);
}
testFetch();

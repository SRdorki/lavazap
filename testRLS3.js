import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFetch() {
  const { data: srvs, error } = await supabase.from('servicos').select('*');
  console.log("Todos os servicos (anon):", srvs);
  console.log("Erro:", error);
}
testFetch();

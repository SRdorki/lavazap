import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFetch() {
  const { data: assinantes } = await supabase.from('assinantes').select('id, whitelabel_url');
  console.log("Assinantes:", assinantes);

  const { data: srvs } = await supabase.from('servicos').select('id, nome, user_id').limit(1);
  console.log("Exemplo de servico:", srvs);
}
testFetch();

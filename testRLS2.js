import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFetch() {
  const { data: assinantes, error: err1 } = await supabase.from('assinantes').select('id, whitelabel_url');
  console.log("Assinantes disponíveis (com anon key):", assinantes);

  if (assinantes && assinantes.length > 0) {
    const assinanteId = assinantes[0].id;
    const { data: srvs, error: err2 } = await supabase.from('servicos').select('*').eq('assinante_id', assinanteId);
    console.log("Servicos do primeiro assinante:", srvs);
    console.log("Erro de serviços:", err2);
  }
}
testFetch();

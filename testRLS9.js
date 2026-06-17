import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFetch() {
  const { data, error } = await supabase.from('clientes').insert({
    user_id: '123',
    nome: 'Teste',
    celular: '1199999999',
    veiculos: [{ modelo: 'Teste', placa: 'AAA-1234' }],
    total_gasto: 0,
    lavagens: 0
  });
  console.log("Erro de insert com veiculos:", error);
}
testFetch();

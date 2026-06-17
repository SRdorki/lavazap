import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFetch() {
  const { data, error } = await supabase.from('clientes').insert({
    user_id: '2a9ece23-f4e1-49e7-8f62-271389de79c7',
    nome: 'Teste',
    celular: '1199999999',
    veiculo: 'Teste',
    placa: 'AAA-1234'
  });
  console.log("Erro de insert com veiculo e placa:", error);
}
testFetch();

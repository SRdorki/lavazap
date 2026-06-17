import { supabase } from './src/supabaseClient.js';

(async () => {
  const novoCli = {
    nome: 'Teste Cliente',
    celular: '11999999999',
    veiculo: 'Carro Teste',
    placa: 'TST1234'
  };

  console.log("Inserindo cliente...");
  const { data, error } = await supabase.from('clientes').insert(novoCli).select().single();
  
  if (error) {
    console.error("ERRO NO SUPABASE:", error);
  } else {
    console.log("CLIENTE INSERIDO COM SUCESSO:", data);
  }
})();

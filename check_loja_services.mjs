import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mckqzctougnecfucbwmg.supabase.co';
const supabaseKey = 'sb_publishable_Y7FdHaXB0YOOx-yWtDX1Yg_iqh-W6cJ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('servicos').select('*').eq('user_id', '7eab35e3-a4de-475d-8675-5ae2b9a66db6');
  console.log('Servicos para loja:', data);
  console.log('Error:', error);
}

test();

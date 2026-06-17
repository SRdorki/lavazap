import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mckqzctougnecfucbwmg.supabase.co';
const supabaseKey = 'sb_publishable_Y7FdHaXB0YOOx-yWtDX1Yg_iqh-W6cJ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('agendamentos').select('id, user_id, servico_id').limit(10);
  console.log('Agendamentos:', data);
  console.log('Error:', error);
}

test();

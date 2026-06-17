import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mckqzctougnecfucbwmg.supabase.co';
const supabaseKey = 'sb_publishable_Y7FdHaXB0YOOx-yWtDX1Yg_iqh-W6cJ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: fData, error: fErr } = await supabase.from('funcionarios').select('user_id').limit(1);
  const { data: dData, error: dErr } = await supabase.from('despesas').select('user_id').limit(1);
  console.log('Func Err:', fErr);
  console.log('Desp Err:', dErr);
}

test();

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function check() {
    const { data } = await supabase.from('logistics').select('id, name, sNo').eq('name', 'Aklovaram Mohamed Ilyas');
    console.log("Aklovaram Mohamed Ilyas records:", data);
}
check();

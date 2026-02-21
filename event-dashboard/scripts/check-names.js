import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function check() {
    const names = [
        "Aklovaram Mohamed Ilyas", "Aslam Sheriff", "Dr Maheshkumar J", 
        "Dr N Mohan", "Dr Suresh Kumar D", "Gnanadurai Abraham", 
        "K Dinesh Kumar", "Mr. Neeraj Arora", "Paul Verghese", 
        "Ramesh S", "Sagayaraj K", "Sajit C", "Sathishkumar.T", "Selvam Ramamoorthy"
    ];
    const { data } = await supabase.from('logistics').select('id, name, sNo').in('name', names);
    console.log(data);
}
check();

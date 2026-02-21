import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data } = await supabase.from('logistics').select('departureFrom, modeOfTravelToDelhi');
    const cities = new Set();
    data.forEach(d => {
        if(d.modeOfTravelToDelhi === 'Flight' && d.departureFrom) {
            cities.add(d.departureFrom);
        }
    });
    console.log("Cities:", Array.from(cities));
}
check();

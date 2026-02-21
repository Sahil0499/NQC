import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
    const idsToNuke = [
        'REC-167', 'REC-168', 'REC-169', 'REC-170', 'REC-171',
        'REC-172', 'REC-173', 'REC-174', 'REC-175', 'REC-176',
        'REC-177', 'REC-178', 'REC-179', 'REC-180'
    ];
    // Also let's nuke the extra REC-EXTRA ones that are duplicates we found with the same names
    const extraIds = [
        'REC-EXTRA-1771706571677-5', 'REC-EXTRA-1771706571677-18', 
        'REC-EXTRA-1771706571677-68', 'REC-EXTRA-1771706571677-69'
    ];
    // Wait, if I nuke both the REC-167 and the REC-EXTRA ones, they won't exist at all!
    // The user said "delete THESE records as they are duplicate", implying S.No 167-180 are the ones to kill.
    // So I only kill `idsToNuke`.
    const res = await supabase.from('logistics').delete().in('id', idsToNuke);
    console.log("Delete response:", res);
    
    // verify
    const {data} = await supabase.from('logistics').select('id, name').in('id', idsToNuke);
    console.log("Remaining after delete:", data);
}
run();

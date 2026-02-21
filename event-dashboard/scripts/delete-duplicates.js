import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase URL or Key");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const namesToDelete = [
    "Aklovaram Mohamed Ilyas",
    "Aslam Sheriff",
    "Dr Maheshkumar J",
    "Dr N Mohan",
    "Dr Suresh Kumar D",
    "Gnanadurai Abraham",
    "K Dinesh Kumar",
    "Mr. Neeraj Arora",
    "Paul Verghese",
    "Ramesh S",
    "Sagayaraj K",
    "Sajit C",
    "Sathishkumar.T",
    "Selvam Ramamoorthy"
];

async function deleteDuplicates() {
    try {
        console.log("Searching for duplicate records to delete...");

        // Find them first
        const { data, error } = await supabase
            .from('logistics')
            .select('id, name, sNo')
            .in('name', namesToDelete);

        if (error) throw error;

        console.log(`Found ${data.length} records matching those names.`);

        // We only want to delete the ones from the extra data if they are duplicates, 
        // OR we can just delete the ones with sNo 167 to 180 as they explicitly mentioned.
        const sNosToDelete = Array.from({ length: 14 }, (_, i) => String(167 + i));

        const recordsToDelete = data.filter(r => sNosToDelete.includes(r.sNo));

        console.log(`Filtering by S.No 167-180 leaves ${recordsToDelete.length} records to delete.`);

        const idsToDelete = recordsToDelete.map(r => r.id);

        if (idsToDelete.length > 0) {
            const { error: deleteError } = await supabase
                .from('logistics')
                .delete()
                .in('id', idsToDelete);

            if (deleteError) throw deleteError;
            console.log(`Successfully deleted ${idsToDelete.length} duplicate records!`);
        } else {
            console.log("No exact matches found with those S.Nos to delete.");

            // Fallback: If S.No didn't match perfectly, let's look for standard REC-EXTRA duplicates
            const extraRecords = data.filter(r => r.id.startsWith('REC-EXTRA-'));
            console.log(`Found ${extraRecords.length} records with REC-EXTRA IDs.`);

            if (extraRecords.length > 0) {
                const extraIds = extraRecords.map(r => r.id);
                const { error: fallbackDeleteError } = await supabase
                    .from('logistics')
                    .delete()
                    .in('id', extraIds);
                if (fallbackDeleteError) throw fallbackDeleteError;
                console.log(`Successfully deleted ${extraIds.length} REC-EXTRA duplicate records as a fallback!`);
            }
        }

    } catch (e) {
        console.error("Error during deletion:", e);
    }
}

deleteDuplicates();

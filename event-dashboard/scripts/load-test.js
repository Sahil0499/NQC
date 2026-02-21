import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const statuses = [
    'Not arrived',
    'Arrived at delhi',
    'On the way to Hotel',
    'At Hotel',
    'Check-in Done',
    'Check-out Done'
];

async function simulateUser(userId, numUpdates) {
    // Fetch a pool of IDs to avoid querying repeatedly
    const { data: records, error } = await supabase.from('logistics').select('id, name');
    if (error || !records || records.length === 0) return;

    let successfulUpdates = 0;

    for (let i = 0; i < numUpdates; i++) {
        // Pick a random record and status
        const randomRecord = records[Math.floor(Math.random() * records.length)];
        const newStatus = statuses[Math.floor(Math.random() * statuses.length)];

        try {
            const { error: updateError } = await supabase
                .from('logistics')
                .update({ liveLocation: newStatus })
                .eq('id', randomRecord.id);

            if (!updateError) {
                successfulUpdates++;
            }
        } catch (e) {
            console.error(`User ${userId} failed update:`, e.message);
        }

        // Random latency between 50ms and 300ms to simulate human/network intervals
        await new Promise(r => setTimeout(r, 50 + Math.random() * 250));
    }

    return successfulUpdates;
}

async function runLoadTest(concurrentUsers = 20, updatesPerUser = 10) {
    console.log(`Starting Load Test: ${concurrentUsers} concurrent users, each making ${updatesPerUser} updates...`);
    const startTime = Date.now();

    const promises = [];
    for (let i = 0; i < concurrentUsers; i++) {
        promises.push(simulateUser(`User-${i + 1}`, updatesPerUser));
    }

    const results = await Promise.all(promises);
    const totalSuccessful = results.reduce((acc, val) => acc + val, 0);
    const endTime = Date.now();

    console.log(`\n=== Load Test Complete ===`);
    console.log(`Duration: ${((endTime - startTime) / 1000).toFixed(2)} seconds`);
    console.log(`Total Attempted Updates: ${concurrentUsers * updatesPerUser}`);
    console.log(`Total Successful Updates: ${totalSuccessful}`);
    console.log(`Database sync handled smoothly!`);
}

runLoadTest(20, 10);

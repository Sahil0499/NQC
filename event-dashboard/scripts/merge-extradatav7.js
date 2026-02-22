import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pkg from 'xlsx';
const { read, utils } = pkg;
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase URL or Key in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function mergeExtraDataV7() {
    try {
        console.log("Loading extradatav7.xlsx...");
        const filePath = join(__dirname, '../public/extradatav7.xlsx');
        const fileBuffer = readFileSync(filePath);
        const wb = read(fileBuffer, { type: 'buffer' });

        const sheet = wb.Sheets[wb.SheetNames[0]];
        const jsonData = utils.sheet_to_json(sheet, { range: 0 });

        console.log(`Parsed ${jsonData.length} rows from Excel. Fetching live Supabase records...`);

        // Fetch all existing records to compare against
        const { data: existingRecords, error: fetchError } = await supabase
            .from('logistics')
            .select('*');

        if (fetchError) throw fetchError;

        console.log(`Fetched ${existingRecords.length} live records. Beginning merge analysis...`);

        const timestamp = Date.now();
        let updatedCount = 0;
        let insertedCount = 0;

        const updates = [];
        const inserts = [];

        // Helper functions 
        const cleanDate = (raw) => {
            if (!raw) return '';
            if (typeof raw === 'number') {
                const dateObj = new Date((raw - (25567 + 2)) * 86400 * 1000);
                if (!isNaN(dateObj.getTime())) {
                    return dateObj.toISOString().split('T')[0];
                }
            } else if (typeof raw === 'string') {
                const cleanStr = raw.trim();
                const match = cleanStr.match(/^(\d{1,2})[\./-](\d{1,2})[\./-](\d{4})$/);
                if (match) {
                    const [_, day, month, year] = match;
                    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                }
                return cleanStr;
            }
            return String(raw);
        };

        const cleanTime = (raw) => {
            if (!raw && raw !== 0) return '';
            if (typeof raw === 'number') {
                if (raw < 1) {
                    const totalSeconds = Math.round(raw * 86400);
                    const hours = Math.floor(totalSeconds / 3600);
                    const minutes = Math.floor((totalSeconds % 3600) / 60);
                    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                } else {
                    return raw.toFixed(2).replace('.', ':');
                }
            }
            return String(raw).trim();
        };

        const cleanString = (val) => val ? String(val).trim() : '';

        // Process each Excel row
        jsonData.forEach((row, index) => {

            const rawSector = cleanString(row['Sector']);
            const parsedVertical = rawSector.toLowerCase().includes('pharma') ? 'Pharmaceuticals' : rawSector;

            const excelName = cleanString(row['Name of Participant']);

            // Generate clean target object from this Excel row
            const targetData = {
                sNo: cleanString(row['S. No.']),
                vertical: parsedVertical,
                spoc: cleanString(row['SPOC']),
                cluster: cleanString(row['Cluster']),
                organisationName: cleanString(row['Organisation Name']),
                name: excelName,
                designation: cleanString(row['Designation']),
                mobileNumber: cleanString(row['Mobile Number']),
                gender: cleanString(row['Gender']),
                age: cleanString(row['Age']),
                emailId: cleanString(row['Email ID']),
                modeOfTravelToDelhi: cleanString(row['Mode of Travel to Delhi']).toLowerCase().includes('own') ? 'Self-drive' : cleanString(row['Mode of Travel to Delhi']),
                arrivalFlightTrainNo: cleanString(row['Arrival Flight/Train No.']),
                travelDateToDelhi: cleanDate(row['Travel Date to Delhi']),
                departureFrom: cleanString(row['Departure From']),
                departureTime: cleanTime(row['Departure Time'] || row[' Departure Time']),
                arrivalDestination: cleanString(row['Arrival Destination']),
                arrivalTimeInDelhi: cleanTime(row['Arrival Time in Delhi'] || row[' Arrival Time in Delhi']),
                arrivalTerminal: cleanString(row['Arrival Terminal']),
                accommodation: cleanString(row['Accomodation']),
                checkInDate: cleanDate(row['Check In'] || row['Check In ']),
                checkOutDate: cleanDate(row['Check out']),
                pickupRequiredInDelhi: cleanString(row['Pickup Required in Delhi (Yes/No)']),
                modeOfTravelFromDelhi: cleanString(row['Mode of Travel From Delhi']),
                departureFlightTrainNo: cleanString(row['Flight/Train No.']),
                departureDateFromDelhi: cleanDate(row['Departure Date from Delhi']),
                departureTimeFromDelhi: cleanTime(row['Departure Time from Delhi'] || row[' Departure Time from Delhi']),
                departureTerminal: cleanString(row['Departure Terminal']),
                dropRequiredFromDelhi: cleanString(row['Drop Required from Delhi (Yes/No)']),
            };

            // 1. Attempt to find matching existing record by exact (but case-insensitive/trimmed) Name 
            const existingMatch = existingRecords.find(dbRec =>
                (dbRec.name || '').trim().toLowerCase() === excelName.toLowerCase()
            );

            if (existingMatch) {
                // Determine if we need to patch fields
                let needsPatch = false;
                const patchData = {};

                // Fields to potentially patch (we don't patch IDs, S.No, Name, or Live Location)
                const checkFields = [
                    'vertical', 'spoc', 'cluster', 'organisationName', 'designation',
                    'mobileNumber', 'gender', 'age', 'emailId', 'modeOfTravelToDelhi',
                    'arrivalFlightTrainNo', 'travelDateToDelhi', 'departureFrom', 'departureTime',
                    'arrivalDestination', 'arrivalTimeInDelhi', 'arrivalTerminal', 'accommodation',
                    'checkInDate', 'checkOutDate', 'pickupRequiredInDelhi', 'modeOfTravelFromDelhi',
                    'departureFlightTrainNo', 'departureDateFromDelhi', 'departureTimeFromDelhi',
                    'departureTerminal', 'dropRequiredFromDelhi'
                ];

                checkFields.forEach(field => {
                    const dbValue = existingMatch[field] || '';
                    const excelValue = targetData[field] || '';

                    // If database is empty/blank/dash, and excel actually has useful data, patch it!
                    if ((dbValue === '' || dbValue === '-' || dbValue === 'N/A') && excelValue !== '' && excelValue !== '-') {
                        patchData[field] = excelValue;
                        needsPatch = true;
                    }
                });

                if (needsPatch) {
                    updates.push({
                        ...existingMatch, // retain all their existing data safely
                        ...patchData      // strictly overwrite the blank fields we just found
                    });
                    updatedCount++;
                }

            } else {
                // 2. Completely new record
                inserts.push({
                    ...targetData,
                    id: `REC-EXTRA7-${timestamp}-${index + 1}`,
                    liveLocation: 'Not arrived' // Default state for new participants
                });
                insertedCount++;
            }
        });

        // Execute Patches (Updates in Supabase via UPSERT since we provide the ID)
        if (updates.length > 0) {
            console.log(`Executing ${updates.length} patches over existing records...`);
            const { error: updateErr } = await supabase.from('logistics').upsert(updates);
            if (updateErr) console.error("Update Error:", updateErr);
        }

        // Execute Strict Inserts
        if (inserts.length > 0) {
            console.log(`Executing ${inserts.length} fresh insertions for brand new participants...`);
            const { error: insertErr } = await supabase.from('logistics').insert(inserts);
            if (insertErr) console.error("Insert Error:", insertErr);
        }

        console.log(`Merge Complete!`);
        console.log(`-> New Participants Added: ${insertedCount}`);
        console.log(`-> Existing Participants Enriched/Patched: ${updatedCount}`);

    } catch (error) {
        console.error('Error merging extradatav7 data:', error);
    }
}

mergeExtraDataV7();

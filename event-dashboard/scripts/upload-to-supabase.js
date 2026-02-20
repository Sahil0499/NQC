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

async function uploadData() {
    try {
        const filePath = join(__dirname, '../public/data.xlsx');
        const fileBuffer = readFileSync(filePath);
        const wb = read(fileBuffer, { type: 'buffer' });

        const allRecords = [];
        const sheetTypeMapping = {
            'Flights': 'Flight',
            'Train': 'Train',
            'Bus': 'Bus',
            'Outstation Cab': 'Cab',
            'Own Cab': 'Self-drive',
            'Only Stay': 'Accommodation'
        };

        wb.SheetNames.forEach(sheetName => {
            const sheet = wb.Sheets[sheetName];
            const type = sheetTypeMapping[sheetName];
            if (!type) return;

            const jsonData = utils.sheet_to_json(sheet, { range: 1 });

            jsonData.forEach((row, index) => {
                let date = 'Date Not Specified';
                const rawDate = row['Travel Date'] || row['Date'] || row['Check-in Date'];

                if (typeof rawDate === 'number') {
                    const dateObj = new Date((rawDate - (25567 + 2)) * 86400 * 1000);
                    if (!isNaN(dateObj.getTime())) {
                        date = dateObj.toISOString().split('T')[0];
                    }
                } else if (typeof rawDate === 'string') {
                    const cleanDate = rawDate.trim();
                    const match = cleanDate.match(/^(\d{1,2})[\./-](\d{1,2})[\./-](\d{4})$/);
                    if (match) {
                        const [_, day, month, year] = match;
                        date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                    }
                }

                const verticalDraw = row['Sector'] || (row['Organisation Name'] ? 'Other' : 'Pharma');
                let normalizedVertical = 'Pharma';
                const sectorUpper = (verticalDraw || '').toString().toUpperCase();
                if (sectorUpper.includes('PHARMA')) normalizedVertical = 'Pharma';
                else if (sectorUpper.includes('FOOTWEAR')) normalizedVertical = 'Footwear';
                else if (sectorUpper.includes('TEXTILE')) normalizedVertical = 'Textile';
                else if (sectorUpper.includes('LEATHER')) normalizedVertical = 'Leather';

                const name = row['Name of Participant'] || `Participant ${index}`;

                let time = '';
                let place = '';
                let delhiTerminal = '';

                if (type === 'Flight') {
                    time = row['Arrival / Departure Time'] || '';
                    place = row['Place'] || '';
                    delhiTerminal = row['Delhi Terminal'] || '';
                } else if (type === 'Train' || type === 'Bus') {
                    time = row['Arrival Time'] || '';
                    place = row['Place'] || '';
                } else if (type === 'Cab') {
                    time = row['Pickup Time'] || '';
                    place = row['Pickup Location'] || row['Place'] || '';
                }

                let details = '';
                if (type === 'Flight' || type === 'Train') {
                    const number = row['Flight/Train No.'] || '';
                    details = `${number}`;
                } else if (type === 'Cab') {
                    details = 'Cab Request';
                } else if (type === 'Accommodation') {
                    details = 'Accommodation details';
                }

                allRecords.push({
                    id: `REC-${sheetName}-${index}`,
                    name,
                    vertical: normalizedVertical,
                    type,
                    date,
                    status: 'Confirmed',
                    details: details.trim() || type,
                    time,
                    place,
                    delhiTerminal,
                    liveLocation: 'Not arrived',
                    organisationName: row['Organisation Name'] || '',
                    designation: row['Designation'] || '',
                    mobileNumber: row['Mobile Number'] || row['Mobile'] || row['Contact Number'] || '',
                    gender: row['Gender'] || '',
                    age: row['Age'] || '',
                    emailId: row['Email ID'] || row['Email'] || ''
                });
            });
        });

        console.log(`Prepared ${allRecords.length} records. Uploading...`);

        // Chunk upload because Supabase max rows per insert is 1000 usually
        const chunkSize = 500;
        for (let i = 0; i < allRecords.length; i += chunkSize) {
            const chunk = allRecords.slice(i, i + chunkSize);
            const { error } = await supabase.from('logistics').upsert(chunk);
            if (error) {
                console.error("Error uploading chunk", i, error);
            } else {
                console.log(`Uploaded chunk ${i / chunkSize + 1} of ${Math.ceil(allRecords.length / chunkSize)}`);
            }
        }

        console.log('Upload complete');

    } catch (error) {
        console.error('Error loading Excel data:', error);
    }
}

uploadData();

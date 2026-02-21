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

async function uploadExtraData() {
    try {
        const filePath = join(__dirname, '../public/extradatav6.xlsx');
        const fileBuffer = readFileSync(filePath);
        const wb = read(fileBuffer, { type: 'buffer' });

        const allRecords = [];
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const jsonData = utils.sheet_to_json(sheet, { range: 0 });

        const timestamp = Date.now();

        jsonData.forEach((row, index) => {
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

            const rawSector = cleanString(row['Sector']);
            const parsedVertical = rawSector.toLowerCase().includes('pharma') ? 'Pharmaceuticals' : rawSector;

            allRecords.push({
                // Generates entirely unique IDs to prevent an upsert overwrite
                id: `REC-EXTRA-${timestamp}-${index + 1}`,
                sNo: cleanString(row['S. No.']),
                vertical: parsedVertical,
                spoc: cleanString(row['SPOC']),
                cluster: cleanString(row['Cluster']),
                organisationName: cleanString(row['Organisation Name']),
                name: cleanString(row['Name of Participant']),
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
                liveLocation: 'Not arrived'
            });
        });

        console.log(`Prepared ${allRecords.length} extra records from extradatav6.xlsx. Starting safe append...`);

        const chunkSize = 500;
        for (let i = 0; i < allRecords.length; i += chunkSize) {
            const chunk = allRecords.slice(i, i + chunkSize);
            const { error } = await supabase.from('logistics').insert(chunk); // Hard INSERT to prevent accidental updates
            if (error) {
                console.error("Error inserting chunk", i, error);
            } else {
                console.log(`Inserted chunk ${i / chunkSize + 1} of ${Math.ceil(allRecords.length / chunkSize)} safely without overwriting data.`);
            }
        }

        console.log('Extra data specific append complete! Safe to check dashboard.');

    } catch (error) {
        console.error('Error loading extra Excel data:', error);
    }
}

uploadExtraData();

import { read, utils } from 'xlsx';
import type { LogisticsRecord, Vertical, LogisticsType } from '../types';

export async function loadExcelData(): Promise<LogisticsRecord[]> {
    try {
        const response = await fetch('/data.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        const wb = read(arrayBuffer, { type: 'array' });

        const allRecords: LogisticsRecord[] = [];
        const sheetTypeMapping: Record<string, LogisticsType> = {
            'Flights': 'Flight',
            'Train': 'Train',
            'Bus': 'Bus',
            'Outstation Cab': 'Cab',
            'Own Cab': 'Self-drive',
            'Only Stay': 'Accommodation'
        };

        wb.SheetNames.forEach(sheetName => {
            const sheet = wb.Sheets[sheetName];
            // Skip if not in our mapping
            const type = sheetTypeMapping[sheetName];
            if (!type) return;

            const jsonData = utils.sheet_to_json<any>(sheet, { range: 1 }); // Header at index 1 (Row 2)

            jsonData.forEach((row, index) => {
                let date = 'Date Not Specified';

                // Try to find a date column
                const rawDate = row['Travel Date'] || row['Date'] || row['Check-in Date'];

                if (typeof rawDate === 'number') {
                    // Excel serial date (approximate)
                    const dateObj = new Date((rawDate - (25567 + 2)) * 86400 * 1000);
                    if (!isNaN(dateObj.getTime())) {
                        date = dateObj.toISOString().split('T')[0];
                    }
                } else if (typeof rawDate === 'string') {
                    // Handle DD.MM.YYYY or DD/MM/YYYY
                    const cleanDate = rawDate.trim();
                    // Regex for DD.MM.YYYY or DD/MM/YYYY
                    const match = cleanDate.match(/^(\d{1,2})[\./-](\d{1,2})[\./-](\d{4})$/);
                    if (match) {
                        const [_, day, month, year] = match;
                        date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                    }
                }

                const vertical = (row['Sector'] || (row['Organisation Name'] ? 'Other' : 'Pharma')) as Vertical;

                // Normalize Vertical
                let normalizedVertical: Vertical = 'Pharma';
                const sectorUpper = (vertical || '').toString().toUpperCase();
                if (sectorUpper.includes('PHARMA')) normalizedVertical = 'Pharma';
                else if (sectorUpper.includes('FOOTWEAR')) normalizedVertical = 'Footwear';
                else if (sectorUpper.includes('TEXTILE')) normalizedVertical = 'Textile';
                else if (sectorUpper.includes('LEATHER')) normalizedVertical = 'Leather';

                const name = row['Name of Participant'] || `Participant ${index}`;

                // Extended Details
                let time = '';
                let place = '';

                if (type === 'Flight') {
                    time = row['Arrival / Departure Time'] || '';
                    place = row['Place'] || '';
                } else if (type === 'Train' || type === 'Bus') {
                    time = row['Arrival Time'] || '';
                    place = row['Place'] || '';
                } else if (type === 'Cab') {
                    time = row['Pickup Time'] || '';
                    place = row['Pickup Location'] || row['Place'] || '';
                }

                // Details construction - Keep generic details for now, or update if needed
                let details = '';
                if (type === 'Flight' || type === 'Train') {
                    const number = row['Flight/Train No.'] || '';
                    details = `${number}`;
                } else if (type === 'Cab') {
                    // For cab, details is usually location, but if we have place column now, maybe details can be just "Cab" or Organization? 
                    // Let's keep existing logic but just simpler since we have specific columns
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
                    amount: 0,
                    time,
                    place
                });
            });
        });

        console.log(`Loaded ${allRecords.length} records from Excel`);
        return allRecords;

    } catch (error) {
        console.error('Error loading Excel data:', error);
        return [];
    }
}

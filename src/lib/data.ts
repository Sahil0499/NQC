import type { LogisticsRecord, Vertical, LogisticsType } from '../types';

const verticals: Vertical[] = ['Pharma', 'Footwear', 'Textile', 'Leather'];
const types: LogisticsType[] = ['Flight', 'Train', 'Bus', 'Cab', 'Self-drive', 'Accommodation'];
// Statuses generic array not needed, generating inline


const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

export const generateMockData = (count: number = 100): LogisticsRecord[] => {
    const data: LogisticsRecord[] = [];
    const today = new Date();

    for (let i = 0; i < count; i++) {
        const vertical = randomItem(verticals);
        const type = randomItem(types);
        const status = Math.random() > 0.1 ? 'Confirmed' : (Math.random() > 0.5 ? 'Pending' : 'Cancelled');

        // Random date within +/- 15 days
        const dateOffset = randomInt(-15, 15);
        const date = new Date(today);
        date.setDate(today.getDate() + dateOffset);

        // Generate details based on type
        let details = '';
        switch (type) {
            case 'Flight':
                details = `Flight ${['AA', 'BA', 'EK', 'AI'][randomInt(0, 3)]}${randomInt(100, 999)}`;
                break;
            case 'Accommodation':
                details = `${['Hilton', 'Marriott', 'Hyatt', 'Novotel'][randomInt(0, 3)]} Hotel`;
                break;
            case 'Cab':
                details = `${['Uber', 'Ola', 'Lyft'][randomInt(0, 2)]} ${['Sedan', 'SUV'][randomInt(0, 1)]}`;
                break;
            case 'Self-drive':
                details = `${['Hertz', 'Avis', 'Enterprise'][randomInt(0, 2)]} Rental`;
                break;
        }

        data.push({
            id: `LOG-${1000 + i}`,
            name: `Person ${i + 1}`,
            vertical,
            type,
            date: date.toISOString().split('T')[0],
            status,
            details,
            amount: randomInt(100, 2000),
        });
    }

    return data;
};

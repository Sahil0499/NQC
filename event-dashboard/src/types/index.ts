export type Vertical = 'Pharma' | 'Footwear' | 'Textile' | 'Leather';
export type LogisticsType = 'Flight' | 'Train' | 'Bus' | 'Cab' | 'Self-drive' | 'Accommodation';
export type Status = 'Confirmed' | 'Pending' | 'Cancelled';

export interface LogisticsRecord {
    id: string;
    name: string;
    vertical: Vertical;
    type: LogisticsType;
    date: string; // ISO 8601 YYYY-MM-DD
    status: Status;
    details: string; // Flight no, Hotel name, etc.
    amount?: number;
    time?: string;
    place?: string;
    delhiTerminal?: string;
}

export interface DashboardStats {
    totalCount: number;
    verticalCounts: Record<Vertical, number>;
    typeCounts: Record<LogisticsType, number>;
    recentActivity: LogisticsRecord[];
}

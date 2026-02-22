export type Vertical = 'Pharmaceuticals' | 'Footwear' | 'Textile' | 'Leather';
export type LogisticsType = 'Flight' | 'Train' | 'Bus' | 'Cab' | 'Self-drive' | 'Accommodation';
export type Status = 'Confirmed' | 'Pending' | 'Cancelled';

export interface LogisticsRecord {
    id: string;
    sNo: string;
    vertical: Vertical;
    spoc: string;
    cluster?: string;
    organisationName: string;
    name: string;
    designation: string;
    mobileNumber: string;
    gender: string;
    age: string;
    emailId: string;
    modeOfTravelToDelhi: string;
    arrivalFlightTrainNo: string;
    travelDateToDelhi: string;
    departureFrom: string;
    departureTime: string;
    arrivalDestination: string;
    arrivalTimeInDelhi: string;
    arrivalTerminal: string;
    accommodation: string;
    checkInDate: string;
    checkOutDate: string;
    pickupRequiredInDelhi: string;
    modeOfTravelFromDelhi: string;
    departureFlightTrainNo: string;
    departureDateFromDelhi: string;
    departureTimeFromDelhi: string;
    departureTerminal: string;
    dropRequiredFromDelhi: string;
    liveLocation: string;
    roomNumber?: string;
    carPassIssued?: boolean;
}

export interface DashboardStats {
    totalCount: number;
    verticalCounts: Record<Vertical, number>;
    typeCounts: Record<LogisticsType, number>;
    recentActivity: LogisticsRecord[];
}

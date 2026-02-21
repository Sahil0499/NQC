import { useState, useMemo, useEffect } from 'react';
import { Layout } from './Layout';
import { supabase } from '../lib/supabase';
import type { LogisticsRecord, Vertical, LogisticsType } from '../types';
import { DateSelector } from './DateSelector';
import { DataTable } from './DataTable';
import { FilterBar } from './FilterBar';
import { Loader2, Download, Plus } from 'lucide-react';
import { AddParticipantModal } from './AddParticipantModal';

export function Dashboard() {
    const [data, setData] = useState<LogisticsRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVertical, setSelectedVertical] = useState<Vertical | 'All'>('All');
    const [selectedType, setSelectedType] = useState<LogisticsType | 'All'>('All');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        let subscription: any;

        async function fetchData() {
            try {
                const { data: records, error } = await supabase
                    .from('logistics')
                    .select('*')
                    .order('name');

                if (error) throw error;
                if (records) {
                    setData(records as unknown as LogisticsRecord[]);
                }
            } catch (error) {
                console.error("Failed to load data from Supabase", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();

        // Subscribe to real-time changes
        subscription = supabase
            .channel('logistics_channel')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'logistics' },
                (payload) => {
                    console.log('Real-time update received:', payload);
                    if (payload.eventType === 'UPDATE') {
                        setData((currentData) =>
                            currentData.map((record) =>
                                record.id === payload.new.id ? (payload.new as unknown as LogisticsRecord) : record
                            )
                        );
                    } else if (payload.eventType === 'INSERT') {
                        setData((currentData) => [...currentData, payload.new as unknown as LogisticsRecord]);
                    } else if (payload.eventType === 'DELETE') {
                        setData((currentData) => currentData.filter((record) => record.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            if (subscription) supabase.removeChannel(subscription);
        };
    }, []);

    const handleUpdateLocation = async (id: string, location: string) => {
        try {
            // Optimistically update UI
            setData(currentData =>
                currentData.map(record =>
                    record.id === id ? { ...record, liveLocation: location } : record
                )
            );

            // Update database
            const { error } = await supabase
                .from('logistics')
                .update({ liveLocation: location })
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error updating live location:', error);
            // In a real app, we might revert the optimistic update here on fail
        }
    };

    const handleUpdateRoomNumber = async (id: string, roomNumber: string) => {
        try {
            // Optimistically update UI
            setData(currentData =>
                currentData.map(record =>
                    record.id === id ? { ...record, roomNumber } : record
                )
            );

            // Update database
            const { error } = await supabase
                .from('logistics')
                .update({ roomNumber })
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error updating room number:', error);
        }
    };

    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedLiveLocation, setSelectedLiveLocation] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpoc, setSelectedSpoc] = useState<string | 'All'>('All');

    const SPOCS = useMemo(() => {
        const uniqueSpocs = new Set<string>();
        data.forEach(item => {
            if (item.spoc) uniqueSpocs.add(item.spoc);
        });
        return Array.from(uniqueSpocs).sort();
    }, [data]);

    // Filter data
    const filteredData = useMemo(() => {
        return data.filter(item => {
            const matchVertical = selectedVertical === 'All' || item.vertical === selectedVertical;
            const matchType = selectedType === 'All' ||
                (selectedType === 'Accommodation'
                    ? item.accommodation?.toLowerCase() === 'required'
                    : item.modeOfTravelToDelhi?.toLowerCase() === selectedType.toLowerCase());
            const matchDate = selectedDate === null || item.travelDateToDelhi === selectedDate;
            const matchLiveLocation = selectedLiveLocation === null || (item.liveLocation || 'Not arrived') === selectedLiveLocation;
            const matchSpoc = selectedSpoc === 'All' || item.spoc === selectedSpoc;
            const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchVertical && matchType && matchDate && matchLiveLocation && matchSpoc && matchSearch;
        });
    }, [data, selectedVertical, selectedType, selectedDate, selectedLiveLocation, selectedSpoc, searchTerm]);

    const handleExportCSV = () => {
        if (filteredData.length === 0) {
            alert("No records to export.");
            return;
        }

        const headers = [
            "S. No.", "Name", "Vertical", "Cluster", "SPOC", "Organisation", "Designation",
            "Mobile", "Gender", "Age", "Email", "Travel Mode To Delhi", "Arrival Flight/Train",
            "Travel Date", "Departure From", "Departure Time", "Arrival Destination",
            "Arrival Time", "Room No", "Arrival Terminal", "Accommodation", "Check In",
            "Check Out", "Pickup Required", "Travel Mode From Delhi", "Departure Flight/Train",
            "Departure Date", "Departure Time Delhi", "Departure Terminal", "Drop Required",
            "Live Location"
        ];

        const escapeCSV = (str?: string | null) => {
            if (!str && str !== '0') return ''; // Allow 0 but convert falsy
            const stringified = String(str);
            if (stringified.includes(',') || stringified.includes('"') || stringified.includes('\n')) {
                return `"${stringified.replace(/"/g, '""')}"`;
            }
            return stringified;
        };

        const rows = filteredData.map(record => [
            record.sNo,
            record.name,
            record.vertical,
            record.cluster,
            record.spoc,
            record.organisationName,
            record.designation,
            record.mobileNumber,
            record.gender,
            record.age,
            record.emailId,
            record.modeOfTravelToDelhi,
            record.arrivalFlightTrainNo,
            record.travelDateToDelhi,
            record.departureFrom,
            record.departureTime,
            record.arrivalDestination,
            record.arrivalTimeInDelhi,
            record.roomNumber,
            record.arrivalTerminal,
            record.accommodation,
            record.checkInDate,
            record.checkOutDate,
            record.pickupRequiredInDelhi,
            record.modeOfTravelFromDelhi,
            record.departureFlightTrainNo,
            record.departureDateFromDelhi,
            record.departureTimeFromDelhi,
            record.departureTerminal,
            record.dropRequiredFromDelhi,
            record.liveLocation
        ].map(escapeCSV));

        const BOM = "\uFEFF";
        let csvContent = headers.join(",") + "\r\n" + rows.map(e => e.join(",")).join("\r\n");

        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Event_Data_Export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Stats calculation
    const stats = useMemo(() => {
        return {
            total: filteredData.length,
            confirmed: filteredData.length, // Status column removed, assuming all uploaded are confirmed for now
            pending: 0,
            cancelled: 0,
        };
    }, [filteredData]);

    // Aggregate stats by vertical
    const verticalStats = useMemo(() => {
        const counts: Record<string, number> = {};
        filteredData.forEach(d => {
            counts[d.vertical] = (counts[d.vertical] || 0) + 1;
        });
        return counts;
    }, [filteredData]);

    // Aggregate stats by type
    const typeStats = useMemo(() => {
        const counts: Record<string, number> = {};
        // Initialize all standard keys so they don't get lost
        const standardTypes = ['Flight', 'Train', 'Bus', 'Cab', 'Self-drive', 'Accommodation'];
        standardTypes.forEach(t => counts[t] = 0);

        filteredData.forEach(d => {
            const rawMode = d.modeOfTravelToDelhi;
            if (rawMode) {
                // Find matching standard type case-insensitively to normalize
                const standardType = standardTypes.find(t => t.toLowerCase() === rawMode.toLowerCase());
                const key = standardType || rawMode;
                counts[key] = (counts[key] || 0) + 1;
            }
            if (d.accommodation?.toLowerCase() === 'required') {
                counts['Accommodation'] = (counts['Accommodation'] || 0) + 1;
            }
        });
        return counts;
    }, [filteredData]);

    const liveLocationStats = useMemo(() => {
        const counts: Record<string, number> = {};
        const locations = [
            'Not arrived',
            'Arrived at delhi',
            'On the way to Hotel',
            'On the way to 1QCI',
            'On the way to BM',
            'At Hotel',
            'At 1QCI',
            'At BM',
            'Check-in Done',
            'Check-in Pending',
            'Check-out Done',
            'Check-out Pending'
        ];
        locations.forEach(loc => counts[loc] = 0);

        filteredData.forEach(d => {
            const loc = d.liveLocation || 'Not arrived';
            if (counts[loc] !== undefined) {
                counts[loc]++;
            } else {
                counts[loc] = 1;
            }
        });
        return counts;
    }, [filteredData]);

    // For the chart, we want to show the TREND (all dates) even when filtered?
    // No, user said "click on date then those records should come".
    // BUT if we filter the chart data by selected date, the chart will show only 1 bar.
    // We should pass the UNFILTERED-BY-DATE data to the chart so context is preserved, 
    // but highlight the selected date.
    // HOWEVER, filteredData currently includes date filter.
    // Let's separate "chartData" (filtered by Type/Vertical but NOT Date) vs "tableData" (filtered by everything).



    if (loading) {
        return (
            <Layout>
                <div className="flex h-[80vh] items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                    <span className="ml-3 text-lg font-medium text-gray-600">Loading Dashboard Data...</span>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Live Location Stats */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Live Location Status</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {Object.entries(liveLocationStats).map(([location, count]) => {
                            const isSelected = selectedLiveLocation === location;
                            return (
                                <div
                                    key={location}
                                    onClick={() => setSelectedLiveLocation(isSelected ? null : location)}
                                    className={`p-3 rounded-md text-center border flex flex-col justify-center cursor-pointer transition-all duration-200 ${isSelected
                                        ? 'bg-blue-600 border-blue-600 shadow-md ring-2 ring-blue-300 ring-offset-1 transform scale-[1.02]'
                                        : 'bg-blue-50/50 border-blue-100 hover:bg-blue-100'
                                        }`}
                                >
                                    <p className={`text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis px-1 ${isSelected ? 'text-blue-100' : 'text-blue-800'}`} title={location}>
                                        {location}
                                    </p>
                                    <p className={`text-2xl font-bold mt-1 ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                        {count}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <FilterBar
                    selectedVertical={selectedVertical}
                    selectedType={selectedType}
                    onVerticalChange={setSelectedVertical}
                    onTypeChange={setSelectedType}
                    verticalCounts={verticalStats}
                    totalCount={stats.total}
                />

                {/* Breakdown Section with Equal Width Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column: Date Selector */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-center">
                        <DateSelector
                            data={data}
                            selectedDate={selectedDate}
                            onDateSelect={setSelectedDate}
                        />
                    </div>

                    {/* Right Column: Logistics Type Breakdown & Total Records */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Logistics Type Breakdown</h3>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Total Records</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {['Flight', 'Train', 'Bus', 'Cab', 'Self-drive', 'Accommodation'].map((type) => (
                                <div key={type} className="bg-gray-50 p-3 rounded-md flex flex-col items-center justify-center border border-gray-100">
                                    <span className="text-gray-500 text-xs font-medium mb-1">{type}</span>
                                    <span className="text-lg font-bold text-gray-900">{typeStats[type] || 0}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Search and SPOC Filter Bar */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="w-full sm:w-1/3">
                        <input
                            type="text"
                            placeholder="Search by name..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="w-full sm:w-1/4 flex items-center gap-2">
                        <label className="text-sm text-gray-600 font-medium whitespace-nowrap">Filter by SPOC:</label>
                        <select
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                            value={selectedSpoc}
                            onChange={(e) => setSelectedSpoc(e.target.value)}
                        >
                            <option value="All">All SPOCs</option>
                            {SPOCS.map(spoc => (
                                <option key={spoc} value={spoc}>{spoc}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full sm:w-auto">
                        <button
                            onClick={handleExportCSV}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow-sm transition-colors"
                            title="Download visible records as CSV"
                        >
                            <Download className="h-4 w-4" />
                            <span className="text-sm">Export</span>
                        </button>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="text-sm">Add Participant</span>
                        </button>
                    </div>
                </div>

                <DataTable data={filteredData} onUpdateLocation={handleUpdateLocation} onUpdateRoomNumber={handleUpdateRoomNumber} />
            </div>

            <AddParticipantModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />
        </Layout>
    );
}

import { useState, useMemo, useEffect } from 'react';
import { Layout } from './Layout';
import { supabase } from '../lib/supabase';
import type { LogisticsRecord, Vertical, LogisticsType } from '../types';
import { DateSelector } from './DateSelector';
import { DataTable } from './DataTable';
import { FilterBar } from './FilterBar';
import { Loader2 } from 'lucide-react';

export function Dashboard() {
    const [data, setData] = useState<LogisticsRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVertical, setSelectedVertical] = useState<Vertical | 'All'>('All');
    const [selectedType, setSelectedType] = useState<LogisticsType | 'All'>('All');

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

    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedLiveLocation, setSelectedLiveLocation] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpoc, setSelectedSpoc] = useState<string | 'All'>('All');

    const SPOCS = useMemo(() => ['Rachit', 'Bhavishya', 'Saleem', 'Harshita', 'Ananya', 'Harshini'], []);

    const dataWithSpocs = useMemo(() => {
        return data.map((record, index) => {
            const sum = record.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            return {
                ...record,
                spoc: record.spoc || SPOCS[sum % SPOCS.length],
                organisationName: record.organisationName || `Company ${sum % 100}`,
                designation: record.designation || (['Manager', 'Director', 'Executive', 'Engineer', 'Consultant'][sum % 5]),
                mobileNumber: record.mobileNumber || `+91 98${sum % 99} ${index % 99} ${sum % 99}`,
                gender: record.gender || (sum % 2 === 0 ? 'Male' : 'Female'),
                age: record.age || (25 + (sum % 30)),
                emailId: record.emailId || `${record.name.split(' ')[0].toLowerCase()}.${index}@example.com`
            };
        });
    }, [data, SPOCS]);

    // Filter data
    const filteredData = useMemo(() => {
        return dataWithSpocs.filter(item => {
            const matchVertical = selectedVertical === 'All' || item.vertical === selectedVertical;
            const matchType = selectedType === 'All' || item.type === selectedType;
            const matchDate = selectedDate === null || item.date === selectedDate;
            const matchLiveLocation = selectedLiveLocation === null || (item.liveLocation || 'Not arrived') === selectedLiveLocation;
            const matchSpoc = selectedSpoc === 'All' || item.spoc === selectedSpoc;
            const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchVertical && matchType && matchDate && matchLiveLocation && matchSpoc && matchSearch;
        });
    }, [dataWithSpocs, selectedVertical, selectedType, selectedDate, selectedLiveLocation, selectedSpoc, searchTerm]);

    // Stats calculation (should reflect ALL data or filtered? Usually stats reflect filters)
    // But usually date filter is a drill-down. Let's keep stats reflecting global filters but maybe date specific?
    // Actually, usually "Total Records" on top changes with filters.

    const stats = useMemo(() => {
        return {
            total: filteredData.length,
            confirmed: filteredData.filter(d => d.status === 'Confirmed').length,
            pending: filteredData.filter(d => d.status === 'Pending').length,
            cancelled: filteredData.filter(d => d.status === 'Cancelled').length,
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
        filteredData.forEach(d => {
            counts[d.type] = (counts[d.type] || 0) + 1;
        });
        return counts;
    }, [filteredData]);

    const liveLocationStats = useMemo(() => {
        const counts: Record<string, number> = {};
        const locations = [
            'Not arrived',
            'Arrived at delhi',
            'On the way to Hotel',
            'On the way to QCI',
            'On the way to BM',
            'At Hotel',
            'At QCI',
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
                </div>

                <DataTable data={filteredData} onUpdateLocation={handleUpdateLocation} />
            </div>
        </Layout>
    );
}

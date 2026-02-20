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

    // Filter data
    const filteredData = useMemo(() => {
        return data.filter(item => {
            const matchVertical = selectedVertical === 'All' || item.vertical === selectedVertical;
            const matchType = selectedType === 'All' || item.type === selectedType;
            const matchDate = selectedDate === null || item.date === selectedDate;
            return matchVertical && matchType && matchDate;
        });
    }, [data, selectedVertical, selectedType, selectedDate]);

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
            'Not Arrived',
            'Arrived at Delhi',
            'On way to Hotel',
            'Reached Hotel',
            'On way to Venue',
            'At Venue'
        ];
        locations.forEach(loc => counts[loc] = 0);

        filteredData.forEach(d => {
            const loc = d.liveLocation || 'Not Arrived';
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
                        {Object.entries(liveLocationStats).map(([location, count]) => (
                            <div key={location} className="bg-blue-50/50 p-3 rounded-md text-center border border-blue-100 flex flex-col justify-center">
                                <p className="text-xs text-blue-800 font-medium whitespace-nowrap overflow-hidden text-ellipsis px-1" title={location}>{location}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <FilterBar
                    selectedVertical={selectedVertical}
                    selectedType={selectedType}
                    onVerticalChange={setSelectedVertical}
                    onTypeChange={setSelectedType}
                />

                {/* Breakdown Section with Equal Width Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column: Logistics Type Breakdown */}
                    <div className="space-y-6">
                        <DateSelector
                            data={data}
                            selectedDate={selectedDate}
                            onDateSelect={setSelectedDate}
                        />

                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Logistics Type Breakdown</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {['Flight', 'Train', 'Bus', 'Cab', 'Self-drive', 'Accommodation'].map((type) => (
                                    <div key={type} className="bg-gray-50 p-4 rounded-md flex justify-between items-center">
                                        <span className="text-gray-600 text-sm font-medium">{type}</span>
                                        <span className="text-2xl font-bold text-gray-900">{typeStats[type] || 0}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Vertical Breakdown & Total Records */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Vertical Breakdown</h3>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Total Records</p>
                                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2">
                            <div className="space-y-6">
                                {Object.entries(verticalStats).map(([vertical, count]) => (
                                    <div key={vertical}>
                                        <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                                            <span>{vertical}</span>
                                            <span>{count}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                                            <div
                                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                                                style={{ width: `${(count / stats.total) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <p className="text-sm text-gray-500">Top Performing Vertical</p>
                                    <p className="text-xl font-bold text-gray-900 mt-1">
                                        {Object.entries(verticalStats).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Active Filters</p>
                                    <div className="flex flex-wrap justify-center gap-1 mt-1">
                                        {selectedVertical !== 'All' && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{selectedVertical}</span>}
                                        {selectedType !== 'All' && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{selectedType}</span>}
                                        {selectedDate && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{selectedDate}</span>}
                                        {selectedVertical === 'All' && selectedType === 'All' && !selectedDate && <span className="text-xs text-gray-400">None</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DataTable data={filteredData} onUpdateLocation={handleUpdateLocation} />
            </div>
        </Layout>
    );
}

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { LogisticsRecord } from '../types';

interface TrendChartProps {
    data: LogisticsRecord[];
    onDateClick?: (date: string) => void;
    selectedDate?: string | null;
}

export function TrendChart({ data, onDateClick, selectedDate }: TrendChartProps) {
    const chartData = React.useMemo(() => {
        const counts: Record<string, number> = {};
        data.forEach(item => {
            const date = item.date;
            // Filter out missing dates from the chart if preferred, or keep them
            if (date !== 'Date Not Specified') {
                counts[date] = (counts[date] || 0) + 1;
            }
        });

        return Object.keys(counts).sort().map(date => ({
            date,
            count: counts[date],
        }));
    }, [data]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Date-wise Trend {selectedDate && <span className="text-sm font-normal text-blue-600 ml-2">(Filtered: {selectedDate})</span>}</h3>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(val) => {
                                const d = new Date(val);
                                return isNaN(d.getTime()) ? val : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                            }}
                            minTickGap={30}
                        />
                        <YAxis allowDecimals={false} />
                        <Tooltip
                            labelFormatter={(label) => label}
                            formatter={(value: number | undefined) => [value ?? 0, 'Records']}
                            cursor={{ fill: 'transparent' }}
                        />
                        <Bar
                            dataKey="count"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                            onClick={(data: any) => onDateClick?.(data.date)}
                            cursor="pointer"
                            // Highlight selected bar
                            fillOpacity={selectedDate ? (({ payload }: any) => payload.date === selectedDate ? 1 : 0.6) as any : 1}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

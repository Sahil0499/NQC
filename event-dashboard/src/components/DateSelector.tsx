import { useMemo } from 'react';
import type { LogisticsRecord } from '../types';

interface DateSelectorProps {
    data: LogisticsRecord[];
    selectedDate: string | null;
    onDateSelect: (date: string | null) => void;
}

export function DateSelector({ data, selectedDate, onDateSelect }: DateSelectorProps) {
    // Extract unique dates and sort them
    const dates = useMemo(() => {
        const uniqueDates = Array.from(new Set(data.map(d => d.date)))
            .filter(d => d !== 'Date Not Specified') // Optional: filter out unspecified if needed
            .sort();
        return uniqueDates;
    }, [data]);

    // Count records per date (optional, for badge or verifying info) -- maybe just show date
    // User asked for "date button to filter"

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Date</h3>
            <div className="flex flex-wrap gap-3">
                {dates.map((date) => {
                    const isSelected = selectedDate === date;
                    const dateObj = new Date(date);
                    const formattedDate = isNaN(dateObj.getTime())
                        ? date
                        : dateObj.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

                    return (
                        <button
                            key={date}
                            onClick={() => onDateSelect(isSelected ? null : date)} // Click to select/deselect (toggle)
                            onDoubleClick={() => onDateSelect(null)} // Double click to unselect (explicit)
                            className={`
                                relative px-4 py-2 rounded-lg text-sm font-medium transition-all
                                border shadow-sm
                                ${isSelected
                                    ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200'
                                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                }
                            `}
                            title="Click to select, Double-click to unselect"
                        >
                            {formattedDate}
                        </button>
                    );
                })}
            </div>
            {selectedDate && (
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={() => onDateSelect(null)}
                        className="text-sm text-gray-500 hover:text-red-500 underline decoration-dotted"
                    >
                        Clear Selection
                    </button>
                </div>
            )}
        </div>
    );
}

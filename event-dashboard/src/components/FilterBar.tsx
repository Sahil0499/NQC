import type { Vertical, LogisticsType } from '../types';

interface FilterBarProps {
    selectedVertical: Vertical | 'All';
    selectedType: LogisticsType | 'All';
    onVerticalChange: (value: Vertical | 'All') => void;
    onTypeChange: (value: LogisticsType | 'All') => void;
}

export function FilterBar({ selectedVertical, selectedType, onVerticalChange, onTypeChange }: FilterBarProps) {
    const verticals: (Vertical | 'All')[] = ['All', 'Pharma', 'Footwear', 'Textile', 'Leather'];

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-6 w-full">
            <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Vertical</label>
                <div className="flex flex-wrap gap-3">
                    {verticals.map((vertical) => (
                        <button
                            key={vertical}
                            onClick={() => onVerticalChange(vertical)}
                            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all border ${selectedVertical === vertical
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-white hover:border-gray-300'
                                }`}
                        >
                            {vertical === 'All' ? 'All Verticals' : vertical}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Logistics Type</label>
                <div className="flex flex-wrap gap-3">
                    {['All', 'Flight', 'Train', 'Bus', 'Cab', 'Self-drive', 'Accommodation'].map((type) => (
                        <button
                            key={type}
                            onClick={() => onTypeChange(type as LogisticsType | 'All')}
                            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all border ${selectedType === type
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-white hover:border-gray-300'
                                }`}
                        >
                            {type === 'All' ? 'All Types' : type}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

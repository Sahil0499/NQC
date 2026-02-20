import type { LogisticsRecord } from '../types';

interface DataTableProps {
    data: LogisticsRecord[];
    onUpdateLocation?: (id: string, location: string) => void;
}

export function DataTable({ data, onUpdateLocation }: DataTableProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Recent Records</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vertical</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SPOC</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Live Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Place</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delhi Terminal</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((record) => (
                            <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{record.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {record.vertical}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                    {record.spoc}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <select
                                        className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={record.liveLocation || 'Not arrived'}
                                        onChange={(e) => onUpdateLocation && onUpdateLocation(record.id, e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <option value="Not arrived">Not arrived</option>
                                        <option value="Arrived at delhi">Arrived at delhi</option>
                                        <option value="On the way to Hotel">On the way to Hotel</option>
                                        <option value="On the way to QCI">On the way to QCI</option>
                                        <option value="On the way to BM">On the way to BM</option>
                                        <option value="At Hotel">At Hotel</option>
                                        <option value="At QCI">At QCI</option>
                                        <option value="At BM">At BM</option>
                                        <option value="Check-in Done">Check-in Done</option>
                                        <option value="Check-in Pending">Check-in Pending</option>
                                        <option value="Check-out Done">Check-out Done</option>
                                        <option value="Check-out Pending">Check-out Pending</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {record.date}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {record.time || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {record.place || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {record.delhiTerminal || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {record.details}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 text-sm text-gray-500 text-center">
                Showing top 50 records
            </div>
        </div>
    );
}

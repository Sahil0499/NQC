import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Edit, Trash2 } from 'lucide-react';
import type { LogisticsRecord } from '../types';
import { formatDateDDMMYYYY } from '../lib/utils';
import { EditParticipantModal } from './EditParticipantModal';
import { DeleteParticipantModal } from './DeleteParticipantModal';

interface DataTableProps {
    data: LogisticsRecord[];
    onUpdateLocation?: (id: string, location: string) => void;
    onUpdateRoomNumber?: (id: string, roomNumber: string) => void;
}

export function DataTable({ data, onUpdateLocation, onUpdateRoomNumber }: DataTableProps) {
    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
    const [editingRecord, setEditingRecord] = useState<LogisticsRecord | null>(null);
    const [deletingRecord, setDeletingRecord] = useState<LogisticsRecord | null>(null);

    const toggleRow = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedRowId(expandedRowId === id ? null : id);
    };

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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Travel Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room No.</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((record) => (
                            <React.Fragment key={record.id}>
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap cursor-pointer hover:bg-gray-100" onClick={(e) => toggleRow(record.id, e)}>
                                        <div className="flex items-center">
                                            {expandedRowId === record.id ? (
                                                <ChevronDown className="h-4 w-4 text-gray-500 mr-2" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4 text-gray-500 mr-2" />
                                            )}
                                            <div className="text-sm font-medium text-blue-600 hover:text-blue-800">{record.name}</div>
                                        </div>
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
                                            <option value="On the way to 1QCI">On the way to 1QCI</option>
                                            <option value="On the way to BM">On the way to BM</option>
                                            <option value="At Hotel">At Hotel</option>
                                            <option value="At 1QCI">At 1QCI</option>
                                            <option value="At BM">At BM</option>
                                            <option value="Check-in Done">Check-in Done</option>
                                            <option value="Check-in Pending">Check-in Pending</option>
                                            <option value="Check-out Done">Check-out Done</option>
                                            <option value="Check-out Pending">Check-out Pending</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDateDDMMYYYY(record.travelDateToDelhi)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {record.modeOfTravelToDelhi || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {record.accommodation?.toLowerCase() === 'required' ? (
                                            <input
                                                type="text"
                                                placeholder="Enter Room"
                                                className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                value={record.roomNumber || ''}
                                                onChange={(e) => onUpdateRoomNumber && onUpdateRoomNumber(record.id, e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        ) : (
                                            <span className="text-gray-400 italic">N/A</span>
                                        )}
                                    </td>
                                </tr>
                                {expandedRowId === record.id && (
                                    <tr className="bg-blue-50/50">
                                        <td colSpan={7} className="px-6 py-6 border-b border-gray-200">
                                            <div className="flex justify-between items-start mb-6">
                                                <h4 className="font-semibold text-gray-900 text-lg">Detailed Participant View</h4>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => setEditingRecord(record)}
                                                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                                                    >
                                                        <Edit className="w-4 h-4 mr-1.5" />
                                                        Edit Info
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingRecord(record)}
                                                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-1.5" />
                                                        Delete Record
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                {/* Column 1: Demographics */}
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4">Participant Details</h4>
                                                    <div className="space-y-3">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Organisation</p>
                                                                <p className="text-sm text-gray-900">{record.organisationName || '-'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cluster</p>
                                                                <p className="text-sm text-gray-900">{record.cluster || '-'}</p>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Designation</p>
                                                            <p className="text-sm text-gray-900">{record.designation || '-'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mobile Number</p>
                                                            <p className="text-sm text-gray-900">{record.mobileNumber || '-'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email ID</p>
                                                            <p className="text-sm text-gray-900">{record.emailId || '-'}</p>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Gender</p>
                                                                <p className="text-sm text-gray-900">{record.gender || '-'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Age</p>
                                                                <p className="text-sm text-gray-900">{record.age || '-'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Column 2: Arrival Details */}
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4">Arrival & Stay in Delhi</h4>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Flight/Train No. (Arrival)</p>
                                                            <p className="text-sm text-gray-900">{record.arrivalFlightTrainNo || '-'}</p>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Departure From</p>
                                                                <p className="text-sm text-gray-900">{record.departureFrom || '-'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Arrival Time</p>
                                                                <p className="text-sm text-gray-900">{record.arrivalTimeInDelhi || '-'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Arrival Dest.</p>
                                                                <p className="text-sm text-gray-900">{record.arrivalDestination || '-'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Terminal</p>
                                                                <p className="text-sm text-gray-900">{record.arrivalTerminal || '-'}</p>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pickup Required in Delhi</p>
                                                            <p className="text-sm font-medium text-blue-700">{record.pickupRequiredInDelhi || '-'}</p>
                                                        </div>
                                                        <div className="pt-2">
                                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Accommodation</p>
                                                            <p className="text-sm text-gray-900">{record.accommodation || '-'}</p>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Check In</p>
                                                                <p className="text-sm text-gray-900">{formatDateDDMMYYYY(record.checkInDate)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Check Out</p>
                                                                <p className="text-sm text-gray-900">{formatDateDDMMYYYY(record.checkOutDate)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Column 3: Departure Details */}
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4">Departure From Delhi</h4>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mode of Travel</p>
                                                            <p className="text-sm text-gray-900">{record.modeOfTravelFromDelhi || '-'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Flight/Train No. (Departure)</p>
                                                            <p className="text-sm text-gray-900">{record.departureFlightTrainNo || '-'}</p>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Departure Date</p>
                                                                <p className="text-sm text-gray-900">{formatDateDDMMYYYY(record.departureDateFromDelhi)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dep. Time</p>
                                                                <p className="text-sm text-gray-900">{record.departureTimeFromDelhi || '-'}</p>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Departure Terminal</p>
                                                            <p className="text-sm text-gray-900">{record.departureTerminal || '-'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Drop Required from Delhi</p>
                                                            <p className="text-sm font-medium text-blue-700">{record.dropRequiredFromDelhi || '-'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 text-sm text-gray-500 text-center">
                Showing top 50 records
            </div>

            {/* Edit Modal */}
            <EditParticipantModal
                isOpen={!!editingRecord}
                onClose={() => setEditingRecord(null)}
                initialData={editingRecord}
            />

            {/* Delete Modal */}
            <DeleteParticipantModal
                isOpen={!!deletingRecord}
                onClose={() => setDeletingRecord(null)}
                record={deletingRecord}
            />
        </div>
    );
}

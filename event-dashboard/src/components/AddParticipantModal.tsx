import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Loader2, Save } from 'lucide-react';

interface AddParticipantModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const INITIAL_FORM_STATE = {
    name: '',
    vertical: 'Pharmaceuticals',
    spoc: '',
    cluster: '',
    organisationName: '',
    designation: '',
    mobileNumber: '',
    gender: 'Male',
    age: '',
    emailId: '',
    modeOfTravelToDelhi: '',
    arrivalFlightTrainNo: '',
    travelDateToDelhi: '',
    departureFrom: '',
    departureTime: '',
    arrivalDestination: '',
    arrivalTimeInDelhi: '',
    arrivalTerminal: '',
    accommodation: 'No',
    roomNumber: '',
    checkInDate: '',
    checkOutDate: '',
    pickupRequiredInDelhi: 'No',
    modeOfTravelFromDelhi: '',
    departureFlightTrainNo: '',
    departureDateFromDelhi: '',
    departureTimeFromDelhi: '',
    departureTerminal: '',
    dropRequiredFromDelhi: 'No',
    liveLocation: 'Not arrived',
};

export function AddParticipantModal({ isOpen, onClose }: AddParticipantModalProps) {
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // Generate a unique ID
            const id = `REC-MANUAL-${Date.now()}`;
            // Find max S.No (Optional, but we can just use a timestamp based SNo for manual entry)
            const sNo = `M-${Math.floor(Date.now() / 1000)}`;

            const newRecord = {
                id,
                sNo,
                ...formData
            };

            const { error: supabaseError } = await supabase
                .from('logistics')
                .insert([newRecord]);

            if (supabaseError) throw supabaseError;

            // Optional: reset form after success
            setFormData(INITIAL_FORM_STATE);
            onClose();
        } catch (err: any) {
            console.error('Error adding participant:', err);
            setError(err.message || 'Failed to add participant');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm sm:p-6 text-left">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-900">Add New Participant</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body - Scrollable Form */}
                <div className="p-6 overflow-y-auto flex-1">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    <form id="add-participant-form" onSubmit={handleSubmit} className="space-y-8">

                        {/* Section 1: Personal Details */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Personal Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                                    <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="John Doe" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Vertical *</label>
                                    <select required name="vertical" value={formData.vertical} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm">
                                        <option value="Pharmaceuticals">Pharmaceuticals</option>
                                        <option value="Textile">Textile</option>
                                        <option value="Footwear">Footwear</option>
                                        <option value="Leather">Leather</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">SPOC</label>
                                    <input type="text" name="spoc" value={formData.spoc} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="Contact Person" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Cluster</label>
                                    <input type="text" name="cluster" value={formData.cluster} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="e.g. North" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Organisation</label>
                                    <input type="text" name="organisationName" value={formData.organisationName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="Company Name" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Designation</label>
                                    <input type="text" name="designation" value={formData.designation} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="Job Title" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Mobile Number</label>
                                    <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="+91 XXXXX XXXXX" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Email ID</label>
                                    <input type="email" name="emailId" value={formData.emailId} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="email@example.com" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm">
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Age</label>
                                    <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="e.g. 35" />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Arrival Details */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Arrival to Delhi</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Travel Mode</label>
                                    <select name="modeOfTravelToDelhi" value={formData.modeOfTravelToDelhi} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm">
                                        <option value="">Select Mode</option>
                                        <option value="Flight">Flight</option>
                                        <option value="Train">Train</option>
                                        <option value="Bus">Bus</option>
                                        <option value="Cab">Cab</option>
                                        <option value="Self-drive">Self-drive</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Travel Date (YYYY-MM-DD)</label>
                                    <input type="date" name="travelDateToDelhi" value={formData.travelDateToDelhi} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Flight/Train No.</label>
                                    <input type="text" name="arrivalFlightTrainNo" value={formData.arrivalFlightTrainNo} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="e.g. AI-101" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Departure From</label>
                                    <input type="text" name="departureFrom" value={formData.departureFrom} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="Origin City" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Departure Time</label>
                                    <input type="time" name="departureTime" value={formData.departureTime} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Arrival Destination</label>
                                    <input type="text" name="arrivalDestination" value={formData.arrivalDestination} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="e.g. New Delhi" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Arrival Time</label>
                                    <input type="time" name="arrivalTimeInDelhi" value={formData.arrivalTimeInDelhi} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Arrival Terminal</label>
                                    <input type="text" name="arrivalTerminal" value={formData.arrivalTerminal} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="e.g. T3" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Pickup Required?</label>
                                    <select name="pickupRequiredInDelhi" value={formData.pickupRequiredInDelhi} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm">
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Accommodation */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Accommodation</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Required?</label>
                                    <select name="accommodation" value={formData.accommodation} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm">
                                        <option value="No">No</option>
                                        <option value="Required">Required</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Room Number</label>
                                    <input type="text" name="roomNumber" value={formData.roomNumber} onChange={handleChange} disabled={formData.accommodation !== 'Required'} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100 disabled:text-gray-400" placeholder="e.g. 101" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Check-In Date</label>
                                    <input type="date" name="checkInDate" value={formData.checkInDate} onChange={handleChange} disabled={formData.accommodation !== 'Required'} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100 disabled:text-gray-400" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Check-Out Date</label>
                                    <input type="date" name="checkOutDate" value={formData.checkOutDate} onChange={handleChange} disabled={formData.accommodation !== 'Required'} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100 disabled:text-gray-400" />
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Departure Details */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Departure From Delhi</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Travel Mode</label>
                                    <select name="modeOfTravelFromDelhi" value={formData.modeOfTravelFromDelhi} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm">
                                        <option value="">Select Mode</option>
                                        <option value="Flight">Flight</option>
                                        <option value="Train">Train</option>
                                        <option value="Bus">Bus</option>
                                        <option value="Cab">Cab</option>
                                        <option value="Self-drive">Self-drive</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Travel Date (YYYY-MM-DD)</label>
                                    <input type="date" name="departureDateFromDelhi" value={formData.departureDateFromDelhi} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Flight/Train No.</label>
                                    <input type="text" name="departureFlightTrainNo" value={formData.departureFlightTrainNo} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="e.g. AI-202" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Departure Time</label>
                                    <input type="time" name="departureTimeFromDelhi" value={formData.departureTimeFromDelhi} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Departure Terminal</label>
                                    <input type="text" name="departureTerminal" value={formData.departureTerminal} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="e.g. T3" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Drop Required?</label>
                                    <select name="dropRequiredFromDelhi" value={formData.dropRequiredFromDelhi} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm">
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="add-participant-form"
                        disabled={isSubmitting}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Participant
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

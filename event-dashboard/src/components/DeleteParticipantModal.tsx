import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import type { LogisticsRecord } from '../types';

interface DeleteParticipantModalProps {
    isOpen: boolean;
    onClose: () => void;
    record: LogisticsRecord | null;
}

export function DeleteParticipantModal({ isOpen, onClose, record }: DeleteParticipantModalProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen || !record) return null;

    const handleDelete = async () => {
        setIsDeleting(true);
        setError(null);

        try {
            const { error: deleteError } = await supabase
                .from('logistics')
                .delete()
                .eq('id', record.id);

            if (deleteError) throw deleteError;

            // Supabase real-time subscription in Dashboard will handle removing it from the UI list
            onClose();
        } catch (err: any) {
            console.error('Error deleting record:', err);
            setError(err.message || 'Failed to delete record. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={!isDeleting ? onClose : undefined} />

            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-red-50/50">
                    <div className="flex items-center text-red-600">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        <h2 className="text-lg font-semibold">Delete Record</h2>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-gray-700 mb-2">
                        Are you sure you want to permanently delete the participant record for:
                    </p>
                    <p className="text-lg font-semibold text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4 text-center">
                        {record.name}
                    </p>
                    <p className="text-sm text-red-600">
                        This action cannot be undone. All data associated with this participant will be permanently removed from the database.
                    </p>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end px-6 py-4 bg-gray-50 border-t border-gray-100 gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Yes, Delete
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

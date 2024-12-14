import React, { useState, useEffect, useCallback } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../utils/firebaseConfig';
import { useAuth } from '../../context/AuthContext';

function ParticipantSchedule({ event, schedule, onClose }) {
    const { user } = useAuth();
    const [arrival, setArrival] = useState(schedule?.arrival || '');
    const [departure, setDeparture] = useState(schedule?.departure || '');
    const [arrivalTransport, setArrivalTransport] = useState(schedule?.arrivalTransport || 'car');
    const [departureTransport, setDepartureTransport] = useState(schedule?.departureTransport || 'car');
    const [saving, setSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // Track if form has been modified
    useEffect(() => {
        const isModified = 
            arrival !== (schedule?.arrival || '') ||
            departure !== (schedule?.departure || '') ||
            arrivalTransport !== (schedule?.arrivalTransport || 'car') ||
            departureTransport !== (schedule?.departureTransport || 'car');
        
        setIsDirty(isModified);
    }, [arrival, departure, arrivalTransport, departureTransport, schedule]);

    // Handle click outside modal
    const handleClickOutside = useCallback((e) => {
        if (e.target.classList.contains('modal-overlay')) {
            if (isDirty) {
                if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
                    onClose();
                }
            } else {
                onClose();
            }
        }
    }, [isDirty, onClose]);

    const handleClose = () => {
        if (isDirty) {
            if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
                onClose();
            }
        } else {
            onClose();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const participantId = `${event.id}_${user.uid}`;
            await setDoc(doc(db, 'eventParticipants', participantId), {
                eventId: event.id,
                userId: user.uid,
                arrival,
                departure,
                arrivalTransport,
                departureTransport,
                updatedAt: new Date()
            });

            onClose();
        } catch (error) {
            console.error('Error saving schedule:', error);
            alert('Failed to save schedule. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const transportOptions = [
        { value: 'car', label: 'Car' },
        { value: 'plane', label: 'Plane' },
        { value: 'train', label: 'Train' },
        { value: 'bus', label: 'Bus' },
        { value: 'other', label: 'Other' }
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 modal-overlay"
             onClick={handleClickOutside}>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-md mx-auto"
                 onClick={e => e.stopPropagation()}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                        {schedule ? 'Edit My Schedule' : 'Add My Schedule'}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="button button-secondary dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white 
                                 flex items-center justify-center gap-2"
                    >
                        <span className="sr-only">Close</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Arrival Time
                            </label>
                            <input
                                type="datetime-local"
                                value={arrival}
                                onChange={(e) => setArrival(e.target.value)}
                                className="form-input w-full rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                                min={event.startDate}
                                max={event.endDate}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Arrival Transportation
                            </label>
                            <select
                                value={arrivalTransport}
                                onChange={(e) => setArrivalTransport(e.target.value)}
                                className="form-select w-full rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                                required
                            >
                                {transportOptions.map(option => (
                                    <option key={`arrival-${option.value}`} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Departure Time
                            </label>
                            <input
                                type="datetime-local"
                                value={departure}
                                onChange={(e) => setDeparture(e.target.value)}
                                className="form-input w-full rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                                min={event.startDate}
                                max={event.endDate}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Departure Transportation
                            </label>
                            <select
                                value={departureTransport}
                                onChange={(e) => setDepartureTransport(e.target.value)}
                                className="form-select w-full rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                                required
                            >
                                {transportOptions.map(option => (
                                    <option key={`departure-${option.value}`} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="button button-secondary dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white 
                                     flex items-center justify-center gap-2 w-full sm:w-auto"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="button button-primary dark:bg-blue-600 dark:hover:bg-blue-700 
                                     flex items-center justify-center gap-2 w-full sm:w-auto"
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Schedule'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ParticipantSchedule; 
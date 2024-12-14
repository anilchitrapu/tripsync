import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../utils/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import UnauthorizedEventView from '../components/event/UnauthorizedEventView';
import EventHeader from '../components/event/EventHeader';
import EventCalendar from '../components/event/EventCalendar';
import ParticipantSchedule from '../components/event/ParticipantSchedule';
import { useEventAttendance } from '../hooks/useEventAttendance';
import ErrorBoundary from '../components/common/ErrorBoundary';

function EventDetails() {
    const { eventId } = useParams();
    const { user, loading: authLoading } = useAuth();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [publicEventData, setPublicEventData] = useState(null);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    
    const { attendees } = useEventAttendance(event?.id);
    const currentUserSchedule = useMemo(() => {
        return attendees?.find(a => a.userId === user?.uid);
    }, [attendees, user?.uid]);

    const isOwner = useMemo(() => {
        return event?.userId === user?.uid;
    }, [event?.userId, user?.uid]);

    // Fetch basic event details (public data)
    useEffect(() => {
        const fetchPublicEventDetails = async () => {
            try {
                const eventRef = doc(db, 'events', eventId);
                const eventDoc = await getDoc(eventRef);
                
                if (eventDoc.exists()) {
                    // Only store minimal public data
                    const data = eventDoc.data();
                    setPublicEventData({
                        id: eventDoc.id,
                        startDate: data.startDate,
                        endDate: data.endDate,
                        location: data.location
                    });
                } else {
                    setError('Event not found');
                }
            } catch (err) {
                console.error('Error fetching public event data:', err);
                setError('Error loading event details');
            } finally {
                setLoading(false);
            }
        };

        fetchPublicEventDetails();
    }, [eventId]);

    // Fetch full event details only if user is authenticated
    useEffect(() => {
        const fetchFullEventDetails = async () => {
            if (!user) return;
            
            try {
                const eventRef = doc(db, 'events', eventId);
                const eventDoc = await getDoc(eventRef);
                
                if (eventDoc.exists()) {
                    setEvent({ id: eventDoc.id, ...eventDoc.data() });
                }
            } catch (err) {
                console.error('Error fetching full event details:', err);
            }
        };

        if (user) {
            fetchFullEventDetails();
        }
    }, [eventId, user]);

    const handleSaveEvent = async (updatedEvent) => {
        try {
            const eventRef = doc(db, 'events', eventId);
            
            const eventUpdate = {
                eventName: updatedEvent.eventName,
                startDate: updatedEvent.startDate,
                endDate: updatedEvent.endDate,
                location: updatedEvent.location || '',
                description: updatedEvent.description || '',
                acceptingSubmissions: updatedEvent.acceptingSubmissions,
                updatedAt: serverTimestamp()
            };

            await updateDoc(eventRef, eventUpdate);
            
            setEvent(prev => ({
                ...prev,
                ...eventUpdate
            }));

        } catch (err) {
            console.error('Error updating event:', err);
            throw new Error('Failed to update event. Please try again.');
        }
    };

    if (loading || authLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-red-600 mb-2">
                        {error}
                    </h2>
                    <p className="text-gray-600">
                        The event you're looking for might have been deleted or doesn't exist.
                    </p>
                </div>
            </div>
        );
    }

    // Show unauthorized view with public data if user is not logged in
    if (!user && publicEventData) {
        return <UnauthorizedEventView event={publicEventData} />;
    }

    if (!event) {
        return <div className="min-h-screen flex items-center justify-center">Event not found</div>;
    }

    if (!user) {
        return <UnauthorizedEventView event={event} />;
    }

    return (
        <div className="min-h-screen p-4 sm:py-8 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
                <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <EventHeader 
                        event={event}
                        isOwner={isOwner}
                        onSave={handleSaveEvent}
                    />
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                            Schedule
                        </h2>
                        <button
                            onClick={() => setIsScheduleModalOpen(true)}
                            className="button button-secondary dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white 
                                     flex items-center justify-center gap-2 w-full sm:w-auto"
                        >
                            <span className="whitespace-nowrap">
                                {currentUserSchedule ? 'Edit My Schedule' : 'Add My Schedule'}
                            </span>
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </button>
                    </div>

                    <ErrorBoundary>
                        <div className="mt-4 sm:mt-6 overflow-x-auto">
                            <EventCalendar 
                                event={event}
                                className="min-w-full"
                            />
                        </div>
                    </ErrorBoundary>
                </div>
            </div>

            {(loading || authLoading) && (
                <div className="fixed inset-0 bg-gray-900/50 dark:bg-gray-900/80 flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                        <div className="text-gray-900 dark:text-white">Loading...</div>
                    </div>
                </div>
            )}

            {error && (
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="text-center max-w-md">
                        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                            {error}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            The event you're looking for might have been deleted or doesn't exist.
                        </p>
                    </div>
                </div>
            )}

            {isScheduleModalOpen && (
                <ParticipantSchedule
                    event={event}
                    schedule={currentUserSchedule}
                    onClose={() => setIsScheduleModalOpen(false)}
                />
            )}
        </div>
    );
}

export default EventDetails;
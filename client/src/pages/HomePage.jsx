import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebaseConfig';
import { useState, useEffect } from 'react';

function HomePage() {
    const { user, loading } = useAuth();
    const [events, setEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(true);

    console.log('HomePage - Auth State:', { user, loading });
    console.log('HomePage - Events State:', { events, eventsLoading });

    useEffect(() => {
        console.log('HomePage - Component mounted');
        console.log('Current auth state:', {
            user: user ? {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName
            } : null,
            loading,
            eventsLoading
        });
    }, [user, loading, eventsLoading]);

    useEffect(() => {
        const fetchEvents = async () => {
            if (!user) {
                console.log('No user found, skipping fetch');
                return;
            }
            
            console.log('Fetching events for user:', user.uid);
            try {
                // First try with createdBy
                const q1 = query(
                    collection(db, 'events'), 
                    where('createdBy', '==', user.uid)
                );
                const snapshot1 = await getDocs(q1);
                let allEvents = snapshot1.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Then try with userId if no results
                if (allEvents.length === 0) {
                    const q2 = query(
                        collection(db, 'events'), 
                        where('userId', '==', user.uid)
                    );
                    const snapshot2 = await getDocs(q2);
                    allEvents = snapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                }

                console.log('Found events:', allEvents);
                
                const sortedEvents = allEvents.sort((a, b) => 
                    new Date(a.startDate) - new Date(b.startDate)
                );
                
                setEvents(sortedEvents);
                setEventsLoading(false);
            } catch (error) {
                console.error('Error fetching user events:', error);
                setEventsLoading(false);
            }
        };

        if (user) {
            fetchEvents();
        }
    }, [user]);

    if (loading) {
        console.log('HomePage - Still loading auth state');
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    console.log('HomePage - Auth check result:', !!user);

    if (!user) {
        console.log('HomePage - Redirecting to auth because no user found');
        return <Navigate to="/auth" replace />;
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getDaysAway = (startDate) => {
        const today = new Date();
        const eventDate = new Date(startDate);
        const diffTime = eventDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'Past event';
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        return `${diffDays} days away`;
    };

    const getFirstName = () => {
        if (!user || !user.email) return '';
        // If we have a display name, use that
        if (user.displayName) {
            return user.displayName.split(' ')[0];
        }
        // Otherwise, use the part before @ in email
        return user.email.split('@')[0];
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 py-6 sm:py-8">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header Card */}
                <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                            Welcome back,<br />
                            {getFirstName()}!
                        </h1>
                        
                        {events.length > 0 && (
                            <Link
                                to="/create-event"
                                className="button button-secondary dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white 
                                         flex items-center justify-center gap-2 w-full sm:w-auto"
                            >
                                <span className="whitespace-nowrap">Create New Event</span>
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Events List Card */}
                <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm">
                    {eventsLoading ? (
                        <div className="text-center py-6 text-gray-600 dark:text-gray-300">Loading your events...</div>
                    ) : events.length === 0 ? (
                        <div className="text-center py-6 px-4">
                            <p className="text-gray-600 dark:text-gray-300 mb-4">You haven't created any events yet.</p>
                            <Link
                                to="/create-event"
                                className="button button-secondary dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white 
                                         flex items-center justify-center gap-2 mx-auto w-full sm:w-auto"
                            >
                                <span>Create Your First Event</span>
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {events.map((event) => (
                                <div 
                                    key={event.id}
                                    className="p-4 sm:p-6 border dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow 
                                             bg-white dark:bg-gray-800"
                                >
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                        <div className="space-y-2">
                                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                                                {event.eventName}
                                            </h3>
                                            <div className="text-sm text-primary-color dark:text-blue-400 font-medium">
                                                {getDaysAway(event.startDate)}
                                            </div>
                                            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                                                <div>Start: {formatDate(event.startDate)}</div>
                                                <div>End: {formatDate(event.endDate)}</div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col items-start sm:items-end gap-2">
                                            <span className={`px-3 py-1 rounded-full text-sm ${
                                                event.acceptingSubmissions 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            }`}>
                                                {event.acceptingSubmissions ? 'Accepting Submissions' : 'Submissions Closed'}
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                Created {new Date(event.createdAt?.toDate()).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 pt-4 border-t dark:border-gray-700 flex flex-col sm:flex-row 
                                                  justify-between items-start sm:items-center gap-4">
                                        {event.location && (
                                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                                <span className="flex items-center">
                                                    <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span className="break-words">{event.location}</span>
                                                </span>
                                            </div>
                                        )}
                                        <Link
                                            to={`/event/${event.id}`}
                                            className="button button-secondary dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white 
                                                     flex items-center justify-center gap-2 w-full sm:w-auto"
                                        >
                                            View Details
                                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default HomePage;
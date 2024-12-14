import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../../utils/firebaseConfig';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

function ParticipantScheduleList({ eventId, date, onEditSchedule }) {
    const { currentUser } = useAuth();
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSchedules = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }

            try {
                const q = query(
                    collection(db, 'eventParticipants'),
                    where('eventId', '==', eventId)
                );
                const querySnapshot = await getDocs(q);
                
                const schedulesPromises = querySnapshot.docs.map(async (docSnapshot) => {
                    const data = docSnapshot.data();
                    const userDocRef = doc(db, 'users', data.userId);
                    const userDocSnapshot = await getDoc(userDocRef);
                    const userData = userDocSnapshot.data() || {};
                    
                    return {
                        id: docSnapshot.id,
                        ...data,
                        userName: userData.displayName || 'Anonymous',
                        userPhotoURL: userData.photoURL
                    };
                });

                const schedulesData = await Promise.all(schedulesPromises);
                schedulesData.sort((a, b) => 
                    new Date(a.arrivalDate) - new Date(b.arrivalDate)
                );
                
                setSchedules(schedulesData);
            } catch (err) {
                console.error('Error fetching schedules:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser && eventId) {
            fetchSchedules();
        }
    }, [eventId, currentUser]);

    const getTransportIcon = (mode) => {
        switch (mode) {
            case 'car': return '🚗';
            case 'plane': return '✈️';
            case 'train': return '🚂';
            default: return '🚶';
        }
    };

    const getSchedulesForDate = (schedules, date) => {
        const dayStart = startOfDay(parseISO(date));
        const dayEnd = endOfDay(parseISO(date));
        
        return schedules.filter(schedule => {
            const arrival = parseISO(schedule.arrivalDate);
            const departure = parseISO(schedule.departureDate);
            return (
                (arrival >= dayStart && arrival <= dayEnd) ||
                (departure >= dayStart && departure <= dayEnd) ||
                (arrival <= dayStart && departure >= dayEnd)
            );
        });
    };

    const dateSchedules = getSchedulesForDate(schedules, date);

    if (loading) return <div>Loading schedules...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!currentUser) return <div>Please sign in to view schedules</div>;

    return (
        <div className="space-y-2">
            {dateSchedules.length === 0 ? (
                <p className="text-gray-500 text-sm">No scheduled arrivals or departures</p>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {dateSchedules.map(schedule => (
                        <div 
                            key={schedule.id}
                            className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1"
                        >
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                                {schedule.userName[0]}
                            </div>
                            <span className="text-sm">
                                {format(parseISO(schedule.arrivalDate), 'h:mm a')}
                                {getTransportIcon(schedule.transportMode)}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ParticipantScheduleList; 
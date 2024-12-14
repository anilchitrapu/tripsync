import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../utils/firebaseConfig';

export function useEventAttendance(eventId) {
    const [attendees, setAttendees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!eventId) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'eventParticipants'),
            where('eventId', '==', eventId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const attendeesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAttendees(attendeesData);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching attendees:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [eventId]);

    return { attendees, loading };
} 
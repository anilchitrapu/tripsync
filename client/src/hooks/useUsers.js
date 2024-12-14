import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebaseConfig';

export function useUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersRef = collection(db, 'users');
                const snapshot = await getDocs(usersRef);
                const usersData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setUsers(usersData);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching users:', err);
                setError(err);
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    return { users, loading, error };
} 
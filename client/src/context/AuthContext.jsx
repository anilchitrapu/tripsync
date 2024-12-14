import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../utils/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        return auth.onAuthStateChanged(async (firebaseUser) => {
            if (firebaseUser) {
                // Create or update user document in Firestore
                const userRef = doc(db, 'users', firebaseUser.uid);
                const userDoc = await getDoc(userRef);
                
                if (!userDoc.exists()) {
                    // Create new user document if it doesn't exist
                    await setDoc(userRef, {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                        photoURL: firebaseUser.photoURL,
                        createdAt: new Date().toISOString()
                    });
                }

                // Get the latest user data
                const userData = (await getDoc(userRef)).data();
                setUser({ ...firebaseUser, ...userData });
            } else {
                setUser(null);
            }
            setLoading(false);
        });
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
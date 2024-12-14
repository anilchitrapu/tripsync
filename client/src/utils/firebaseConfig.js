import { initializeApp } from "firebase/app";
import { initializeFirestore, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with persistence enabled using the new approach
const db = initializeFirestore(app, {
  experimentalForceLongPolling: import.meta.env.DEV, // Use long polling in development
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  merge: true,
  cache: {
    persistenceEnabled: true,
    cacheSizeBytes: 40 * 1024 * 1024 // 40 MB
  }
});

const auth = getAuth(app);

// Debug auth state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('Firebase Auth: User is signed in:', user.uid);
  } else {
    console.log('Firebase Auth: User is signed out');
  }
});

// Initialize analytics only in a browser environment
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Set persistence to LOCAL
setPersistence(auth, browserLocalPersistence)
    .then(() => {
        console.log('Firebase auth persistence set to LOCAL');
    })
    .catch((error) => {
        console.error('Error setting auth persistence:', error);
    });

export { db, auth, analytics, onAuthStateChanged, setPersistence, browserLocalPersistence };
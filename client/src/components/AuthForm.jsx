import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../utils/firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { validatePassword } from '../utils/passwordValidation';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../utils/firebaseConfig';

function AuthForm() {
    const navigate = useNavigate();
    const [isLoggingIn, setIsLoggingIn] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [passwordValidation, setPasswordValidation] = useState(null);

    useEffect(() => {
        if (!isLoggingIn && password) {
            setPasswordValidation(validatePassword(password));
        }
    }, [password, isLoggingIn]);

    const toggleAuthMode = () => {
        setIsLoggingIn((prev) => !prev);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!isLoggingIn) {
                // Sign up validation
                const validation = validatePassword(password);
                if (!validation.isValid) {
                    setError('Please meet all password requirements');
                    setLoading(false);
                    return;
                }

                if (password !== confirmPassword) {
                    setError('Passwords do not match');
                    setLoading(false);
                    return;
                }

                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                // Update profile with full name
                await updateProfile(userCredential.user, {
                    displayName: `${firstName} ${lastName}`.trim()
                });

                // Create user document in Firestore
                await setDoc(doc(db, 'users', userCredential.user.uid), {
                    email,
                    firstName,
                    lastName,
                    displayName: `${firstName} ${lastName}`.trim(),
                    createdAt: new Date().toISOString()
                });
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            navigate('/');
        } catch (err) {
            console.error('Auth error:', err);
            setError(getAuthErrorMessage(err.code));
        } finally {
            setLoading(false);
        }
    };

    const getAuthErrorMessage = (errorCode) => {
        switch (errorCode) {
            case 'auth/email-already-in-use':
                return 'This email is already registered. Please log in instead.';
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                return 'Invalid email or password.';
            case 'auth/too-many-requests':
                return 'Too many attempts. Please try again later.';
            default:
                return 'An error occurred. Please try again.';
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoggingIn && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                        <label className="form-label">First Name</label>
                        <input
                            type="text"
                            className="form-input"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required={!isLoggingIn}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Last Name</label>
                        <input
                            type="text"
                            className="form-input"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required={!isLoggingIn}
                        />
                    </div>
                </div>
            )}

            <div className="form-group">
                <label className="form-label">Email</label>
                <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            <div className="form-group">
                <label className="form-label">Password</label>
                <input
                    type="password"
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                
                {!isLoggingIn && passwordValidation && (
                    <div className="mt-2 text-sm">
                        <p className="text-gray-600 mb-1">Password requirements:</p>
                        <ul className="space-y-1">
                            {Object.entries(passwordValidation.allRequirements).map(([key, requirement]) => (
                                <li 
                                    key={key}
                                    className={`flex items-center ${
                                        passwordValidation.validations[key] 
                                            ? 'text-green-600' 
                                            : 'text-gray-500'
                                    }`}
                                >
                                    {passwordValidation.validations[key] ? '✓' : '○'} {requirement}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {!isLoggingIn && (
                <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <input
                        type="password"
                        className="form-input"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
            )}

            {error && (
                <div className="text-red-500 text-sm">{error}</div>
            )}

            <button 
                type="submit" 
                className="button button-primary"
                disabled={loading || (!isLoggingIn && passwordValidation && !passwordValidation.isValid)}
            >
                {loading ? 'Loading...' : (isLoggingIn ? 'Log In' : 'Sign Up')}
            </button>

            <div className="text-center mt-4">
                <span className="text-muted">
                    {isLoggingIn ? "Don't have an account?" : "Already have an account?"}
                </span>
                <span
                    onClick={toggleAuthMode}
                    className="auth-toggle"
                >
                    {isLoggingIn ? 'Sign Up' : 'Log In'}
                </span>
            </div>
        </form>
    );
}

export default AuthForm;
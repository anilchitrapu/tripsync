import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
    updateEmail, 
    updatePassword, 
    reauthenticateWithCredential,
    EmailAuthProvider,
    deleteUser,
    updateProfile
} from 'firebase/auth';
import { validatePassword } from '../utils/passwordValidation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../utils/firebaseConfig';

function AccountSettings() {
    const { user } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [passwordValidation, setPasswordValidation] = useState(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    useEffect(() => {
        const loadProfile = async () => {
            if (!user) return;
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setFirstName(data.firstName || '');
                    setLastName(data.lastName || '');
                }
            } catch (error) {
                console.error('Error loading profile:', error);
            }
        };

        loadProfile();
    }, [user]);

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            Please log in to view your account settings.
        </div>;
    }

    // Reference the reauthorize function from old AccountSettings
    const reauthorize = async () => {
        if (!user) {
            throw new Error('No user found. Please try logging in again.');
        }
        if (!currentPassword) {
            throw new Error('Current password is required');
        }
        try {
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
        } catch (error) {
            console.error('Reauthorization error:', error);
            throw new Error('Failed to verify current password. Please try again.');
        }
    };

    const handleEmailChange = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await reauthorize();
            await updateEmail(user, newEmail);
            setSuccess('Email updated successfully');
            setNewEmail('');
            setCurrentPassword('');
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (newPassword !== confirmNewPassword) {
                throw new Error('New passwords do not match');
            }

            const validation = validatePassword(newPassword);
            if (!validation.isValid) {
                throw new Error('New password does not meet requirements');
            }

            await reauthorize();
            await updatePassword(user, newPassword);
            setSuccess('Password updated successfully');
            setNewPassword('');
            setConfirmNewPassword('');
            setCurrentPassword('');
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setError('');
        setLoading(true);

        try {
            await reauthorize();
            await deleteUser(user);
            // User will be automatically redirected due to auth state change
        } catch (err) {
            setError(getErrorMessage(err));
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            // Update Firestore first
            await updateDoc(doc(db, 'users', user.uid), {
                firstName,
                lastName,
                displayName: `${firstName} ${lastName}`.trim()
            });

            // Update Auth profile only if user is still authenticated
            if (user && user.getIdToken) {
                await updateProfile(user, {
                    displayName: `${firstName} ${lastName}`.trim()
                });
            }

            setSuccess('Profile updated successfully');
        } catch (err) {
            console.error('Profile update error:', err);
            setError('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getErrorMessage = (error) => {
        if (!error.code) {
            return error.message || 'An error occurred';
        }

        switch (error.code) {
            case 'auth/requires-recent-login':
                return 'Please re-enter your password to continue';
            case 'auth/email-already-in-use':
                return 'This email is already in use';
            case 'auth/invalid-email':
                return 'Please enter a valid email address';
            case 'auth/wrong-password':
                return 'Incorrect password';
            case 'auth/user-not-found':
                return 'User not found. Please try logging in again.';
            case 'auth/too-many-requests':
                return 'Too many attempts. Please try again later.';
            default:
                return error.message || 'An error occurred';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 py-6 sm:py-8">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Profile Section */}
                <section className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm
                                   border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">Profile Information</h2>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div className="form-group">
                            <label className="form-label text-gray-700 dark:text-gray-300">First Name</label>
                            <input
                                type="text"
                                className="form-input bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label text-gray-700 dark:text-gray-300">Last Name</label>
                            <input
                                type="text"
                                className="form-input bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="button button-secondary dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white flex items-center gap-2"
                            disabled={loading}
                        >
                            <span>Update Profile</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </button>
                    </form>
                </section>

                {/* Email Section */}
                <section className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm
                                   border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">Update Email</h2>
                    <form onSubmit={handleEmailChange} className="space-y-4">
                        <div className="form-group">
                            <label className="form-label text-gray-700 dark:text-gray-300">Current Email</label>
                            <input
                                type="email"
                                className="form-input bg-gray-100 text-gray-500 cursor-not-allowed"
                                value={user.email}
                                disabled
                                readOnly
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label text-gray-700 dark:text-gray-300">New Email</label>
                            <input
                                type="email"
                                className="form-input"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label text-gray-700 dark:text-gray-300">Current Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="button button-secondary dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white flex items-center gap-2"
                            disabled={loading}
                        >
                            <span>Update Email</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </button>
                    </form>
                </section>

                {/* Password Section */}
                <section className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm
                                   border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">Change Password</h2>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="form-group">
                            <label className="form-label text-gray-700 dark:text-gray-300">Current Email</label>
                            <input
                                type="email"
                                className="form-input bg-gray-50 text-gray-500"
                                value={user.email}
                                disabled
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label text-gray-700 dark:text-gray-300">Current Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label text-gray-700 dark:text-gray-300">New Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={newPassword}
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                    setPasswordValidation(validatePassword(e.target.value));
                                }}
                                required
                            />
                            {passwordValidation && (
                                <div className="mt-2 text-sm">
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
                        <div className="form-group">
                            <label className="form-label text-gray-700 dark:text-gray-300">Confirm New Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="button button-secondary dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white flex items-center gap-2"
                            disabled={loading}
                        >
                            <span>Update Password</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </button>
                    </form>
                </section>

                {/* Delete Account Section */}
                <section className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm
                                   border border-red-200 dark:border-red-900">
                    <h2 className="text-xl font-medium mb-4 text-red-600 dark:text-red-400">Delete Account</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Once you delete your account, all your data will be permanently removed. This action cannot be undone.
                    </p>
                    {!showDeleteConfirm ? (
                        <button 
                            onClick={() => setShowDeleteConfirm(true)}
                            className="button button-secondary dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white flex items-center gap-2"
                        >
                            <span>Delete Account</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <div className="form-group">
                                <label className="form-label text-gray-700 dark:text-gray-300">Enter Password to Confirm</label>
                                <input
                                    type="password"
                                    className="form-input bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex space-x-4">
                                <button 
                                    onClick={handleDeleteAccount}
                                    className="button button-secondary dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white flex items-center gap-2"
                                    disabled={loading}
                                >
                                    <span>Confirm Delete</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </button>
                                <button 
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setCurrentPassword('');
                                    }}
                                    className="button button-secondary dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white flex items-center gap-2"
                                    disabled={loading}
                                >
                                    <span>Cancel</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default AccountSettings;
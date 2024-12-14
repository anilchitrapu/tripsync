import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UserAvatar from '../common/UserAvatar';
import { signOut } from 'firebase/auth';
import { auth } from '../../utils/firebaseConfig';

function Navbar() {
    const { user } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const location = useLocation();
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const getFirstName = () => {
        if (!user) return '';
        if (user.displayName) {
            return user.displayName.split(' ')[0];
        }
        return user.email.split('@')[0];
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const handleMyEventsClick = (e) => {
        e.preventDefault();
        if (user) {
            navigate('/');
        } else {
            navigate('/auth');
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-900/30 fixed top-0 left-0 right-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link to="/" className="flex items-center">
                            <span className="text-xl font-bold text-gray-900 dark:text-white">TripSync</span>
                        </Link>
                    </div>

                    {user && (
                        <div className="flex items-center space-x-4">
                            <div onClick={handleMyEventsClick}>
                                <Link 
                                    to="/"
                                    className="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white font-medium"
                                >
                                    My Events
                                </Link>
                            </div>
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <UserAvatar 
                                        userId={user.uid}
                                        name={user.displayName}
                                        size="sm"
                                    />
                                    <span className="font-medium dark:text-white">{getFirstName()}</span>
                                </button>

                                <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-gray-700 transform transition-all duration-200 ease-in-out ${
                                    isDropdownOpen 
                                        ? 'opacity-100 translate-y-0' 
                                        : 'opacity-0 -translate-y-2 pointer-events-none'
                                }`}>
                                    <div className="py-1">
                                        <Link 
                                            to="/account-settings"
                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            Account Settings
                                        </Link>
                                        <button
                                            onClick={handleSignOut}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar; 
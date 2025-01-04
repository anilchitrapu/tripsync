import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthForm from '../components/AuthForm';

function AuthPage() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user && !loading) {
            navigate('/home');
        }
    }, [user, loading, navigate]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            Loading...
        </div>;
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-6">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
                    <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
                        Sign Up or Log In
                    </h1>
                    <AuthForm />
                </div>
            </div>
        );
    }

    return null;
}

export default AuthPage;
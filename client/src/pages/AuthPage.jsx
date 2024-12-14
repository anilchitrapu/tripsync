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
        return <div>Loading...</div>;
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="form-container">
                    <h1 className="text-3xl font-bold mb-6 text-center">Sign Up or Log In</h1>
                    <AuthForm />
                </div>
            </div>
        );
    }

    return null;
}

export default AuthPage;
import { useAuth } from '../context/AuthContext';

function AuthDebug() {
    const { user, loading } = useAuth();
    
    return (
        <div style={{ position: 'fixed', bottom: 0, right: 0, padding: '10px', background: '#eee', fontSize: '12px' }}>
            Auth State: {loading ? 'Loading...' : (user ? `Logged in as ${user.email}` : 'Not logged in')}
        </div>
    );
}

export default AuthDebug;
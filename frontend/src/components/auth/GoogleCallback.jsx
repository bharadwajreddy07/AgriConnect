import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const GoogleCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loginWithToken } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        const role = searchParams.get('role');
        const error = searchParams.get('error');

        if (error) {
            toast.error('Google authentication failed');
            navigate('/login');
            return;
        }

        if (token && role) {
            loginWithToken(token)
                .then(() => {
                    toast.success('Login successful!');
                    navigate('/' + role);
                })
                .catch((err) => {
                    console.error('Error fetching user:', err);
                    toast.error('Authentication failed');
                    navigate('/login');
                });
        } else {
            toast.error('Invalid authentication response');
            navigate('/login');
        }
    }, [searchParams, navigate, loginWithToken]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        }}>
            <div style={{ textAlign: 'center', color: 'white' }}>
                <div className="spinner" style={{ width: '60px', height: '60px', margin: '0 auto var(--spacing-4)' }}></div>
                <h2>Completing authentication...</h2>
            </div>
        </div>
    );
};

export default GoogleCallback;

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const GoogleCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setUser, setToken } = useAuth();

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
            // Store token and redirect
            setToken(token);
            localStorage.setItem('token', token);

            // Fetch user data
            fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setUser(data.user);
                        toast.success('Login successful!');
                        navigate(`/${role}`);
                    } else {
                        toast.error('Failed to fetch user data');
                        navigate('/login');
                    }
                })
                .catch(err => {
                    console.error('Error fetching user:', err);
                    toast.error('Authentication failed');
                    navigate('/login');
                });
        } else {
            toast.error('Invalid authentication response');
            navigate('/login');
        }
    }, [searchParams, navigate, setUser, setToken]);

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

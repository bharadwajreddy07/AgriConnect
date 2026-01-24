import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaShieldAlt, FaUserShield } from 'react-icons/fa';

const AdminLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await login(formData.email, formData.password);

        if (result.success) {
            if (result.user.role === 'admin') {
                toast.success('🔐 Admin login successful!');
                navigate('/admin');
            } else {
                toast.error('Access denied. Admin credentials required.');
                // Log out non-admin users
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        } else {
            toast.error(result.message);
        }

        setLoading(false);
    };

    // Quick fill for development (remove in production)
    const quickFill = () => {
        setFormData({
            email: 'superadmin@agrimart.com',
            password: 'Admin@2026',
        });
        toast.info('🔧 Dev credentials filled');
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--spacing-4)',
            }}
        >
            <div
                className="card"
                style={{
                    maxWidth: '500px',
                    width: '100%',
                    background: 'white',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                }}
            >
                {/* Header with Admin Badge */}
                <div className="card-header text-center" style={{ borderBottom: '3px solid var(--primary-green)' }}>
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                            marginBottom: 'var(--spacing-4)',
                        }}
                    >
                        <FaUserShield style={{ fontSize: '2.5rem', color: 'white' }} />
                    </div>
                    <h2 style={{ marginBottom: 'var(--spacing-2)' }}>Admin Portal</h2>
                    <p style={{ color: 'var(--gray-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-2)' }}>
                        <FaShieldAlt style={{ color: 'var(--primary-green)' }} />
                        Secure Administrative Access
                    </p>
                </div>

                {/* Security Warning */}
                <div
                    style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 'var(--border-radius)',
                        padding: 'var(--spacing-3)',
                        marginBottom: 'var(--spacing-6)',
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--error)',
                    }}
                >
                    <strong>⚠️ Authorized Personnel Only</strong>
                    <br />
                    Unauthorized access attempts are logged and monitored.
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Admin Email</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            placeholder="Enter admin email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                className="form-input"
                                placeholder="Enter admin password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                autoComplete="current-password"
                                style={{ paddingRight: 'var(--spacing-12)' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: 'var(--spacing-3)',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--gray-600)',
                                    fontSize: 'var(--font-size-lg)',
                                    padding: 'var(--spacing-2)',
                                }}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                            fontSize: 'var(--font-size-lg)',
                            fontWeight: 600,
                        }}
                        disabled={loading}
                    >
                        {loading ? '🔒 Authenticating...' : '🔐 Admin Login'}
                    </button>

                    {/* Development Quick Fill Button */}
                    {process.env.NODE_ENV === 'development' && (
                        <button
                            type="button"
                            onClick={quickFill}
                            className="btn btn-outline"
                            style={{
                                width: '100%',
                                marginTop: 'var(--spacing-3)',
                                fontSize: 'var(--font-size-sm)',
                            }}
                        >
                            🔧 Quick Fill (Dev Only)
                        </button>
                    )}
                </form>

                <div className="card-footer text-center">
                    <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>
                        Not an admin?{' '}
                        <a
                            href="/login"
                            style={{ fontWeight: 600, color: 'var(--primary-green)' }}
                        >
                            Regular Login
                        </a>
                    </p>
                    <p style={{ color: 'var(--gray-500)', fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-2)' }}>
                        🔒 All admin actions are logged for security
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;

import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tokenValid, setTokenValid] = useState(null);
    const { token } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        verifyToken();
    }, [token]);

    const verifyToken = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/verify-reset-token/${token}`);
            const data = await response.json();
            setTokenValid(response.ok);
            if (!response.ok) {
                toast.error(data.message || 'Invalid or expired reset link');
            }
        } catch (error) {
            console.error('Token verification error:', error);
            setTokenValid(false);
            toast.error('Failed to verify reset link');
        }
    };

    const getPasswordStrength = () => {
        if (!password) return { strength: 0, label: '', color: '' };

        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        switch (strength) {
            case 0:
            case 1:
                return { strength: 20, label: 'Weak', color: 'var(--error)' };
            case 2:
                return { strength: 40, label: 'Fair', color: 'var(--warning)' };
            case 3:
                return { strength: 60, label: 'Good', color: 'var(--blue-500)' };
            case 4:
                return { strength: 80, label: 'Strong', color: 'var(--success)' };
            case 5:
                return { strength: 100, label: 'Very Strong', color: 'var(--success)' };
            default:
                return { strength: 0, label: '', color: '' };
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Password created successfully! Redirecting to login...');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                toast.error(data.message || 'Failed to reset password');
            }
        } catch (error) {
            console.error('Reset password error:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (tokenValid === false) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'var(--gray-50)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--spacing-4)',
            }}>
                <div className="card-premium" style={{ maxWidth: '450px', width: '100%', textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-4)' }}>❌</div>
                    <h2 style={{ marginBottom: 'var(--spacing-3)' }}>Invalid Reset Link</h2>
                    <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--spacing-6)' }}>
                        This password reset link is invalid or has expired. Please request a new one.
                    </p>
                    <Link to="/forgot-password" className="btn btn-primary" style={{ width: '100%' }}>
                        Request New Link
                    </Link>
                </div>
            </div>
        );
    }

    if (tokenValid === null) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'var(--gray-50)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <div className="spinner"></div>
            </div>
        );
    }

    const passwordStrength = getPasswordStrength();
    const passwordsMatch = password && confirmPassword && password === confirmPassword;

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--gray-50)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--spacing-4)',
        }}>
            <div className="card-premium" style={{ maxWidth: '450px', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-6)' }}>
                    <h1 className="gradient-text" style={{ marginBottom: 'var(--spacing-2)' }}>Reset Password</h1>
                    <p style={{ color: 'var(--gray-600)' }}>
                        Enter your new password below
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* New Password */}
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">New Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                className="form-input"
                                placeholder="Enter new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
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
                                    color: 'var(--gray-400)',
                                }}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>

                        {/* Password Strength Indicator */}
                        {password && (
                            <div style={{ marginTop: 'var(--spacing-2)' }}>
                                <div style={{
                                    height: '4px',
                                    background: 'var(--gray-200)',
                                    borderRadius: '2px',
                                    overflow: 'hidden',
                                }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${passwordStrength.strength}%`,
                                        background: passwordStrength.color,
                                        transition: 'all 0.3s',
                                    }} />
                                </div>
                                <p style={{
                                    fontSize: 'var(--font-size-xs)',
                                    color: passwordStrength.color,
                                    marginTop: 'var(--spacing-1)',
                                }}>
                                    {passwordStrength.label}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                className="form-input"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{
                                    position: 'absolute',
                                    right: 'var(--spacing-3)',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--gray-400)',
                                }}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>

                        {/* Password Match Indicator */}
                        {confirmPassword && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-2)',
                                marginTop: 'var(--spacing-2)',
                                fontSize: 'var(--font-size-xs)',
                                color: passwordsMatch ? 'var(--success)' : 'var(--error)',
                            }}>
                                {passwordsMatch ? <FaCheckCircle /> : <FaTimesCircle />}
                                {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginBottom: 'var(--spacing-4)' }}
                        disabled={loading || !passwordsMatch}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>

                    <div style={{ textAlign: 'center' }}>
                        <Link to="/login" style={{ color: 'var(--primary-green)', fontSize: 'var(--font-size-sm)' }}>
                            ← Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;

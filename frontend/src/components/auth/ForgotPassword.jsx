import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [resetToken, setResetToken] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error('Please enter your email');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setEmailSent(true);
                setResetToken(data.resetToken);
                toast.success('Password reset link generated!');
            } else {
                toast.error(data.message || 'Failed to send reset link');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = () => {
        const resetUrl = `${window.location.origin}/reset-password/${resetToken}`;
        navigator.clipboard.writeText(resetUrl);
        toast.success('Reset link copied to clipboard!');
    };

    const handleDirectReset = () => {
        navigate(`/reset-password/${resetToken}`);
    };

    if (emailSent) {
        const resetUrl = `${window.location.origin}/reset-password/${resetToken}`;

        return (
            <div style={{
                minHeight: '100vh',
                background: 'var(--gray-50)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--spacing-4)',
            }}>
                <div className="card-premium" style={{ maxWidth: '550px', width: '100%' }}>
                    <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-6)' }}>
                        <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-4)' }}>✅</div>
                        <h2 style={{ marginBottom: 'var(--spacing-3)' }}>Reset Link Generated!</h2>
                        <p style={{ color: 'var(--gray-600)' }}>
                            Your password reset link has been generated for <strong>{email}</strong>
                        </p>
                    </div>

                    {/* Direct Reset Button */}
                    <button
                        onClick={handleDirectReset}
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            marginBottom: 'var(--spacing-4)',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        }}
                    >
                        Reset Password Now →
                    </button>

                    {/* Reset Link Display */}
                    <div style={{
                        background: 'var(--gray-100)',
                        padding: 'var(--spacing-4)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--spacing-4)',
                    }}>
                        <label style={{
                            display: 'block',
                            fontSize: 'var(--font-size-xs)',
                            fontWeight: 600,
                            color: 'var(--gray-700)',
                            marginBottom: 'var(--spacing-2)',
                        }}>
                            Reset Link (expires in 1 hour):
                        </label>
                        <div style={{
                            background: 'white',
                            padding: 'var(--spacing-3)',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--gray-300)',
                            fontSize: 'var(--font-size-xs)',
                            wordBreak: 'break-all',
                            color: 'var(--gray-700)',
                            marginBottom: 'var(--spacing-3)',
                        }}>
                            {resetUrl}
                        </div>
                        <button
                            onClick={handleCopyLink}
                            className="btn"
                            style={{
                                width: '100%',
                                background: 'white',
                                color: 'var(--primary-green)',
                                border: '1px solid var(--primary-green)',
                            }}
                        >
                            📋 Copy Link
                        </button>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <Link to="/login" style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>
                            ← Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

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
                    <h1 className="gradient-text" style={{ marginBottom: 'var(--spacing-2)' }}>Forgot Password?</h1>
                    <p style={{ color: 'var(--gray-600)' }}>
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            className="form-input"
                            placeholder="youremail@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginBottom: 'var(--spacing-4)' }}
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPassword;

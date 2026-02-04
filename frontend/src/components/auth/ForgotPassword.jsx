import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
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
                toast.success('Password reset link sent to your email!');
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

    if (emailSent) {
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
                    <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-4)' }}>✉️</div>
                    <h2 style={{ marginBottom: 'var(--spacing-3)' }}>Check Your Email</h2>
                    <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--spacing-6)' }}>
                        We've sent a password reset link to <strong>{email}</strong>.
                        Please check your inbox and follow the instructions to reset your password.
                    </p>
                    <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                        Back to Login
                    </Link>
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
                            placeholder="Enter your email"
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

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { MdPhone, MdArrowBack } from 'react-icons/md';
import api from '../../services/api';

const OTPLogin = () => {
    const [step, setStep] = useState('phone'); // 'phone' or 'otp' or 'register'
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(0);
    const [registrationData, setRegistrationData] = useState({
        name: '',
        role: 'consumer',
        region: '',
    });
    const navigate = useNavigate();
    const { setUser, setToken } = useAuth();

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/auth/otp/send', { phone });
            if (response.data.success) {
                toast.success(response.data.message);
                setStep('otp');
                setTimer(300); // 5 minutes
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/auth/otp/verify', {
                phone,
                otp,
                ...registrationData,
            });

            if (response.data.success) {
                if (response.data.requiresRegistration) {
                    setStep('register');
                    toast.info('Please complete your registration');
                } else {
                    // Login successful
                    setToken(response.data.token);
                    setUser(response.data.user);
                    localStorage.setItem('token', response.data.token);
                    toast.success('Login successful!');
                    navigate(`/${response.data.user.role}`);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteRegistration = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/auth/otp/verify', {
                phone,
                otp,
                ...registrationData,
            });

            if (response.data.success) {
                setToken(response.data.token);
                setUser(response.data.user);
                localStorage.setItem('token', response.data.token);
                toast.success('Registration successful!');
                navigate(`/${response.data.user.role}`);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (timer > 0) return;

        setLoading(true);
        try {
            const response = await api.post('/auth/otp/resend', { phone });
            if (response.data.success) {
                toast.success('OTP resent successfully');
                setTimer(300);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--white)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--spacing-4)',
        }}>
            <div style={{
                maxWidth: '480px',
                width: '100%',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 'var(--radius-2xl)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
                    padding: 'var(--spacing-8)',
                    textAlign: 'center',
                    color: 'white',
                    position: 'relative',
                }}>
                    {step !== 'phone' && (
                        <button
                            onClick={() => setStep(step === 'register' ? 'otp' : 'phone')}
                            style={{
                                position: 'absolute',
                                left: 'var(--spacing-4)',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: 'none',
                                borderRadius: 'var(--radius-full)',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                        >
                            <MdArrowBack size={20} />
                        </button>
                    )}
                    <MdPhone style={{ fontSize: '48px', marginBottom: 'var(--spacing-2)' }} />
                    <h2 style={{ marginBottom: 'var(--spacing-2)', fontSize: 'var(--font-size-3xl)', fontWeight: 700 }}>
                        {step === 'phone' && 'Login with OTP'}
                        {step === 'otp' && 'Verify OTP'}
                        {step === 'register' && 'Complete Registration'}
                    </h2>
                    <p style={{ opacity: 0.9, fontSize: 'var(--font-size-base)' }}>
                        {step === 'phone' && 'Enter your phone number to receive OTP'}
                        {step === 'otp' && `OTP sent to ${phone}`}
                        {step === 'register' && 'Just a few more details'}
                    </p>
                </div>

                <div style={{ padding: 'var(--spacing-8)' }}>
                    {/* Phone Number Step */}
                    {step === 'phone' && (
                        <form onSubmit={handleSendOTP}>
                            <div className="form-group">
                                <label className="form-label" style={{ fontWeight: 600, color: '#374151' }}>
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    placeholder="Enter 10-digit phone number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    pattern="[0-9]{10}"
                                    maxLength="10"
                                    style={{
                                        padding: 'var(--spacing-4)',
                                        fontSize: 'var(--font-size-lg)',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '2px solid #e5e7eb',
                                        textAlign: 'center',
                                        letterSpacing: '2px',
                                    }}
                                />
                                <p style={{ fontSize: 'var(--font-size-xs)', color: '#6b7280', marginTop: 'var(--spacing-2)' }}>
                                    We'll send you a 6-digit OTP
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || phone.length !== 10}
                                style={{
                                    width: '100%',
                                    padding: 'var(--spacing-4)',
                                    background: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--radius-lg)',
                                    fontSize: 'var(--font-size-base)',
                                    fontWeight: 600,
                                    cursor: (loading || phone.length !== 10) ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s ease',
                                    opacity: (loading || phone.length !== 10) ? 0.5 : 1,
                                }}
                                onMouseOver={(e) => {
                                    if (!loading && phone.length === 10) {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 10px 25px rgba(6, 78, 59, 0.4)';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </form>
                    )}

                    {/* OTP Verification Step */}
                    {step === 'otp' && (
                        <form onSubmit={handleVerifyOTP}>
                            <div className="form-group">
                                <label className="form-label" style={{ fontWeight: 600, color: '#374151' }}>
                                    Enter OTP
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="000000"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    required
                                    maxLength="6"
                                    style={{
                                        padding: 'var(--spacing-4)',
                                        fontSize: 'var(--font-size-2xl)',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '2px solid #e5e7eb',
                                        textAlign: 'center',
                                        letterSpacing: '8px',
                                        fontWeight: 600,
                                    }}
                                />
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginTop: 'var(--spacing-3)',
                                }}>
                                    <p style={{ fontSize: 'var(--font-size-sm)', color: '#6b7280' }}>
                                        {timer > 0 ? `Expires in ${formatTime(timer)}` : 'OTP expired'}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleResendOTP}
                                        disabled={timer > 0 || loading}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: timer > 0 ? '#9ca3af' : '#059669',
                                            fontSize: 'var(--font-size-sm)',
                                            fontWeight: 600,
                                            cursor: timer > 0 ? 'not-allowed' : 'pointer',
                                            textDecoration: 'underline',
                                        }}
                                    >
                                        Resend OTP
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.length !== 6}
                                style={{
                                    width: '100%',
                                    padding: 'var(--spacing-4)',
                                    background: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--radius-lg)',
                                    fontSize: 'var(--font-size-base)',
                                    fontWeight: 600,
                                    cursor: (loading || otp.length !== 6) ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s ease',
                                    opacity: (loading || otp.length !== 6) ? 0.5 : 1,
                                }}
                                onMouseOver={(e) => {
                                    if (!loading && otp.length === 6) {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 10px 25px rgba(6, 78, 59, 0.4)';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                        </form>
                    )}

                    {/* Registration Step */}
                    {step === 'register' && (
                        <form onSubmit={handleCompleteRegistration}>
                            <div className="form-group">
                                <label className="form-label" style={{ fontWeight: 600, color: '#374151' }}>
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter your full name"
                                    value={registrationData.name}
                                    onChange={(e) => setRegistrationData({ ...registrationData, name: e.target.value })}
                                    required
                                    style={{
                                        padding: 'var(--spacing-4)',
                                        fontSize: 'var(--font-size-base)',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '2px solid #e5e7eb',
                                    }}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" style={{ fontWeight: 600, color: '#374151' }}>
                                    I am a *
                                </label>
                                <select
                                    className="form-select"
                                    value={registrationData.role}
                                    onChange={(e) => setRegistrationData({ ...registrationData, role: e.target.value })}
                                    required
                                    style={{
                                        padding: 'var(--spacing-4)',
                                        fontSize: 'var(--font-size-base)',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '2px solid #e5e7eb',
                                    }}
                                >
                                    <option value="consumer">Consumer</option>
                                    <option value="farmer">Farmer</option>
                                    <option value="wholesaler">Wholesaler</option>
                                </select>
                            </div>

                            {(registrationData.role === 'farmer' || registrationData.role === 'wholesaler') && (
                                <div className="form-group">
                                    <label className="form-label" style={{ fontWeight: 600, color: '#374151' }}>
                                        Region *
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g., South India, North India"
                                        value={registrationData.region}
                                        onChange={(e) => setRegistrationData({ ...registrationData, region: e.target.value })}
                                        required
                                        style={{
                                            padding: 'var(--spacing-4)',
                                            fontSize: 'var(--font-size-base)',
                                            borderRadius: 'var(--radius-lg)',
                                            border: '2px solid #e5e7eb',
                                        }}
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: 'var(--spacing-4)',
                                    background: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--radius-lg)',
                                    fontSize: 'var(--font-size-base)',
                                    fontWeight: 600,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s ease',
                                    opacity: loading ? 0.7 : 1,
                                }}
                                onMouseOver={(e) => {
                                    if (!loading) {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 10px 25px rgba(6, 78, 59, 0.4)';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                {loading ? 'Completing...' : 'Complete Registration'}
                            </button>
                        </form>
                    )}

                    {/* Footer */}
                    <div style={{
                        marginTop: 'var(--spacing-6)',
                        textAlign: 'center',
                        color: '#6b7280',
                        fontSize: 'var(--font-size-sm)',
                    }}>
                        <Link
                            to="/login"
                            style={{
                                color: '#059669',
                                fontWeight: 600,
                                textDecoration: 'none',
                                transition: 'color 0.3s ease',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.color = '#064e3b'}
                            onMouseOut={(e) => e.currentTarget.style.color = '#059669'}
                        >
                            ← Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OTPLogin;

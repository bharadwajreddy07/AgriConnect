import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/i18n';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaTractor } from 'react-icons/fa';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const { t } = useI18n();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await login(formData.email, formData.password);

        if (result.success) {
            toast.success('Login successful!');
            navigate(`/${result.user.role}`);
        } else {
            toast.error(result.message);
        }

        setLoading(false);
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--spacing-6)',
                background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.95) 0%, rgba(5, 150, 105, 0.9) 100%)',
                overflow: 'hidden',
            }}
        >
            {/* Background Image */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: 'url(https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=1200&q=80)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.15,
                    zIndex: 0,
                }}
            />

            <div
                className="scale-in"
                style={{
                    position: 'relative',
                    zIndex: 1,
                    maxWidth: '450px',
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    borderRadius: 'var(--radius-2xl)',
                    boxShadow: 'var(--shadow-3d)',
                    padding: 'var(--spacing-8) var(--spacing-6)',
                }}
            >
                {/* Logo & Header */}
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-8)' }}>
                    <div
                        style={{
                            width: '60px',
                            height: '60px',
                            margin: '0 auto var(--spacing-4)',
                            borderRadius: '50%',
                            background: 'var(--gradient-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: 'var(--shadow-glow-green)',
                        }}
                    >
                        <FaTractor style={{ color: 'white', fontSize: '1.8rem' }} />
                    </div>
                    <h2
                        style={{
                            fontSize: 'var(--font-size-2xl)',
                            fontWeight: 800,
                            color: 'var(--gray-900)',
                            marginBottom: 'var(--spacing-2)',
                        }}
                    >
                        {t('auth.loginTitle')}
                    </h2>
                    <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>
                        {t('auth.loginSubtitle')}
                    </p>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                    {/* Email */}
                    <div>
                        <label
                            style={{
                                display: 'block',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: 600,
                                color: 'var(--gray-700)',
                                marginBottom: 'var(--spacing-2)',
                            }}
                        >
                            {t('auth.email')}
                        </label>
                        <div style={{ position: 'relative' }}>
                            <FaEnvelope
                                style={{
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--gray-400)',
                                }}
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: 'var(--spacing-3) var(--spacing-3) var(--spacing-3) 40px',
                                    fontSize: 'var(--font-size-sm)',
                                    border: '1.5px solid var(--gray-200)',
                                    borderRadius: 'var(--radius-lg)',
                                    outline: 'none',
                                    background: 'var(--white)',
                                    transition: 'all 0.2s ease',
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'var(--primary-green)';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.15)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'var(--gray-200)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label
                            style={{
                                display: 'block',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: 600,
                                color: 'var(--gray-700)',
                                marginBottom: 'var(--spacing-2)',
                            }}
                        >
                            {t('auth.password')}
                        </label>
                        <div style={{ position: 'relative' }}>
                            <FaLock
                                style={{
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--gray-400)',
                                }}
                            />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: 'var(--spacing-3) 44px var(--spacing-3) 40px',
                                    fontSize: 'var(--font-size-sm)',
                                    border: '1.5px solid var(--gray-200)',
                                    borderRadius: 'var(--radius-lg)',
                                    outline: 'none',
                                    background: 'var(--white)',
                                    transition: 'all 0.2s ease',
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'var(--primary-green)';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.15)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'var(--gray-200)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--gray-400)',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                            </button>
                        </div>
                        <div style={{ textAlign: 'right', marginTop: 'var(--spacing-2)' }}>
                            <Link
                                to="/forgot-password"
                                style={{
                                    color: 'var(--primary-green)',
                                    fontSize: 'var(--font-size-xs)',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    transition: 'color 0.2s',
                                }}
                                onMouseOver={(e) => e.target.style.color = 'var(--primary-green-dark)'}
                                onMouseOut={(e) => e.target.style.color = 'var(--primary-green)'}
                            >
                                {t('auth.forgotPassword')}
                            </Link>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="ripple"
                        style={{
                            width: '100%',
                            padding: 'var(--spacing-3)',
                            background: loading ? 'var(--gray-400)' : 'var(--gradient-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-lg)',
                            fontSize: 'var(--font-size-base)',
                            fontWeight: 700,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            boxShadow: loading ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.2)',
                            transition: 'all 0.2s ease',
                            marginTop: 'var(--spacing-2)',
                        }}
                    >
                        {loading ? t('auth.signingIn') : t('nav.login')}
                    </button>
                </form>

                {/* Register Link */}
                <div style={{ textAlign: 'center', marginTop: 'var(--spacing-6)', borderTop: '1px solid var(--gray-200)', paddingTop: 'var(--spacing-4)' }}>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', margin: 0 }}>
                        {t('auth.noAccount')}{' '}
                        <Link
                            to="/register"
                            style={{
                                color: 'var(--primary-green)',
                                fontWeight: 700,
                                textDecoration: 'none',
                                transition: 'color 0.2s',
                            }}
                            onMouseOver={(e) => e.target.style.color = 'var(--primary-green-dark)'}
                            onMouseOut={(e) => e.target.style.color = 'var(--primary-green)'}
                        >
                            {t('auth.signUp')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;

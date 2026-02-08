import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
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
            toast.success('Login successful!');
            navigate(`/${result.user.role}`);
        } else {
            toast.error(result.message);
        }

        setLoading(false);
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--gray-50)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--spacing-4)',
        }}>
            <div style={{
                maxWidth: '450px',
                width: '100%',
                background: 'white',
                borderRadius: 'var(--radius-xl)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                padding: 'var(--spacing-8)',
            }}>
                {/* Header */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: 'var(--spacing-8)',
                }}>
                    <h2 style={{
                        fontSize: 'var(--font-size-2xl)',
                        fontWeight: 700,
                        color: 'var(--gray-900)',
                        marginBottom: 'var(--spacing-2)',
                    }}>
                        Welcome Back
                    </h2>
                    <p style={{
                        color: 'var(--gray-600)',
                        fontSize: 'var(--font-size-sm)',
                    }}>
                        Login to your AgriConnect account
                    </p>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleSubmit}>
                    {/* Email */}
                    <div style={{ marginBottom: 'var(--spacing-4)' }}>
                        <label style={{
                            display: 'block',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 500,
                            color: 'var(--gray-700)',
                            marginBottom: 'var(--spacing-2)',
                        }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="youremail@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: 'var(--spacing-3)',
                                fontSize: 'var(--font-size-sm)',
                                border: '1px solid var(--gray-300)',
                                borderRadius: 'var(--radius-md)',
                                outline: 'none',
                                background: 'var(--gray-50)',
                                transition: 'all 0.2s',
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#10b981';
                                e.target.style.background = 'white';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'var(--gray-300)';
                                e.target.style.background = 'var(--gray-50)';
                            }}
                        />
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: 'var(--spacing-5)' }}>
                        <label style={{
                            display: 'block',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 500,
                            color: 'var(--gray-700)',
                            marginBottom: 'var(--spacing-2)',
                        }}>
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: 'var(--spacing-3)',
                                    paddingRight: '40px',
                                    fontSize: 'var(--font-size-sm)',
                                    border: '1px solid var(--gray-300)',
                                    borderRadius: 'var(--radius-md)',
                                    outline: 'none',
                                    background: 'var(--gray-50)',
                                    transition: 'all 0.2s',
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#10b981';
                                    e.target.style.background = 'white';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'var(--gray-300)';
                                    e.target.style.background = 'var(--gray-50)';
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
                                    color: 'var(--gray-500)',
                                    padding: '4px',
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
                                    fontSize: 'var(--font-size-sm)',
                                    textDecoration: 'none',
                                }}
                            >
                                Forgot Password?
                            </Link>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: 'var(--spacing-3)',
                            background: loading ? 'var(--gray-400)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseOver={(e) => {
                            if (!loading) {
                                e.target.style.transform = 'translateY(-1px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                            }
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                {/* Register Link */}
                <div style={{ textAlign: 'center', marginTop: 'var(--spacing-6)' }}>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            style={{
                                color: '#10b981',
                                fontWeight: 600,
                                textDecoration: 'none',
                            }}
                        >
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;

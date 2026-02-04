import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { indianStates } from '../../utils/cropData';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: 'consumer',
        region: '',
        address: {
            street: '',
            village: '',
            district: '',
            state: '',
            pincode: '',
        },
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setFormData({
                ...formData,
                address: { ...formData.address, [addressField]: value },
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match!');
            return;
        }

        // Validate password length
        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        const { confirmPassword, ...registerData } = formData;
        const result = await register(registerData);

        if (result.success) {
            toast.success('Registration successful!');
            navigate(`/${result.user.role}`);
        } else {
            toast.error(result.message);
        }

        setLoading(false);
    };

    const needsAddress = formData.role === 'farmer' || formData.role === 'wholesaler';

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--gray-50)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--spacing-4)'
        }}>
            <div style={{
                maxWidth: '500px',
                width: '100%',
                background: 'white',
                borderRadius: 'var(--radius-xl)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                padding: 'var(--spacing-8)'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-8)' }}>
                    <h2 style={{
                        fontSize: 'var(--font-size-2xl)',
                        fontWeight: 600,
                        color: 'var(--gray-900)',
                        marginBottom: 'var(--spacing-2)'
                    }}>
                        Register on AgriConnect
                    </h2>
                    <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>
                        Create your account to get started
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Full Name */}
                    <div style={{ marginBottom: 'var(--spacing-5)' }}>
                        <label style={{
                            display: 'block',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 500,
                            color: 'var(--gray-700)',
                            marginBottom: 'var(--spacing-2)'
                        }}>
                            Full Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: 'var(--spacing-3)',
                                fontSize: 'var(--font-size-sm)',
                                border: '1px solid var(--gray-300)',
                                borderRadius: 'var(--radius-md)',
                                outline: 'none',
                                transition: 'all 0.2s',
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary-green)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--gray-300)'}
                        />
                    </div>

                    {/* Email */}
                    <div style={{ marginBottom: 'var(--spacing-5)' }}>
                        <label style={{
                            display: 'block',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 500,
                            color: 'var(--gray-700)',
                            marginBottom: 'var(--spacing-2)'
                        }}>
                            Email *
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
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
                                transition: 'all 0.2s',
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary-green)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--gray-300)'}
                        />
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: 'var(--spacing-5)' }}>
                        <label style={{
                            display: 'block',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 500,
                            color: 'var(--gray-700)',
                            marginBottom: 'var(--spacing-2)'
                        }}>
                            Password *
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="Enter password (min 6 characters)"
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
                                    transition: 'all 0.2s',
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--primary-green)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--gray-300)'}
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
                    </div>

                    {/* Confirm Password */}
                    <div style={{ marginBottom: 'var(--spacing-5)' }}>
                        <label style={{
                            display: 'block',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 500,
                            color: 'var(--gray-700)',
                            marginBottom: 'var(--spacing-2)'
                        }}>
                            Confirm Password *
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                placeholder="Re-enter your password"
                                value={formData.confirmPassword}
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
                                    transition: 'all 0.2s',
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--primary-green)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--gray-300)'}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                                {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div style={{ marginBottom: 'var(--spacing-5)' }}>
                        <label style={{
                            display: 'block',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 500,
                            color: 'var(--gray-700)',
                            marginBottom: 'var(--spacing-2)'
                        }}>
                            Phone Number *
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Enter 10-digit phone number"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            pattern="[0-9]{10}"
                            maxLength="10"
                            style={{
                                width: '100%',
                                padding: 'var(--spacing-3)',
                                fontSize: 'var(--font-size-sm)',
                                border: '1px solid var(--gray-300)',
                                borderRadius: 'var(--radius-md)',
                                outline: 'none',
                                transition: 'all 0.2s',
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary-green)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--gray-300)'}
                        />
                    </div>

                    {/* Role Selection */}
                    <div style={{ marginBottom: 'var(--spacing-5)' }}>
                        <label style={{
                            display: 'block',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 500,
                            color: 'var(--gray-700)',
                            marginBottom: 'var(--spacing-2)'
                        }}>
                            I am a *
                        </label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: 'var(--spacing-3)',
                                fontSize: 'var(--font-size-sm)',
                                border: '1px solid var(--gray-300)',
                                borderRadius: 'var(--radius-md)',
                                outline: 'none',
                                transition: 'all 0.2s',
                                background: 'white',
                                cursor: 'pointer',
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary-green)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--gray-300)'}
                        >
                            <option value="consumer">Consumer</option>
                            <option value="farmer">Farmer</option>
                            <option value="wholesaler">Wholesaler</option>
                        </select>
                    </div>

                    {/* Conditional Address Fields */}
                    {needsAddress && (
                        <>
                            {/* Region */}
                            <div style={{ marginBottom: 'var(--spacing-5)' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: 'var(--font-size-sm)',
                                    fontWeight: 500,
                                    color: 'var(--gray-700)',
                                    marginBottom: 'var(--spacing-2)'
                                }}>
                                    Region *
                                </label>
                                <input
                                    type="text"
                                    name="region"
                                    placeholder="e.g., South India, North India"
                                    value={formData.region}
                                    onChange={handleChange}
                                    required={needsAddress}
                                    style={{
                                        width: '100%',
                                        padding: 'var(--spacing-3)',
                                        fontSize: 'var(--font-size-sm)',
                                        border: '1px solid var(--gray-300)',
                                        borderRadius: 'var(--radius-md)',
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--primary-green)'}
                                    onBlur={(e) => e.target.style.borderColor = 'var(--gray-300)'}
                                />
                            </div>

                            {/* State */}
                            <div style={{ marginBottom: 'var(--spacing-5)' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: 'var(--font-size-sm)',
                                    fontWeight: 500,
                                    color: 'var(--gray-700)',
                                    marginBottom: 'var(--spacing-2)'
                                }}>
                                    State *
                                </label>
                                <select
                                    name="address.state"
                                    value={formData.address.state}
                                    onChange={handleChange}
                                    required={needsAddress}
                                    style={{
                                        width: '100%',
                                        padding: 'var(--spacing-3)',
                                        fontSize: 'var(--font-size-sm)',
                                        border: '1px solid var(--gray-300)',
                                        borderRadius: 'var(--radius-md)',
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                        background: 'white',
                                        cursor: 'pointer',
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--primary-green)'}
                                    onBlur={(e) => e.target.style.borderColor = 'var(--gray-300)'}
                                >
                                    <option value="">Select State</option>
                                    {indianStates.map((state) => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>

                            {/* District */}
                            <div style={{ marginBottom: 'var(--spacing-5)' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: 'var(--font-size-sm)',
                                    fontWeight: 500,
                                    color: 'var(--gray-700)',
                                    marginBottom: 'var(--spacing-2)'
                                }}>
                                    District *
                                </label>
                                <input
                                    type="text"
                                    name="address.district"
                                    placeholder="Enter district"
                                    value={formData.address.district}
                                    onChange={handleChange}
                                    required={needsAddress}
                                    style={{
                                        width: '100%',
                                        padding: 'var(--spacing-3)',
                                        fontSize: 'var(--font-size-sm)',
                                        border: '1px solid var(--gray-300)',
                                        borderRadius: 'var(--radius-md)',
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--primary-green)'}
                                    onBlur={(e) => e.target.style.borderColor = 'var(--gray-300)'}
                                />
                            </div>
                        </>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: 'var(--spacing-3)',
                            background: loading ? 'var(--gray-400)' : 'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            marginTop: 'var(--spacing-2)',
                        }}
                        onMouseOver={(e) => {
                            if (!loading) {
                                e.target.style.transform = 'translateY(-1px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(6, 78, 59, 0.3)';
                            }
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>

                    {/* Login Link */}
                    <div style={{ textAlign: 'center', marginTop: 'var(--spacing-6)' }}>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                style={{
                                    color: '#059669',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                }}
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/i18n';
import { toast } from 'react-toastify';
import { indianStates } from '../../utils/cropData';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaGlobe } from 'react-icons/fa';

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
    const { t } = useI18n();
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

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match!');
            return;
        }

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
        <div
            style={{
                minHeight: '120vh',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--spacing-8) var(--spacing-4)',
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
                    backgroundImage: 'url(https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&q=80)',
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
                    maxWidth: '550px',
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.94)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    borderRadius: 'var(--radius-2xl)',
                    boxShadow: 'var(--shadow-3d)',
                    padding: 'var(--spacing-8) var(--spacing-6)',
                }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-6)' }}>
                    <h2
                        style={{
                            fontSize: 'var(--font-size-2xl)',
                            fontWeight: 800,
                            color: 'var(--gray-900)',
                            marginBottom: 'var(--spacing-2)',
                        }}
                    >
                        {t('auth.registerTitle')}
                    </h2>
                    <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>
                        {t('auth.registerSubtitle')}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                    {/* Role Selector */}
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
                            {t('auth.role')}
                        </label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: 'var(--spacing-3)',
                                fontSize: 'var(--font-size-sm)',
                                border: '1.5px solid var(--gray-200)',
                                borderRadius: 'var(--radius-lg)',
                                outline: 'none',
                                background: 'white',
                            }}
                        >
                            <option value="consumer">{t('home.consumer')}</option>
                            <option value="farmer">{t('home.farmer')}</option>
                            <option value="wholesaler">{t('home.wholesaler')}</option>
                        </select>
                    </div>

                    {/* Full Name */}
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
                            {t('auth.name')}
                        </label>
                        <div style={{ position: 'relative' }}>
                            <FaUser style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: 'var(--spacing-3) var(--spacing-3) var(--spacing-3) 40px',
                                    fontSize: 'var(--font-size-sm)',
                                    border: '1.5px solid var(--gray-200)',
                                    borderRadius: 'var(--radius-lg)',
                                    outline: 'none',
                                }}
                            />
                        </div>
                    </div>

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
                            <FaEnvelope style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                            <input
                                type="email"
                                name="email"
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
                                }}
                            />
                        </div>
                    </div>

                    {/* Phone */}
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
                            {t('auth.phone')}
                        </label>
                        <div style={{ position: 'relative' }}>
                            <FaPhone style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: 'var(--spacing-3) var(--spacing-3) var(--spacing-3) 40px',
                                    fontSize: 'var(--font-size-sm)',
                                    border: '1.5px solid var(--gray-200)',
                                    borderRadius: 'var(--radius-lg)',
                                    outline: 'none',
                                }}
                            />
                        </div>
                    </div>

                    {/* Region - Show only if farmer/wholesaler */}
                    {needsAddress && (
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
                                Region / State Area
                            </label>
                            <div style={{ position: 'relative' }}>
                                <FaGlobe style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                                <input
                                    type="text"
                                    name="region"
                                    placeholder="e.g. South India, Punjab Region"
                                    value={formData.region}
                                    onChange={handleChange}
                                    required={needsAddress}
                                    style={{
                                        width: '100%',
                                        padding: 'var(--spacing-3) var(--spacing-3) var(--spacing-3) 40px',
                                        fontSize: 'var(--font-size-sm)',
                                        border: '1.5px solid var(--gray-200)',
                                        borderRadius: 'var(--radius-lg)',
                                        outline: 'none',
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Address Fields - Show only if farmer/wholesaler */}
                    {needsAddress && (
                        <div style={{ background: 'var(--gray-50)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                            <h4 style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--gray-800)', fontWeight: 600 }}>Business Address</h4>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)' }}>
                                <div>
                                    <input
                                        type="text"
                                        name="address.village"
                                        placeholder="Village / Area"
                                        value={formData.address.village}
                                        onChange={handleChange}
                                        required={needsAddress}
                                        style={{ width: '100%', padding: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius-md)' }}
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        name="address.district"
                                        placeholder="District"
                                        value={formData.address.district}
                                        onChange={handleChange}
                                        required={needsAddress}
                                        style={{ width: '100%', padding: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius-md)' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)' }}>
                                <div>
                                    <select
                                        name="address.state"
                                        value={formData.address.state}
                                        onChange={handleChange}
                                        required={needsAddress}
                                        style={{ width: '100%', padding: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius-md)' }}
                                    >
                                        <option value="">Select State</option>
                                        {indianStates.map((s, idx) => (
                                            <option key={idx} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        name="address.pincode"
                                        placeholder="Pincode"
                                        value={formData.address.pincode}
                                        onChange={handleChange}
                                        required={needsAddress}
                                        style={{ width: '100%', padding: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius-md)' }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

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
                            <FaLock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
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
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}
                            >
                                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
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
                            {t('auth.confirmPassword')}
                        </label>
                        <div style={{ position: 'relative' }}>
                            <FaLock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: 'var(--spacing-3) 44px var(--spacing-3) 40px',
                                    fontSize: 'var(--font-size-sm)',
                                    border: '1.5px solid var(--gray-200)',
                                    borderRadius: 'var(--radius-lg)',
                                    outline: 'none',
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}
                            >
                                {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
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
                        {loading ? t('auth.signingUp') : t('auth.signUp')}
                    </button>
                </form>

                {/* Login Link */}
                <div style={{ textAlign: 'center', marginTop: 'var(--spacing-6)', borderTop: '1px solid var(--gray-200)', paddingTop: 'var(--spacing-4)' }}>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', margin: 0 }}>
                        {t('auth.hasAccount')}{' '}
                        <Link
                            to="/login"
                            style={{
                                color: 'var(--primary-green)',
                                fontWeight: 700,
                                textDecoration: 'none',
                            }}
                        >
                            {t('nav.login')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;

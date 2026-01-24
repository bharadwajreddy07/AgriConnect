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
        <div className="container" style={{ maxWidth: '600px', marginTop: 'var(--spacing-12)', marginBottom: 'var(--spacing-12)' }}>
            <div className="card" style={{ background: 'white' }}>
                <div className="card-header text-center">
                    <h2>Register on AgriConnect</h2>
                    <p style={{ color: 'var(--gray-600)' }}>Create your account to get started</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Basic Information */}
                    <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input
                            type="text"
                            name="name"
                            className="form-input"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email *</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password *</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                className="form-input"
                                placeholder="Enter password (min 6 characters)"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
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

                    <div className="form-group">
                        <label className="form-label">Confirm Password *</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                className="form-input"
                                placeholder="Re-enter your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                minLength={6}
                                style={{ paddingRight: 'var(--spacing-12)' }}
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
                                    color: 'var(--gray-600)',
                                    fontSize: 'var(--font-size-lg)',
                                    padding: 'var(--spacing-2)',
                                }}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                            <p className="form-error">Passwords do not match</p>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Phone Number *</label>
                        <input
                            type="tel"
                            name="phone"
                            className="form-input"
                            placeholder="Enter 10-digit phone number"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            pattern="[0-9]{10}"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">I am a *</label>
                        <select
                            name="role"
                            className="form-select"
                            value={formData.role}
                            onChange={handleChange}
                            required
                        >
                            <option value="consumer">Consumer</option>
                            <option value="farmer">Farmer</option>
                            <option value="wholesaler">Wholesaler</option>
                        </select>
                    </div>

                    {/* Address Information (for Farmer and Wholesaler) */}
                    {needsAddress && (
                        <>
                            <h4 style={{ marginTop: 'var(--spacing-6)', marginBottom: 'var(--spacing-4)' }}>
                                Address Information
                            </h4>

                            <div className="form-group">
                                <label className="form-label">State *</label>
                                <select
                                    name="address.state"
                                    className="form-select"
                                    value={formData.address.state}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select State</option>
                                    {indianStates.map((state) => (
                                        <option key={state} value={state}>
                                            {state}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">District *</label>
                                <input
                                    type="text"
                                    name="address.district"
                                    className="form-input"
                                    placeholder="Enter district"
                                    value={formData.address.district}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Village/Town</label>
                                <input
                                    type="text"
                                    name="address.village"
                                    className="form-input"
                                    placeholder="Enter village or town"
                                    value={formData.address.village}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Street Address</label>
                                <input
                                    type="text"
                                    name="address.street"
                                    className="form-input"
                                    placeholder="Enter street address"
                                    value={formData.address.street}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Pincode</label>
                                <input
                                    type="text"
                                    name="address.pincode"
                                    className="form-input"
                                    placeholder="Enter pincode"
                                    value={formData.address.pincode}
                                    onChange={handleChange}
                                    pattern="[0-9]{6}"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Region *</label>
                                <input
                                    type="text"
                                    name="region"
                                    className="form-input"
                                    placeholder="Enter region (e.g., North India, South India)"
                                    value={formData.region}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <div className="card-footer text-center">
                    <p style={{ color: 'var(--gray-600)' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ fontWeight: 600 }}>
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;

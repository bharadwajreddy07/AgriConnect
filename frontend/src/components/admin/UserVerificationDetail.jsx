import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { formatDateTime } from '../../utils/cropData';

const UserVerificationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        loadUserDetails();
    }, [id]);

    const loadUserDetails = async () => {
        try {
            const response = await api.get(`/admin/users/${id}`);
            setUserDetails(response.data.data);
        } catch (error) {
            toast.error('Failed to load user details');
            navigate('/admin/users');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        setSubmitting(true);
        try {
            await api.put(`/admin/users/${id}/verify`, {
                isVerified: true,
                notes,
            });
            toast.success('User verified successfully!');
            navigate('/admin/users');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to verify user');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async () => {
        const reason = window.prompt('Please provide a reason for rejection:');
        if (!reason) return;

        setSubmitting(true);
        try {
            await api.put(`/admin/users/${id}/verify`, {
                isVerified: false,
                notes: reason,
            });
            toast.success('User verification rejected');
            navigate('/admin/users');
        } catch (error) {
            toast.error('Failed to reject verification');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: '80vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!userDetails) {
        return (
            <div className="container mt-8">
                <div className="card text-center p-8">
                    <h3>User not found</h3>
                    <button className="btn btn-primary mt-4" onClick={() => navigate('/admin/users')}>
                        Back to User Management
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ marginTop: 'var(--spacing-8)', marginBottom: 'var(--spacing-8)' }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <button className="btn btn-outline btn-sm mb-3" onClick={() => navigate('/admin/users')}>
                        ← Back to User Management
                    </button>
                    <h1>User Verification Review</h1>
                    <p style={{ color: 'var(--gray-600)' }}>
                        Review and verify user profile
                    </p>
                </div>
                <span className={`badge ${userDetails.isVerified ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 'var(--font-size-base)', padding: 'var(--spacing-2) var(--spacing-4)' }}>
                    {userDetails.isVerified ? 'Verified' : 'Pending Verification'}
                </span>
            </div>

            <div className="grid grid-cols-1 gap-6" style={{ gridTemplateColumns: '2fr 1fr' }}>
                {/* Left Column - User Details */}
                <div className="flex flex-col gap-6">
                    {/* Basic Information */}
                    <div className="card">
                        <h3 className="mb-4">Basic Information</h3>
                        <div className="grid gap-4">
                            <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                <div>
                                    <label style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>Full Name</label>
                                    <p style={{ fontWeight: 600, marginTop: 'var(--spacing-1)' }}>{userDetails.name}</p>
                                </div>
                                <div>
                                    <label style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>Role</label>
                                    <div style={{ marginTop: 'var(--spacing-1)' }}>
                                        <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
                                            {userDetails.role}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                <div>
                                    <label style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>Email</label>
                                    <p style={{ marginTop: 'var(--spacing-1)' }}>{userDetails.email}</p>
                                </div>
                                <div>
                                    <label style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>Phone</label>
                                    <p style={{ marginTop: 'var(--spacing-1)' }}>{userDetails.phone || 'Not provided'}</p>
                                </div>
                            </div>

                            <div>
                                <label style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>Address</label>
                                <p style={{ marginTop: 'var(--spacing-1)' }}>{userDetails.address || 'Not provided'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Location Information */}
                    {userDetails.region && (
                        <div className="card">
                            <h3 className="mb-4">Location Details</h3>
                            <div className="grid gap-3">
                                <div className="flex justify-between">
                                    <span style={{ color: 'var(--gray-600)' }}>State:</span>
                                    <strong>{userDetails.region.state || 'N/A'}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span style={{ color: 'var(--gray-600)' }}>District:</span>
                                    <strong>{userDetails.region.district || 'N/A'}</strong>
                                </div>
                                {userDetails.region.pincode && (
                                    <div className="flex justify-between">
                                        <span style={{ color: 'var(--gray-600)' }}>Pincode:</span>
                                        <strong>{userDetails.region.pincode}</strong>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Role-Specific Information */}
                    {userDetails.role === 'farmer' && (
                        <div className="card">
                            <h3 className="mb-4">Farmer Details</h3>
                            <div className="grid gap-3">
                                <div className="flex justify-between">
                                    <span style={{ color: 'var(--gray-600)' }}>Farm Size:</span>
                                    <strong>{userDetails.farmSize || 'Not provided'}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span style={{ color: 'var(--gray-600)' }}>Primary Crops:</span>
                                    <strong>{userDetails.primaryCrops?.join(', ') || 'Not provided'}</strong>
                                </div>
                            </div>
                        </div>
                    )}

                    {userDetails.role === 'wholesaler' && (
                        <div className="card">
                            <h3 className="mb-4">Wholesaler Details</h3>
                            <div className="grid gap-3">
                                <div className="flex justify-between">
                                    <span style={{ color: 'var(--gray-600)' }}>Business Name:</span>
                                    <strong>{userDetails.businessName || 'Not provided'}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span style={{ color: 'var(--gray-600)' }}>Business Type:</span>
                                    <strong>{userDetails.businessType || 'Not provided'}</strong>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Activity Summary */}
                    <div className="card">
                        <h3 className="mb-4">Activity Summary</h3>
                        <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                            <div className="stat-card">
                                <div className="stat-value" style={{ fontSize: 'var(--font-size-3xl)' }}>
                                    {userDetails.stats?.totalCrops || 0}
                                </div>
                                <div className="stat-label">Crops Listed</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value" style={{ fontSize: 'var(--font-size-3xl)' }}>
                                    {userDetails.stats?.totalOrders || 0}
                                </div>
                                <div className="stat-label">Total Orders</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value" style={{ fontSize: 'var(--font-size-3xl)' }}>
                                    {userDetails.stats?.totalNegotiations || 0}
                                </div>
                                <div className="stat-label">Negotiations</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Account Info & Actions */}
                <div className="flex flex-col gap-6">
                    {/* Account Information */}
                    <div className="card">
                        <h3 className="mb-4">Account Information</h3>
                        <div className="grid gap-3">
                            <div>
                                <label style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>Registered On</label>
                                <p style={{ fontWeight: 600, marginTop: 'var(--spacing-1)' }}>
                                    {formatDateTime(userDetails.createdAt)}
                                </p>
                            </div>
                            <div>
                                <label style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>Last Updated</label>
                                <p style={{ fontWeight: 600, marginTop: 'var(--spacing-1)' }}>
                                    {formatDateTime(userDetails.updatedAt)}
                                </p>
                            </div>
                            <div>
                                <label style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>Verification Status</label>
                                <div style={{ marginTop: 'var(--spacing-1)' }}>
                                    <span className={`badge ${userDetails.isVerified ? 'badge-success' : 'badge-warning'}`}>
                                        {userDetails.isVerified ? 'Verified' : 'Pending'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Completion */}
                    <div className="card">
                        <h3 className="mb-4">Profile Completion</h3>
                        <div className="mb-3">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-2)' }}>
                                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                    Profile Completeness
                                </span>
                                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                                    {calculateProfileCompletion(userDetails)}%
                                </span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'var(--gray-200)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                                <div style={{ width: `${calculateProfileCompletion(userDetails)}%`, height: '100%', background: 'var(--gradient-primary)', transition: 'width var(--transition-base)' }}></div>
                            </div>
                        </div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                            {getMissingFields(userDetails).length > 0 ? (
                                <>
                                    <p style={{ marginBottom: 'var(--spacing-2)' }}>Missing information:</p>
                                    <ul style={{ paddingLeft: 'var(--spacing-4)' }}>
                                        {getMissingFields(userDetails).map((field, index) => (
                                            <li key={index}>{field}</li>
                                        ))}
                                    </ul>
                                </>
                            ) : (
                                <p>✓ Profile is complete</p>
                            )}
                        </div>
                    </div>

                    {/* Verification Actions */}
                    {!userDetails.isVerified && (
                        <div className="card" style={{ background: 'var(--gray-50)' }}>
                            <h3 className="mb-4">Verification Actions</h3>

                            <div className="form-group">
                                <label className="form-label">Verification Notes (Optional)</label>
                                <textarea
                                    className="form-textarea"
                                    placeholder="Add any notes about this verification..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows="4"
                                />
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    className="btn btn-primary"
                                    onClick={handleVerify}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Processing...' : '✓ Verify User'}
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={handleReject}
                                    disabled={submitting}
                                >
                                    ✗ Reject Verification
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Already Verified */}
                    {userDetails.isVerified && (
                        <div className="card" style={{ background: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid var(--success)' }}>
                            <h3 className="mb-3" style={{ color: 'var(--success)' }}>✓ Verified User</h3>
                            <p>This user has been verified and can access all platform features.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper function to calculate profile completion
const calculateProfileCompletion = (user) => {
    const fields = ['name', 'email', 'phone', 'address', 'region'];
    const filledFields = fields.filter(field => user[field]);
    return Math.round((filledFields.length / fields.length) * 100);
};

// Helper function to get missing fields
const getMissingFields = (user) => {
    const fieldLabels = {
        phone: 'Phone Number',
        address: 'Address',
        region: 'Location Details',
    };

    const missing = [];
    if (!user.phone) missing.push(fieldLabels.phone);
    if (!user.address) missing.push(fieldLabels.address);
    if (!user.region) missing.push(fieldLabels.region);

    return missing;
};

export default UserVerificationDetail;

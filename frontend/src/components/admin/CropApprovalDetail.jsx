import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { getCropImage, formatPrice, formatDateTime, getSeasonBadgeClass, qualityGrades } from '../../utils/cropData';

const CropApprovalDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [crop, setCrop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [qualityGrade, setQualityGrade] = useState('');
    const [comments, setComments] = useState('');

    useEffect(() => {
        loadCropDetails();
    }, [id]);

    const loadCropDetails = async () => {
        try {
            const response = await api.get(`/crops/${id}`);
            setCrop(response.data.data);
            setQualityGrade(response.data.data.qualityGrade || '');
        } catch (error) {
            toast.error('Failed to load crop details');
            navigate('/admin');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!qualityGrade) {
            toast.error('Please select a quality grade');
            return;
        }

        setSubmitting(true);
        try {
            await api.put(`/admin/crops/${id}/approve`, {
                qualityGrade,
                comments,
            });
            toast.success('Crop approved successfully!');
            navigate('/admin');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to approve crop');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async () => {
        const reason = window.prompt('Please provide a reason for rejection:');
        if (!reason) return;

        setSubmitting(true);
        try {
            await api.put(`/admin/crops/${id}/reject`, { reason });
            toast.success('Crop rejected');
            navigate('/admin');
        } catch (error) {
            toast.error('Failed to reject crop');
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

    if (!crop) {
        return (
            <div className="container mt-8">
                <div className="card text-center p-8">
                    <h3>Crop not found</h3>
                    <button className="btn btn-primary mt-4" onClick={() => navigate('/admin')}>
                        Back to Dashboard
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
                    <button className="btn btn-outline btn-sm mb-3" onClick={() => navigate('/admin')}>
                        ← Back to Dashboard
                    </button>
                    <h1>Crop Approval Review</h1>
                    <p style={{ color: 'var(--gray-600)' }}>
                        Review and approve crop listing
                    </p>
                </div>
                <span className={`badge ${crop.status === 'approved' ? 'badge-success' : 'status-pending'}`} style={{ fontSize: 'var(--font-size-base)', padding: 'var(--spacing-2) var(--spacing-4)' }}>
                    {crop.status}
                </span>
            </div>

            <div className="grid grid-cols-1 gap-6" style={{ gridTemplateColumns: '2fr 1fr' }}>
                {/* Left Column - Crop Details */}
                <div className="flex flex-col gap-6">
                    {/* Crop Images */}
                    <div className="card">
                        <h3 className="mb-4">Crop Images</h3>
                        <div className="image-gallery">
                            {crop.images && crop.images.length > 0 ? (
                                crop.images.map((image, index) => (
                                    <div key={index} className="gallery-image">
                                        <img src={image} alt={`${crop.name} ${index + 1}`} />
                                    </div>
                                ))
                            ) : (
                                <div className="gallery-image">
                                    <img src={getCropImage(crop.name)} alt={crop.name} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Crop Information */}
                    <div className="card">
                        <h3 className="mb-4">Crop Information</h3>
                        <div className="grid gap-4">
                            <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                <div>
                                    <label style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>Crop Name</label>
                                    <p style={{ fontWeight: 600, marginTop: 'var(--spacing-1)' }}>{crop.name}</p>
                                </div>
                                <div>
                                    <label style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>Category</label>
                                    <p style={{ fontWeight: 600, marginTop: 'var(--spacing-1)' }}>{crop.category}</p>
                                </div>
                            </div>

                            <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                <div>
                                    <label style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>Season</label>
                                    <div style={{ marginTop: 'var(--spacing-1)' }}>
                                        <span className={`badge ${getSeasonBadgeClass(crop.season)}`}>
                                            {crop.season}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>Expected Price</label>
                                    <p style={{ fontWeight: 600, color: 'var(--primary-green)', marginTop: 'var(--spacing-1)' }}>
                                        {formatPrice(crop.expectedPrice)}/quintal
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                <div>
                                    <label style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>Available Quantity</label>
                                    <p style={{ fontWeight: 600, marginTop: 'var(--spacing-1)' }}>
                                        {crop.quantity?.value} {crop.quantity?.unit}
                                    </p>
                                </div>
                                <div>
                                    <label style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>Minimum Order</label>
                                    <p style={{ fontWeight: 600, marginTop: 'var(--spacing-1)' }}>
                                        {crop.minimumOrder?.value} {crop.minimumOrder?.unit}
                                    </p>
                                </div>
                            </div>

                            {crop.description && (
                                <div>
                                    <label style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>Description</label>
                                    <p style={{ marginTop: 'var(--spacing-1)' }}>{crop.description}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Location Information */}
                    <div className="card">
                        <h3 className="mb-4">Location Details</h3>
                        <div className="grid gap-3">
                            <div className="flex justify-between">
                                <span style={{ color: 'var(--gray-600)' }}>State:</span>
                                <strong>{crop.location?.state}</strong>
                            </div>
                            <div className="flex justify-between">
                                <span style={{ color: 'var(--gray-600)' }}>District:</span>
                                <strong>{crop.location?.district}</strong>
                            </div>
                            {crop.location?.region && (
                                <div className="flex justify-between">
                                    <span style={{ color: 'var(--gray-600)' }}>Region:</span>
                                    <strong>{crop.location.region}</strong>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Farmer Info & Approval Actions */}
                <div className="flex flex-col gap-6">
                    {/* Farmer Information */}
                    <div className="card">
                        <h3 className="mb-4">Farmer Information</h3>
                        <div className="grid gap-3">
                            <div>
                                <label style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>Name</label>
                                <p style={{ fontWeight: 600, marginTop: 'var(--spacing-1)' }}>
                                    {crop.farmer?.name || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>Email</label>
                                <p style={{ marginTop: 'var(--spacing-1)' }}>
                                    {crop.farmer?.email || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>Phone</label>
                                <p style={{ marginTop: 'var(--spacing-1)' }}>
                                    {crop.farmer?.phone || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>Verification Status</label>
                                <div style={{ marginTop: 'var(--spacing-1)' }}>
                                    <span className={`badge ${crop.farmer?.isVerified ? 'badge-success' : 'badge-warning'}`}>
                                        {crop.farmer?.isVerified ? 'Verified' : 'Not Verified'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Listing Information */}
                    <div className="card">
                        <h3 className="mb-4">Listing Details</h3>
                        <div className="grid gap-3">
                            <div className="flex justify-between">
                                <span style={{ color: 'var(--gray-600)' }}>Listed On:</span>
                                <strong>{formatDateTime(crop.createdAt)}</strong>
                            </div>
                            <div className="flex justify-between">
                                <span style={{ color: 'var(--gray-600)' }}>Negotiable:</span>
                                <span className={`badge ${crop.isNegotiable ? 'badge-success' : 'badge-error'}`}>
                                    {crop.isNegotiable ? 'Yes' : 'No'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Approval Form */}
                    {crop.status === 'pending' && (
                        <div className="card" style={{ background: 'var(--gray-50)' }}>
                            <h3 className="mb-4">Approval Actions</h3>

                            <div className="form-group">
                                <label className="form-label">Quality Grade *</label>
                                <select
                                    className="form-select"
                                    value={qualityGrade}
                                    onChange={(e) => setQualityGrade(e.target.value)}
                                    required
                                >
                                    <option value="">Select Grade</option>
                                    {qualityGrades.map((grade) => (
                                        <option key={grade} value={grade}>
                                            {grade}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Comments (Optional)</label>
                                <textarea
                                    className="form-textarea"
                                    placeholder="Add any comments or notes..."
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    rows="4"
                                />
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    className="btn btn-primary"
                                    onClick={handleApprove}
                                    disabled={submitting || !qualityGrade}
                                >
                                    {submitting ? 'Processing...' : '✓ Approve Crop'}
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={handleReject}
                                    disabled={submitting}
                                >
                                    ✗ Reject Crop
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Already Approved/Rejected */}
                    {crop.status === 'approved' && (
                        <div className="card" style={{ background: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid var(--success)' }}>
                            <h3 className="mb-3" style={{ color: 'var(--success)' }}>✓ Approved</h3>
                            <p>This crop has been approved and is now live on the marketplace.</p>
                            {crop.qualityGrade && (
                                <p style={{ marginTop: 'var(--spacing-2)' }}>
                                    <strong>Quality Grade:</strong> {crop.qualityGrade}
                                </p>
                            )}
                        </div>
                    )}

                    {crop.status === 'rejected' && (
                        <div className="card" style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--error)' }}>
                            <h3 className="mb-3" style={{ color: 'var(--error)' }}>✗ Rejected</h3>
                            <p>This crop listing has been rejected.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CropApprovalDetail;

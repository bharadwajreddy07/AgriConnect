import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
    FaBox,
    FaTruck,
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaStar,
} from 'react-icons/fa';
import api from '../../services/api';
import { formatPrice } from '../../utils/cartUtils';

const WholesalerSamples = () => {
    const [samples, setSamples] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedSample, setSelectedSample] = useState(null);
    const [showEvaluationModal, setShowEvaluationModal] = useState(false);
    const [evaluation, setEvaluation] = useState({
        qualityRating: 5,
        evaluationNotes: '',
    });

    useEffect(() => {
        loadSamples();
    }, []);

    const loadSamples = async () => {
        try {
            setLoading(true);
            const response = await api.get('/samples/wholesaler');
            setSamples(response.data.data || []);
        } catch (error) {
            console.error('Error loading samples:', error);
            toast.error('Failed to load sample requests');
        } finally {
            setLoading(false);
        }
    };

    const handleEvaluate = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/samples/${selectedSample._id}/evaluate`, evaluation);
            toast.success('Sample evaluated successfully!');
            setShowEvaluationModal(false);
            setEvaluation({ qualityRating: 5, evaluationNotes: '' });
            loadSamples();
        } catch (error) {
            console.error('Error evaluating sample:', error);
            toast.error('Failed to submit evaluation');
        }
    };

    const handleMarkReceived = async (sampleId) => {
        try {
            await api.put(`/samples/${sampleId}/status`, { status: 'received' });
            toast.success('Sample marked as received');
            loadSamples();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'evaluated':
                return <FaCheckCircle style={{ color: 'var(--success)' }} />;
            case 'received':
                return <FaTruck style={{ color: 'var(--primary-green)' }} />;
            case 'sent':
                return <FaTruck style={{ color: 'var(--primary-blue)' }} />;
            case 'rejected':
                return <FaTimesCircle style={{ color: 'var(--error)' }} />;
            default:
                return <FaClock style={{ color: 'var(--warning)' }} />;
        }
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'evaluated':
                return 'var(--success)';
            case 'received':
            case 'sent':
                return 'var(--primary-green)';
            case 'rejected':
                return 'var(--error)';
            default:
                return 'var(--warning)';
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const filteredSamples = samples.filter(sample => {
        if (filter === 'all') return true;
        if (filter === 'pending') return ['requested', 'accepted'].includes(sample.status);
        if (filter === 'in_transit') return sample.status === 'sent';
        if (filter === 'received') return sample.status === 'received';
        if (filter === 'evaluated') return sample.status === 'evaluated';
        return true;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: '80vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', minHeight: '100vh', paddingTop: 'var(--spacing-8)', paddingBottom: 'var(--spacing-12)' }}>
            <div className="container">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="gradient-text">Sample Requests</h1>
                    <p style={{ color: 'var(--gray-600)' }}>
                        {samples.length} {samples.length === 1 ? 'request' : 'requests'} total
                    </p>
                </div>

                {/* Filters */}
                <div className="card-premium mb-6">
                    <div className="flex gap-2">
                        {['all', 'pending', 'in_transit', 'received', 'evaluated'].map((filterOption) => (
                            <button
                                key={filterOption}
                                onClick={() => setFilter(filterOption)}
                                className={`btn ${filter === filterOption ? 'btn-primary' : 'btn-outline'}`}
                                style={{ textTransform: 'capitalize' }}
                            >
                                {filterOption.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Samples List */}
                {filteredSamples.length === 0 ? (
                    <div className="card-premium text-center" style={{ padding: 'var(--spacing-12)' }}>
                        <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-4)' }}>📦</div>
                        <h3>No sample requests found</h3>
                        <p style={{ color: 'var(--gray-600)' }}>
                            {filter === 'all' ? 'You haven\'t requested any samples yet' : 'No samples in this category'}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredSamples.map((sample) => (
                            <div key={sample._id} className="card-premium">
                                <div className="flex gap-4">
                                    {/* Crop Image */}
                                    <div
                                        style={{
                                            width: '120px',
                                            height: '120px',
                                            borderRadius: 'var(--radius-lg)',
                                            overflow: 'hidden',
                                            flexShrink: 0,
                                        }}
                                    >
                                        <img
                                            src={sample.crop?.images?.[0] || '/placeholder.jpg'}
                                            alt={sample.crop?.name}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                            }}
                                        />
                                    </div>

                                    {/* Details */}
                                    <div style={{ flex: 1 }}>
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 0 }}>
                                                        {sample.crop?.name}
                                                    </h3>
                                                    <span
                                                        className="badge"
                                                        style={{
                                                            background: getStatusBadgeColor(sample.status),
                                                            color: 'white',
                                                        }}
                                                    >
                                                        {getStatusIcon(sample.status)} {sample.status}
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                                    Requested on {formatDate(sample.createdAt)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Farmer Info */}
                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                            <div style={{ padding: 'var(--spacing-2)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-1)' }}>
                                                    Farmer
                                                </p>
                                                <p style={{ fontWeight: 600 }}>{sample.farmer?.name}</p>
                                            </div>
                                            <div style={{ padding: 'var(--spacing-2)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-1)' }}>
                                                    Quantity
                                                </p>
                                                <p style={{ fontWeight: 600 }}>
                                                    {sample.requestedQuantity.value} {sample.requestedQuantity.unit}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Tracking Info */}
                                        {sample.trackingInfo?.trackingNumber && (
                                            <div style={{ marginBottom: 'var(--spacing-3)', padding: 'var(--spacing-2)', background: 'var(--blue-50)', borderRadius: 'var(--radius-md)' }}>
                                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                                                    Tracking: {sample.trackingInfo.courierName} - {sample.trackingInfo.trackingNumber}
                                                </p>
                                            </div>
                                        )}

                                        {/* Evaluation */}
                                        {sample.status === 'evaluated' && sample.qualityRating && (
                                            <div style={{ marginBottom: 'var(--spacing-3)', padding: 'var(--spacing-2)', background: 'var(--green-50)', borderRadius: 'var(--radius-md)' }}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                                                        Your Rating:
                                                    </p>
                                                    <div className="flex gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <FaStar
                                                                key={i}
                                                                style={{
                                                                    color: i < sample.qualityRating ? 'var(--warning)' : 'var(--gray-300)',
                                                                    fontSize: 'var(--font-size-sm)',
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                {sample.evaluationNotes && (
                                                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-700)' }}>
                                                        {sample.evaluationNotes}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            {sample.status === 'sent' && (
                                                <button
                                                    onClick={() => handleMarkReceived(sample._id)}
                                                    className="btn btn-primary btn-sm"
                                                >
                                                    Mark as Received
                                                </button>
                                            )}
                                            {sample.status === 'received' && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedSample(sample);
                                                        setShowEvaluationModal(true);
                                                    }}
                                                    className="btn btn-primary btn-sm"
                                                >
                                                    Evaluate Sample
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Evaluation Modal */}
                {showEvaluationModal && selectedSample && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                        }}
                        onClick={() => setShowEvaluationModal(false)}
                    >
                        <div
                            className="card-premium"
                            style={{ maxWidth: '500px', width: '90%' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 style={{ marginBottom: 'var(--spacing-4)' }}>Evaluate Sample</h2>
                            <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--spacing-4)' }}>
                                {selectedSample.crop?.name} from {selectedSample.farmer?.name}
                            </p>

                            <form onSubmit={handleEvaluate}>
                                <div className="form-group">
                                    <label className="form-label">Quality Rating *</label>
                                    <div className="flex gap-2 mb-2">
                                        {[1, 2, 3, 4, 5].map((rating) => (
                                            <button
                                                key={rating}
                                                type="button"
                                                onClick={() => setEvaluation({ ...evaluation, qualityRating: rating })}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    fontSize: 'var(--font-size-2xl)',
                                                }}
                                            >
                                                <FaStar
                                                    style={{
                                                        color: rating <= evaluation.qualityRating ? 'var(--warning)' : 'var(--gray-300)',
                                                    }}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Evaluation Notes</label>
                                    <textarea
                                        className="form-textarea"
                                        rows="4"
                                        placeholder="Share your thoughts on the sample quality..."
                                        value={evaluation.evaluationNotes}
                                        onChange={(e) => setEvaluation({ ...evaluation, evaluationNotes: e.target.value })}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button type="submit" className="btn btn-primary flex-1">
                                        Submit Evaluation
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowEvaluationModal(false)}
                                        className="btn btn-outline flex-1"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WholesalerSamples;

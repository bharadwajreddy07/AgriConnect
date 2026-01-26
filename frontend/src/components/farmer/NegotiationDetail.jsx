import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { getCropImage, formatPrice, formatDateTime, getSeasonBadgeClass, getStatusBadgeClass } from '../../utils/cropData';
import ChatBox from '../shared/ChatBox';

const NegotiationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [negotiation, setNegotiation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [counterOffer, setCounterOffer] = useState('');
    const [counterMessage, setCounterMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadNegotiation();
    }, [id]);

    const loadNegotiation = async () => {
        try {
            const response = await api.get(`/negotiations/${id}`);
            setNegotiation(response.data.data);
        } catch (error) {
            toast.error('Failed to load negotiation details');
            navigate('/farmer/negotiations');
        } finally {
            setLoading(false);
        }
    };

    const handleCounterOffer = async (e) => {
        e.preventDefault();

        if (!counterOffer || parseFloat(counterOffer) <= 0) {
            toast.error('Please enter a valid offer amount');
            return;
        }

        setSubmitting(true);
        try {
            await api.post(`/negotiations/${id}/offer`, {
                amount: parseFloat(counterOffer),
                quantity: negotiation.agreedQuantity,
                message: counterMessage,
            });

            toast.success('Counter-offer sent successfully!');
            setCounterOffer('');
            setCounterMessage('');
            loadNegotiation();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send counter-offer');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAccept = async () => {
        if (!window.confirm('Are you sure you want to accept this offer?')) return;

        try {
            await api.put(`/negotiations/${id}/accept`);
            toast.success('Offer accepted! Negotiation completed.');
            loadNegotiation();
        } catch (error) {
            toast.error('Failed to accept offer');
        }
    };

    const handleReject = async () => {
        const reason = window.prompt('Please provide a reason for rejection (optional):');

        try {
            await api.put(`/negotiations/${id}/reject`, { reason: reason || 'Not acceptable' });
            toast.success('Offer rejected');
            loadNegotiation();
        } catch (error) {
            toast.error('Failed to reject offer');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: '80vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!negotiation) {
        return (
            <div className="container mt-8">
                <div className="card text-center p-8">
                    <h3>Negotiation not found</h3>
                    <button className="btn btn-primary mt-4" onClick={() => navigate('/farmer/negotiations')}>
                        Back to Negotiations
                    </button>
                </div>
            </div>
        );
    }

    const crop = negotiation.crop;
    const wholesaler = negotiation.wholesaler;
    const isOngoing = negotiation.status === 'ongoing';
    const canRespond = isOngoing && negotiation.currentOffer?.offeredBy === 'wholesaler';

    return (
        <div className="container" style={{ marginTop: 'var(--spacing-8)', marginBottom: 'var(--spacing-8)' }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <button className="btn btn-outline btn-sm mb-3" onClick={() => navigate('/farmer/negotiations')}>
                        ← Back to Negotiations
                    </button>
                    <h1>Negotiation Details</h1>
                    <p style={{ color: 'var(--gray-600)' }}>
                        Negotiating with <strong>{wholesaler?.name}</strong>
                    </p>
                </div>
                <span className={`badge ${getStatusBadgeClass(negotiation.status)}`} style={{ fontSize: 'var(--font-size-base)', padding: 'var(--spacing-2) var(--spacing-4)' }}>
                    {negotiation.status}
                </span>
            </div>

            <div className="grid grid-cols-1 gap-6" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {/* Left Column - Crop & Negotiation Details */}
                <div className="flex flex-col gap-6">
                    {/* Crop Information */}
                    <div className="card">
                        <h3 className="mb-4">Crop Details</h3>
                        <div className="mb-4">
                            <img
                                src={getCropImage(crop?.name)}
                                alt={crop?.name}
                                className="img-cover img-rounded"
                                style={{ width: '100%', height: '250px' }}
                            />
                        </div>
                        <div className="grid gap-3">
                            <div className="flex justify-between">
                                <span style={{ color: 'var(--gray-600)' }}>Crop Name:</span>
                                <strong>{crop?.name}</strong>
                            </div>
                            <div className="flex justify-between">
                                <span style={{ color: 'var(--gray-600)' }}>Category:</span>
                                <strong>{crop?.category}</strong>
                            </div>
                            <div className="flex justify-between">
                                <span style={{ color: 'var(--gray-600)' }}>Season:</span>
                                <span className={`badge ${getSeasonBadgeClass(crop?.season)}`}>
                                    {crop?.season}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span style={{ color: 'var(--gray-600)' }}>Your Expected Price:</span>
                                <strong style={{ color: 'var(--primary-green)' }}>
                                    {formatPrice(crop?.expectedPrice)}/quintal
                                </strong>
                            </div>
                        </div>
                    </div>

                    {/* Wholesaler Information */}
                    <div className="card">
                        <h3 className="mb-4">Wholesaler Information</h3>
                        <div className="grid gap-3">
                            <div className="flex justify-between">
                                <span style={{ color: 'var(--gray-600)' }}>Name:</span>
                                <strong>{wholesaler?.name}</strong>
                            </div>
                            <div className="flex justify-between">
                                <span style={{ color: 'var(--gray-600)' }}>Email:</span>
                                <strong>{wholesaler?.email}</strong>
                            </div>
                            <div className="flex justify-between">
                                <span style={{ color: 'var(--gray-600)' }}>Phone:</span>
                                <strong>{wholesaler?.phone}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Current Offer */}
                    {negotiation.currentOffer ? (
                        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))' }}>
                            <h3 className="mb-4">Current Offer</h3>
                            <div className="text-center">
                                <div style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 700, color: 'var(--primary-green)', marginBottom: 'var(--spacing-2)' }}>
                                    {formatPrice(negotiation.currentOffer.amount || 0)}
                                </div>
                                <p style={{ color: 'var(--gray-600)' }}>
                                    per quintal • Offered by {negotiation.currentOffer.offeredBy === 'farmer' ? 'You' : wholesaler?.name}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="card">
                            <h3 className="mb-4">Current Offer</h3>
                            <p>No active offer.</p>
                        </div>
                    )}

                    {/* Counter Offer Form */}
                    {canRespond && (
                        <div className="card">
                            <h3 className="mb-4">Make Counter Offer</h3>
                            <form onSubmit={handleCounterOffer}>
                                <div className="form-group">
                                    <label className="form-label">Your Counter Offer (₹/quintal)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="Enter your price"
                                        value={counterOffer}
                                        onChange={(e) => setCounterOffer(e.target.value)}
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Message (Optional)</label>
                                    <textarea
                                        className="form-textarea"
                                        placeholder="Add a message to your counter-offer..."
                                        value={counterMessage}
                                        onChange={(e) => setCounterMessage(e.target.value)}
                                        rows="3"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <button type="submit" className="btn btn-primary flex-1" disabled={submitting}>
                                        {submitting ? 'Sending...' : 'Send Counter Offer'}
                                    </button>
                                </div>
                            </form>

                            <div className="divider"></div>

                            <div className="flex gap-4">
                                <button className="btn btn-primary flex-1" onClick={handleAccept}>
                                    ✓ Accept Current Offer
                                </button>
                                <button className="btn btn-danger flex-1" onClick={handleReject}>
                                    ✗ Reject Offer
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Accepted Offer */}
                    {negotiation.status === 'accepted' && (
                        <div className="card" style={{ background: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid var(--success)' }}>
                            <h3 className="mb-3" style={{ color: 'var(--success)' }}>✓ Negotiation Accepted</h3>
                            <div className="grid gap-2">
                                <p><strong>Final Agreed Price:</strong> {formatPrice(negotiation.finalAgreedPrice)}/quintal</p>
                                <p><strong>Total Amount:</strong> {formatPrice(negotiation.totalAmount)}</p>
                                <p><strong>Accepted on:</strong> {formatDateTime(negotiation.acceptedAt)}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Offer History & Chat */}
                <div className="flex flex-col gap-6">
                    {/* Offer History Timeline */}
                    <div className="card">
                        <h3 className="mb-4">Offer History</h3>
                        <div className="negotiation-timeline">
                            {negotiation.offerHistory?.map((offer, index) => (
                                <div key={index} className={`timeline-item ${offer.offeredBy}`}>
                                    <div className="timeline-dot"></div>
                                    <div className="timeline-content">
                                        <div className="timeline-header">
                                            <span className="timeline-user">
                                                {offer.offeredBy === 'farmer' ? 'You' : wholesaler?.name}
                                            </span>
                                            <span className="timeline-time">
                                                {formatDateTime(offer.timestamp)}
                                            </span>
                                        </div>
                                        <div className="timeline-offer">
                                            {formatPrice(offer.amount)}/quintal
                                        </div>
                                        {offer.message && (
                                            <div className="timeline-message">
                                                "{offer.message}"
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chat Component */}
                    <ChatBox negotiationId={id} currentUser={user} />
                </div>
            </div>
        </div>
    );
};

export default NegotiationDetail;

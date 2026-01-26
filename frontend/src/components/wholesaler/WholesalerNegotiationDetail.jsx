import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { getCropImage, formatPrice, formatDateTime, getSeasonBadgeClass, getStatusBadgeClass } from '../../utils/cropData';
import ChatBox from '../shared/ChatBox';

const WholesalerNegotiationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [negotiation, setNegotiation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [offerAmount, setOfferAmount] = useState('');
    const [offerMessage, setOfferMessage] = useState('');
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
            navigate('/wholesaler/negotiations');
        } finally {
            setLoading(false);
        }
    };

    const handleMakeOffer = async (e) => {
        e.preventDefault();

        if (!offerAmount || parseFloat(offerAmount) <= 0) {
            toast.error('Please enter a valid offer amount');
            return;
        }

        console.log('Sending Offer:', {
            amount: parseFloat(offerAmount),
            quantity: currentQuantity,
            message: offerMessage
        });

        setSubmitting(true);
        try {
            await api.post(`/negotiations/${id}/offer`, {
                amount: parseFloat(offerAmount),
                quantity: currentQuantity,
                message: offerMessage,
            });

            toast.success('Offer sent successfully!');
            setOfferAmount('');
            setOfferMessage('');
            loadNegotiation();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send offer');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelNegotiation = async () => {
        if (!window.confirm('Are you sure you want to cancel this negotiation?')) return;

        try {
            await api.put(`/negotiations/${id}/reject`, { reason: 'Cancelled by wholesaler' });
            toast.success('Negotiation cancelled');
            navigate('/wholesaler/negotiations');
        } catch (error) {
            toast.error('Failed to cancel negotiation');
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
            <div className="container flex items-center justify-center" style={{ minHeight: '60vh' }}>
                <div className="text-center">
                    <h2>Negotiation Not Found</h2>
                    <p className="text-gray-600 mb-4">The negotiation you are looking for does not exist or you do not have permission to view it.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/wholesaler/negotiations')}>
                        Back to Negotiations
                    </button>
                </div>
            </div>
        );
    }

    const crop = negotiation.crop;
    const farmer = negotiation.farmer;

    // Debug Log
    console.log('Rendering Negotiation:', negotiation);

    if (!crop) {
        return (
            <div className="container text-center py-10">
                <h2>Crop Data Unavailable</h2>
                <p>The crop associated with this negotiation has been removed.</p>
                <button className="btn btn-primary" onClick={() => navigate('/wholesaler/negotiations')}>Back</button>
            </div>
        );
    }

    if (!farmer) {
        return (
            <div className="container text-center py-10">
                <h2>Farmer Data Unavailable</h2>
                <p>The farmer associated with this negotiation is no longer active.</p>
                <button className="btn btn-primary" onClick={() => navigate('/wholesaler/negotiations')}>Back</button>
            </div>
        );
    }

    const isOngoing = negotiation.status === 'ongoing';
    const canRespond = isOngoing && negotiation.currentOffer?.offeredBy === 'farmer';

    // Get the quantity from current offer or crop default
    const currentQuantity = negotiation.currentOffer?.quantity || crop?.quantity || { value: 0, unit: 'units' };

    return (
        <div className="container" style={{ marginTop: 'var(--spacing-8)', marginBottom: 'var(--spacing-8)' }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <button className="btn btn-outline btn-sm mb-3" onClick={() => navigate('/wholesaler/negotiations')}>
                        ← Back to Negotiations
                    </button>
                    <h1>Negotiation Details</h1>
                    <p style={{ color: 'var(--gray-600)' }}>
                        Negotiating with <strong>{farmer?.name}</strong>
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
                                src={getCropImage(crop?.name) || '/placeholder.jpg'}
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
                            {crop?.qualityGrade && (
                                <div className="flex justify-between">
                                    <span style={{ color: 'var(--gray-600)' }}>Quality Grade:</span>
                                    <span className="badge badge-success">{crop.qualityGrade}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Farmer Information */}
                    <div className="card">
                        <h3 className="mb-4">Farmer Information</h3>
                        <div className="grid gap-3">
                            <div className="flex justify-between">
                                <span style={{ color: 'var(--gray-600)' }}>Name:</span>
                                <strong>{farmer?.name}</strong>
                            </div>
                            <div className="flex justify-between">
                                <span style={{ color: 'var(--gray-600)' }}>Email:</span>
                                <strong>{farmer?.email}</strong>
                            </div>
                            <div className="flex justify-between">
                                <span style={{ color: 'var(--gray-600)' }}>Phone:</span>
                                <strong>{farmer?.phone}</strong>
                            </div>
                            {farmer?.address && (
                                <div>
                                    <span style={{ color: 'var(--gray-600)' }}>Address:</span>
                                    <p style={{ marginTop: 'var(--spacing-1)' }}>{farmer.address}</p>
                                </div>
                            )}
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
                                    per quintal • Offered by {negotiation.currentOffer.offeredBy === 'wholesaler' ? 'You' : farmer?.name}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="card">
                            <h3 className="mb-4">Current Offer</h3>
                            <p>No active offer.</p>
                        </div>
                    )}

                    {/* Make Offer Form */}
                    {isOngoing && (
                        <div className="card">
                            <h3 className="mb-4">Make Your Offer</h3>
                            <form onSubmit={handleMakeOffer}>
                                <div className="form-group">
                                    <label className="form-label">Your Offer (₹/quintal)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="Enter your price"
                                        value={offerAmount}
                                        onChange={(e) => setOfferAmount(e.target.value)}
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)', marginTop: 'var(--spacing-1)' }}>
                                        Farmer's expected price: {formatPrice(crop?.expectedPrice)}/quintal
                                    </p>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Message (Optional)</label>
                                    <textarea
                                        className="form-textarea"
                                        placeholder="Add a message with your offer..."
                                        value={offerMessage}
                                        onChange={(e) => setOfferMessage(e.target.value)}
                                        rows="3"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <button type="submit" className="btn btn-primary flex-1" disabled={submitting}>
                                        {submitting ? 'Sending...' : 'Send Offer'}
                                    </button>
                                    <button type="button" className="btn btn-danger" onClick={handleCancelNegotiation}>
                                        Cancel Negotiation
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Accepted Offer */}
                    {negotiation.status === 'accepted' && (
                        <div className="card" style={{ background: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid var(--success)' }}>
                            <h3 className="mb-3" style={{ color: 'var(--success)' }}>✓ Negotiation Accepted</h3>
                            <div className="grid gap-2">
                                <p><strong>Final Agreed Price:</strong> {formatPrice(negotiation.finalAgreedPrice)}/quintal</p>
                                <p><strong>Quantity:</strong> {negotiation.agreedQuantity?.value} {negotiation.agreedQuantity?.unit}</p>
                                <p><strong>Total Amount:</strong> {formatPrice(negotiation.totalAmount)}</p>
                                <p><strong>Accepted on:</strong> {formatDateTime(negotiation.acceptedAt)}</p>
                            </div>
                            <button className="btn btn-primary mt-4" onClick={() => navigate('/wholesaler/orders')}>
                                View Orders →
                            </button>
                        </div>
                    )}

                    {/* Rejected */}
                    {negotiation.status === 'rejected' && (
                        <div className="card" style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--error)' }}>
                            <h3 className="mb-3" style={{ color: 'var(--error)' }}>✗ Negotiation Rejected</h3>
                            <p>This negotiation has been rejected and is now closed.</p>
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
                                                {offer.offeredBy === 'wholesaler' ? 'You' : farmer?.name}
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

export default WholesalerNegotiationDetail;

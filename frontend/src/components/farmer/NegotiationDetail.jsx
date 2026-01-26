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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--spacing-6)' }}>
                {/* Left Column - Crop & Details (Compact) */}
                <div className="flex flex-col gap-6">
                    {/* Crop Information - Compact */}
                    <div className="card">
                        <div className="flex items-start gap-4 mb-4">
                            <img
                                src={getCropImage(crop?.name)}
                                alt={crop?.name}
                                className="img-rounded"
                                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                            />
                            <div>
                                <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-1)' }}>{crop?.name}</h3>
                                <span className={`badge ${getSeasonBadgeClass(crop?.season)}`}>
                                    {crop?.season}
                                </span>
                            </div>
                        </div>

                        <div className="grid gap-2 text-sm">
                            <div className="flex justify-between">
                                <span style={{ color: 'var(--gray-600)' }}>Category:</span>
                                <strong>{crop?.category}</strong>
                            </div>
                            <div className="flex justify-between">
                                <span style={{ color: 'var(--gray-600)' }}>Expected Price:</span>
                                <strong>{formatPrice(crop?.expectedPrice)}</strong>
                            </div>
                        </div>

                        <div className="divider" style={{ margin: 'var(--spacing-4) 0' }}></div>

                        {/* Wholesaler Info */}
                        <div className="grid gap-2 text-sm">
                            <p style={{ color: 'var(--gray-600)', fontWeight: 600 }}>Wholesaler:</p>
                            <div className="flex justify-between">
                                <span>Name:</span>
                                <strong>{wholesaler?.name}</strong>
                            </div>
                            <div className="flex justify-between">
                                <span>Phone:</span>
                                <strong>{wholesaler?.phone}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Current Offer Status - Compact */}
                    {negotiation.currentOffer ? (
                        <div className="card" style={{ background: 'var(--gray-50)', textAlign: 'center' }}>
                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-1)' }}>Current Offer</p>
                            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--primary-green)' }}>
                                {formatPrice(negotiation.currentOffer.amount || 0)}
                            </div>
                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>
                                by {negotiation.currentOffer.offeredBy === 'farmer' ? 'You' : wholesaler?.name}
                            </p>
                        </div>
                    ) : (
                        <div className="card text-center p-4">
                            <p className="text-gray-500">No active offer</p>
                        </div>
                    )}
                </div>

                {/* Right Column - Chat & Actions (Prominent) */}
                <div className="flex flex-col gap-6" style={{ height: 'calc(100vh - 140px)', minHeight: '600px' }}>

                    {/* Waiting Message - NOW AT TOP */}
                    {isOngoing && !canRespond && (
                        <div className="card bg-gray-50 border-gray-200 text-center py-4" style={{ borderLeft: '4px solid var(--warning)' }}>
                            <div className="flex items-center justify-center gap-3">
                                <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
                                <span className="font-semibold text-gray-700">Waiting for {wholesaler?.name} to respond...</span>
                            </div>
                        </div>
                    )}

                    {/* Active Negotiation Area */}
                    <div className="card flex-1 flex flex-col p-0" style={{ overflow: 'hidden' }}>
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <h3 style={{ fontSize: 'var(--font-size-md)' }}>Negotiation Chat</h3>
                            {isOngoing && !canRespond && (
                                <span className="badge badge-warning text-xs">Waiting</span>
                            )}
                            {isOngoing && canRespond && (
                                <span className="badge badge-success text-xs">Your Turn</span>
                            )}
                        </div>

                        <div className="flex-1" style={{ position: 'relative', overflow: 'hidden' }}>
                            <ChatBox negotiationId={id} currentUser={user} />
                        </div>
                    </div>

                    {/* Counter Offer Form - Fixed at bottom */}
                    {canRespond && (
                        <div className="card bg-green-50 border-green-200">
                            <h3 className="mb-3 text-sm font-semibold text-green-800">Make Counter Offer / Action</h3>
                            <div className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <label className="form-label text-xs">Counter Price (₹)</label>
                                    <input
                                        type="number"
                                        className="form-input form-input-sm"
                                        placeholder="Amount"
                                        value={counterOffer}
                                        onChange={(e) => setCounterOffer(e.target.value)}
                                    />
                                </div>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleCounterOffer}
                                    disabled={submitting}
                                >
                                    Send Offer
                                </button>
                                <button className="btn btn-success" onClick={handleAccept}>
                                    Accept
                                </button>
                                <button className="btn btn-danger btn-outline" onClick={handleReject}>
                                    Reject
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NegotiationDetail;

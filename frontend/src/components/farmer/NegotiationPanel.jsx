import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { getStatusBadgeClass, formatPrice, formatDateTime, getCropImage } from '../../utils/cropData';

const NegotiationPanel = () => {
    const navigate = useNavigate();
    const [negotiations, setNegotiations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNegotiations();
    }, []);

    const loadNegotiations = async () => {
        try {
            const response = await api.get('/negotiations');
            setNegotiations(response.data.data || []);
        } catch (error) {
            toast.error('Failed to load negotiations');
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (negotiationId, e) => {
        e.stopPropagation();
        try {
            await api.put(`/negotiations/${negotiationId}/accept`);
            toast.success('Offer accepted successfully!');
            loadNegotiations();
        } catch (error) {
            toast.error('Failed to accept offer');
        }
    };

    const handleReject = async (negotiationId, e) => {
        e.stopPropagation();
        try {
            await api.put(`/negotiations/${negotiationId}/reject`, {
                reason: 'Price not acceptable',
            });
            toast.success('Offer rejected');
            loadNegotiations();
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

    return (
        <div className="container" style={{ marginTop: 'var(--spacing-8)', marginBottom: 'var(--spacing-8)' }}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1>Price Negotiations</h1>
                    <p style={{ color: 'var(--gray-600)' }}>Manage your ongoing price negotiations</p>
                </div>
                <span className="badge badge-info" style={{ fontSize: 'var(--font-size-lg)', padding: 'var(--spacing-3) var(--spacing-5)' }}>
                    {negotiations.length} Active
                </span>
            </div>

            {negotiations.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">💬</div>
                    <h3 className="empty-state-title">No Active Negotiations</h3>
                    <p className="empty-state-description">
                        Wholesalers will initiate negotiations when they're interested in your crops
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {negotiations.map((negotiation) => {
                        const unreadCount = negotiation.unreadMessages || 0;
                        const isOngoing = negotiation.status === 'ongoing';

                        return (
                            <div
                                key={negotiation._id}
                                className="card hover-lift"
                                style={{ cursor: 'pointer', position: 'relative' }}
                                onClick={() => navigate(`/farmer/negotiations/${negotiation._id}`)}
                            >
                                {/* Unread Badge */}
                                {unreadCount > 0 && (
                                    <span
                                        className="animate-pulse"
                                        style={{
                                            position: 'absolute',
                                            top: 'var(--spacing-4)',
                                            right: 'var(--spacing-4)',
                                            background: 'var(--error)',
                                            color: 'white',
                                            borderRadius: 'var(--radius-full)',
                                            padding: 'var(--spacing-1) var(--spacing-3)',
                                            fontSize: 'var(--font-size-xs)',
                                            fontWeight: 700,
                                            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
                                        }}
                                    >
                                        {unreadCount} new message{unreadCount > 1 ? 's' : ''}
                                    </span>
                                )}

                                <div className="flex gap-4 mb-4">
                                    {/* Crop Image */}
                                    <img
                                        src={getCropImage(negotiation.crop?.name)}
                                        alt={negotiation.crop?.name}
                                        style={{
                                            width: '100px',
                                            height: '100px',
                                            borderRadius: 'var(--radius-lg)',
                                            objectFit: 'cover'
                                        }}
                                    />

                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3>{negotiation.crop?.name}</h3>
                                                <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>
                                                    Negotiating with: <strong>{negotiation.wholesaler?.name}</strong>
                                                </p>
                                            </div>
                                            <span className={`badge ${getStatusBadgeClass(negotiation.status)}`}>
                                                {negotiation.status}
                                            </span>
                                        </div>

                                        <div className="grid gap-2" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginTop: 'var(--spacing-3)' }}>
                                            <div>
                                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>Your Price</p>
                                                <p style={{ fontWeight: 600, color: 'var(--primary-green)' }}>
                                                    {formatPrice(negotiation.initialPrice)}
                                                </p>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>Current Offer</p>
                                                <p style={{ fontWeight: 600, color: 'var(--secondary-gold)' }}>
                                                    {negotiation.currentOffer ? formatPrice(negotiation.currentOffer.amount) : 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>Offers</p>
                                                <p style={{ fontWeight: 600 }}>
                                                    {negotiation.offerHistory?.length || 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="divider"></div>

                                <div className="flex gap-3 mt-4">
                                    {isOngoing && negotiation.currentOffer?.offeredBy === 'wholesaler' && (
                                        <>
                                            <button
                                                className="btn btn-primary flex-1"
                                                onClick={(e) => handleAccept(negotiation._id, e)}
                                            >
                                                ✓ Accept Offer
                                            </button>
                                            <button
                                                className="btn btn-danger flex-1"
                                                onClick={(e) => handleReject(negotiation._id, e)}
                                            >
                                                ✗ Reject
                                            </button>
                                        </>
                                    )}
                                    <button
                                        className="btn btn-outline flex-1"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/farmer/negotiations/${negotiation._id}`);
                                        }}
                                    >
                                        View Details & Chat →
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default NegotiationPanel;

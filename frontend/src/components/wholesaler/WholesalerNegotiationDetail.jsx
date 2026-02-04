import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { useWholesalerCart } from '../../context/WholesalerCartContext';
import { getCropImage, formatPrice, formatDateTime, getSeasonBadgeClass, getStatusBadgeClass } from '../../utils/cropData';
import ChatBox from '../shared/ChatBox';

const WholesalerNegotiationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { addNegotiationToCart } = useWholesalerCart();
    const [negotiation, setNegotiation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [offerAmount, setOfferAmount] = useState('');
    const [offerMessage, setOfferMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showCartOptions, setShowCartOptions] = useState(false);

    useEffect(() => {
        loadNegotiation();
        const interval = setInterval(loadNegotiation, 5000);
        return () => clearInterval(interval);
    }, [id]);

    const loadNegotiation = async () => {
        try {
            const response = await api.get(`/negotiations/${id}`);
            setNegotiation(response.data.data);
        } catch (error) {
            console.error('Error loading negotiation:', error);
            // Don't redirect immediately so user can see what happened, just stop loading
            setNegotiation(null);
        } finally {
            setLoading(false);
        }
    };

    // Get the quantity from current offer or crop default - MOVED HERE BEFORE USAGE
    const currentQuantity = negotiation?.currentOffer?.quantity || negotiation?.crop?.quantity || { value: 1, unit: 'quintal' };

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

    const handleAddToCart = () => {
        if (negotiation.status !== 'accepted') {
            toast.error('Negotiation must be accepted before adding to cart');
            return;
        }

        addNegotiationToCart(negotiation);
        toast.success('Added to cart! You can continue shopping or checkout.');
        setShowCartOptions(true);
    };

    const handleCheckoutNow = async () => {
        if (negotiation.status !== 'accepted') {
            toast.error('Negotiation must be accepted before checkout');
            return;
        }

        addNegotiationToCart(negotiation);
        navigate('/wholesaler/cart');
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
                    {typeof negotiation.status === 'string' ? negotiation.status : String(negotiation.status || 'ongoing')}
                </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--spacing-6)' }}>
                {/* Left Column - Crop & Details (Compact) */}
                <div className="flex flex-col gap-6">
                    {/* Crop Information - Compact */}
                    <div className="card">
                        <div className="flex items-start gap-4 mb-4">
                            <img
                                src={crop?.images?.[0] || getCropImage(crop?.name) || '/placeholder.jpg'}
                                alt={crop?.name || 'Crop'}
                                className="img-rounded"
                                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80';
                                }}
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

                        {/* Farmer Info */}
                        <div className="grid gap-2 text-sm">
                            <p style={{ color: 'var(--gray-600)', fontWeight: 600 }}>Farmer:</p>
                            <div className="flex justify-between">
                                <span>Name:</span>
                                <strong>{farmer?.name}</strong>
                            </div>
                            <div className="flex justify-between">
                                <span>Email:</span>
                                <strong>{farmer?.email}</strong>
                            </div>
                            <div className="flex justify-between">
                                <span>Phone:</span>
                                <strong>{farmer?.phone}</strong>
                            </div>
                            <div className="flex justify-between">
                                <span>Location:</span>
                                <strong>{farmer?.address ? (typeof farmer.address === 'string' ? farmer.address : `${farmer.address.village || ''}, ${farmer.address.district || ''}, ${farmer.address.state || ''}`.trim()) : 'N/A'}</strong>
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
                                by {negotiation.currentOffer.offeredBy === 'wholesaler' ? 'You' : farmer?.name}
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
                                <span className="font-semibold text-gray-700">Waiting for {farmer?.name} to respond...</span>
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

                    {/* Make Offer Form - Fixed at bottom */}
                    {isOngoing && canRespond && (
                        <div className="card bg-green-50 border-green-200">
                            <h3 className="mb-3 text-sm font-semibold text-green-800">Make Offer / Action</h3>
                            <form onSubmit={handleMakeOffer}>
                                <div className="flex gap-4 items-end">
                                    <div className="flex-1">
                                        <label className="form-label text-xs">Your Offer (₹)</label>
                                        <input
                                            type="number"
                                            className="form-input form-input-sm"
                                            placeholder="Amount"
                                            value={offerAmount}
                                            onChange={(e) => setOfferAmount(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={submitting}
                                    >
                                        Send Offer
                                    </button>
                                    <button type="button" className="btn btn-danger btn-outline" onClick={handleCancelNegotiation}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Cart Actions for Accepted Negotiations */}
                    {negotiation.status === 'accepted' && !showCartOptions && (
                        <div className="card bg-blue-50 border-blue-200">
                            <h3 className="mb-3 text-sm font-semibold text-blue-800">🎉 Negotiation Accepted!</h3>
                            <p className="text-sm text-gray-700 mb-4">
                                Final Price: <strong className="text-green-600">{formatPrice(negotiation.finalAgreedPrice)}</strong> per {negotiation.agreedQuantity?.unit}
                            </p>
                            <div className="flex gap-3">
                                <button onClick={handleAddToCart} className="btn btn-primary flex-1">
                                    🛒 Add to Cart
                                </button>
                                <button onClick={handleCheckoutNow} className="btn btn-success flex-1">
                                    ⚡ Checkout Now
                                </button>
                            </div>
                        </div>
                    )}

                    {/* After Adding to Cart */}
                    {showCartOptions && (
                        <div className="card bg-green-50 border-green-200">
                            <h3 className="mb-3 text-sm font-semibold text-green-800">✅ Added to Cart!</h3>
                            <div className="flex gap-3">
                                <button onClick={() => navigate('/wholesaler/marketplace')} className="btn btn-outline flex-1">
                                    Continue Shopping
                                </button>
                                <button onClick={() => navigate('/wholesaler/cart')} className="btn btn-primary flex-1">
                                    View Cart
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WholesalerNegotiationDetail;

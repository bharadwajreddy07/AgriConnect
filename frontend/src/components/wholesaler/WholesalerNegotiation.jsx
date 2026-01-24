import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FaArrowLeft,
    FaHandshake,
    FaCheckCircle,
    FaTimesCircle,
    FaHistory,
    FaEye,
} from 'react-icons/fa';
import api from '../../services/api';
import { formatPrice } from '../../utils/cartUtils';

const WholesalerNegotiation = () => {
    const { cropId } = useParams();
    const navigate = useNavigate();
    const [crop, setCrop] = useState(null);
    const [negotiation, setNegotiation] = useState(null);
    const [allNegotiations, setAllNegotiations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [offer, setOffer] = useState({
        pricePerUnit: '',
        quantity: { value: '', unit: 'quintal' },
        deliveryTerms: '',
        paymentTerms: '',
        notes: '',
    });

    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (cropId) {
            loadData();
        } else {
            loadAllNegotiations();
        }
    }, [cropId]);

    const loadAllNegotiations = async () => {
        try {
            setLoading(true);
            const response = await api.get('/negotiations');
            setAllNegotiations(response.data.data || []);
        } catch (error) {
            console.error('Error loading negotiations:', error);
            toast.error('Failed to load negotiations');
        } finally {
            setLoading(false);
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            setNotFound(false);

            console.log('Loading data for crop:', cropId);

            // Fetch crop
            let cropData = null;
            try {
                const cropRes = await api.get(`/crops/${cropId}`);
                cropData = cropRes.data.data;
            } catch (err) {
                console.error('Failed to fetch crop:', err);
                if (err.response && err.response.status === 404) {
                    setNotFound(true);
                    return;
                }
            }

            if (!cropData) {
                setNotFound(true);
                return;
            }

            setCrop(cropData);

            // Fetch negotiations
            const negotiationRes = await api.get(`/negotiations?crop=${cropId}`).catch(() => ({ data: { data: [] } }));

            // Find active negotiation for this crop
            const activeNeg = negotiationRes.data.data?.find(
                n => n.crop._id === cropId && n.status === 'ongoing'
            );
            setNegotiation(activeNeg || null);

            // Pre-fill with crop details
            if (!activeNeg && cropData) {
                setOffer({
                    ...offer,
                    pricePerUnit: cropData.expectedPrice || '',
                    quantity: cropData.quantity || { value: '', unit: 'quintal' },
                });
            }
        } catch (error) {
            console.error('Critical error in loadData:', error);
            toast.error('Something went wrong loading the page');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNegotiation = async (e) => {
        e.preventDefault();
        try {
            console.log('Starting negotiation for crop:', cropId);
            console.log('Offer details:', offer);

            await api.post('/negotiations', {
                crop: cropId,
                initialPrice: offer.pricePerUnit,
                quantity: offer.quantity,
                message: `Negotiation request for ${crop.name}`
            });
            toast.success('Negotiation started successfully!');
            loadData();
        } catch (error) {
            console.error('Error creating negotiation:', error);
            toast.error(error.response?.data?.message || 'Failed to start negotiation');
        }
    };

    const handleCounterOffer = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/negotiations/${negotiation._id}/offer`, offer);
            toast.success('Counter offer sent!');
            loadData();
            setOffer({
                pricePerUnit: '',
                quantity: { value: '', unit: 'quintal' },
                deliveryTerms: '',
                paymentTerms: '',
                notes: '',
            });
        } catch (error) {
            console.error('Error sending offer:', error);
            toast.error('Failed to send counter offer');
        }
    };

    const handleAccept = async () => {
        try {
            await api.put(`/negotiations/${negotiation._id}/accept`);
            toast.success('Offer accepted! You can now place an order.');
            navigate('/wholesaler/orders');
        } catch (error) {
            console.error('Error accepting offer:', error);
            toast.error('Failed to accept offer');
        }
    };

    const handleReject = async () => {
        if (!window.confirm('Are you sure you want to reject and end this negotiation?')) {
            return;
        }
        try {
            await api.put(`/negotiations/${negotiation._id}/reject`);
            toast.success('Negotiation ended');
            navigate('/wholesaler/marketplace');
        } catch (error) {
            console.error('Error rejecting offer:', error);
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

    // List view - show all negotiations
    if (!cropId) {
        return (
            <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', minHeight: '100vh', paddingTop: 'var(--spacing-8)', paddingBottom: 'var(--spacing-12)' }}>
                <div className="container">
                    <div className="mb-6">
                        <h1 className="gradient-text">My Negotiations</h1>
                        <p style={{ color: 'var(--gray-600)' }}>
                            Manage all your price negotiations with farmers
                        </p>
                    </div>

                    {allNegotiations.length === 0 ? (
                        <div className="card-premium text-center" style={{ padding: 'var(--spacing-12)' }}>
                            <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-4)' }}>💬</div>
                            <h3>No negotiations yet</h3>
                            <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--spacing-4)' }}>
                                Start negotiating prices with farmers from the marketplace
                            </p>
                            <Link to="/wholesaler/marketplace" className="btn btn-primary">
                                Browse Marketplace
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {allNegotiations.map((neg) => (
                                <div key={neg._id} className="card-premium hover-lift">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4" style={{ flex: 1 }}>
                                            <img
                                                src={neg.crop?.images?.[0] || '/placeholder.jpg'}
                                                alt={neg.crop?.name}
                                                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }}
                                            />
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ marginBottom: 'var(--spacing-1)' }}>{neg.crop?.name}</h4>
                                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-2)' }}>
                                                    Farmer: {neg.farmer?.name}
                                                </p>
                                                <div className="flex items-center gap-3">
                                                    <span
                                                        className="badge"
                                                        style={{
                                                            background: neg.status === 'ongoing' ? '#fef3c7' : neg.status === 'accepted' ? '#d1fae5' : '#fee2e2',
                                                            color: neg.status === 'ongoing' ? '#f59e0b' : neg.status === 'accepted' ? '#10b981' : '#ef4444',
                                                            fontWeight: 600
                                                        }}
                                                    >
                                                        {neg.status}
                                                    </span>
                                                    {neg.currentOffer && (
                                                        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                                            Current: <strong style={{ color: 'var(--primary-green)' }}>{formatPrice(neg.currentOffer.pricePerUnit)}</strong>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <Link
                                            to={`/wholesaler/negotiations/${neg._id}`}
                                            className="btn btn-outline"
                                        >
                                            <FaEye /> View Details
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Detail view - specific crop negotiation
    if (!crop) {
        return (
            <div className="container" style={{ marginTop: 'var(--spacing-8)' }}>
                <div className="card-premium text-center" style={{ padding: 'var(--spacing-12)' }}>
                    <h3>Crop not found</h3>
                    <button onClick={() => navigate('/wholesaler/marketplace')} className="btn btn-primary mt-4">
                        Back to Marketplace
                    </button>
                </div>
            </div>
        );
    }

    const currentOffer = negotiation?.currentOffer;
    const isMyTurn = negotiation && currentOffer?.offeredBy === 'farmer';

    return (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', minHeight: '100vh', paddingTop: 'var(--spacing-8)', paddingBottom: 'var(--spacing-12)' }}>
            <div className="container" style={{ maxWidth: '900px' }}>
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate('/wholesaler/marketplace')}
                        className="btn btn-outline"
                        style={{ padding: 'var(--spacing-2)' }}
                    >
                        <FaArrowLeft />
                    </button>
                    <div>
                        <h1 className="gradient-text">Negotiation</h1>
                        <p style={{ color: 'var(--gray-600)' }}>{crop.name} from {crop.farmer?.name}</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {/* Crop Details */}
                    <div className="card-premium">
                        <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Crop Details</h3>
                        <img
                            src={crop.images?.[0] || '/placeholder.jpg'}
                            alt={crop.name}
                            style={{
                                width: '100%',
                                height: '200px',
                                objectFit: 'cover',
                                borderRadius: 'var(--radius-lg)',
                                marginBottom: 'var(--spacing-3)',
                            }}
                        />
                        <div className="grid gap-2">
                            <div>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>Category</p>
                                <p style={{ fontWeight: 600 }}>{crop.category}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>Available</p>
                                <p style={{ fontWeight: 600 }}>{crop.quantity.value} {crop.quantity.unit}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>Listed Price</p>
                                <p style={{ fontWeight: 700, color: 'var(--primary-green)' }}>
                                    {formatPrice(crop.expectedPrice)}
                                </p>
                            </div>
                            <div>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>Quality</p>
                                <p style={{ fontWeight: 600 }}>{crop.qualityGrade}</p>
                            </div>
                        </div>
                    </div>

                    {/* Negotiation Panel */}
                    <div style={{ gridColumn: 'span 2' }}>
                        {/* Current Status */}
                        {negotiation && (
                            <div className="card-premium mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3>Current Offer</h3>
                                    <span
                                        className="badge"
                                        style={{
                                            background: negotiation.status === 'ongoing' ? 'var(--warning)' : 'var(--success)',
                                            color: 'white',
                                        }}
                                    >
                                        {negotiation.status}
                                    </span>
                                </div>

                                {currentOffer && (
                                    <div style={{ padding: 'var(--spacing-4)', background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)' }}>
                                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-2)' }}>
                                            Offered by: {currentOffer.offeredBy === 'farmer' ? crop.farmer?.name : 'You'}
                                        </p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>Price</p>
                                                <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--primary-green)' }}>
                                                    {formatPrice(currentOffer.pricePerUnit)}
                                                </p>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>Quantity</p>
                                                <p style={{ fontWeight: 600 }}>
                                                    {currentOffer.quantity.value} {currentOffer.quantity.unit}
                                                </p>
                                            </div>
                                        </div>
                                        {currentOffer.deliveryTerms && (
                                            <div style={{ marginTop: 'var(--spacing-2)' }}>
                                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>Delivery Terms</p>
                                                <p>{currentOffer.deliveryTerms}</p>
                                            </div>
                                        )}
                                        {currentOffer.paymentTerms && (
                                            <div style={{ marginTop: 'var(--spacing-2)' }}>
                                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>Payment Terms</p>
                                                <p>{currentOffer.paymentTerms}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {isMyTurn && (
                                    <div className="flex gap-3 mt-4">
                                        <button onClick={handleAccept} className="btn btn-primary flex-1">
                                            <FaCheckCircle /> Accept Offer
                                        </button>
                                        <button onClick={handleReject} className="btn btn-outline flex-1">
                                            <FaTimesCircle /> Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Offer Form */}
                        <div className="card-premium">
                            <h3 style={{ marginBottom: 'var(--spacing-4)' }}>
                                {negotiation ? 'Make Counter Offer' : 'Start Negotiation'}
                            </h3>

                            <form onSubmit={negotiation ? handleCounterOffer : handleCreateNegotiation}>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="form-group">
                                        <label className="form-label">Price per Unit (₹) *</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={offer.pricePerUnit}
                                            onChange={(e) => setOffer({ ...offer, pricePerUnit: e.target.value })}
                                            required
                                            min="0"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Quantity *</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                className="form-input"
                                                value={offer.quantity.value}
                                                onChange={(e) => setOffer({
                                                    ...offer,
                                                    quantity: { ...offer.quantity, value: e.target.value }
                                                })}
                                                required
                                                min="0"
                                            />
                                            <select
                                                className="form-select"
                                                value={offer.quantity.unit}
                                                onChange={(e) => setOffer({
                                                    ...offer,
                                                    quantity: { ...offer.quantity, unit: e.target.value }
                                                })}
                                                style={{ width: '120px' }}
                                            >
                                                <option value="kg">kg</option>
                                                <option value="quintal">quintal</option>
                                                <option value="ton">ton</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Delivery Terms</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g., FOB, CIF, Ex-warehouse"
                                        value={offer.deliveryTerms}
                                        onChange={(e) => setOffer({ ...offer, deliveryTerms: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Payment Terms</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g., 30 days credit, Advance payment"
                                        value={offer.paymentTerms}
                                        onChange={(e) => setOffer({ ...offer, paymentTerms: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Notes (Optional)</label>
                                    <textarea
                                        className="form-textarea"
                                        rows="3"
                                        placeholder="Any additional terms or notes..."
                                        value={offer.notes}
                                        onChange={(e) => setOffer({ ...offer, notes: e.target.value })}
                                    />
                                </div>

                                <button type="submit" className="btn btn-primary w-full">
                                    <FaHandshake /> {negotiation ? 'Send Counter Offer' : 'Start Negotiation'}
                                </button>
                            </form>
                        </div>

                        {/* Negotiation History */}
                        {negotiation && negotiation.offers && negotiation.offers.length > 0 && (
                            <div className="card-premium mt-6">
                                <h3 style={{ marginBottom: 'var(--spacing-4)' }}>
                                    <FaHistory /> Negotiation History
                                </h3>
                                <div className="grid gap-3">
                                    {negotiation.offers.map((historyOffer, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                padding: 'var(--spacing-3)',
                                                background: historyOffer.offeredBy === 'wholesaler' ? 'var(--blue-50)' : 'var(--green-50)',
                                                borderRadius: 'var(--radius-md)',
                                                borderLeft: `4px solid ${historyOffer.offeredBy === 'wholesaler' ? 'var(--primary-blue)' : 'var(--primary-green)'}`,
                                            }}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                                                    {historyOffer.offeredBy === 'wholesaler' ? 'You' : crop.farmer?.name}
                                                </p>
                                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                                                    {new Date(historyOffer.timestamp).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--primary-green)' }}>
                                                {formatPrice(historyOffer.pricePerUnit)} • {historyOffer.quantity.value} {historyOffer.quantity.unit}
                                            </p>
                                            {historyOffer.notes && (
                                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-700)', marginTop: 'var(--spacing-1)' }}>
                                                    {historyOffer.notes}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WholesalerNegotiation;

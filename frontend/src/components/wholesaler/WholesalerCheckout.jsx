import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useWholesalerCart } from '../../context/WholesalerCartContext';
import { formatPrice } from '../../utils/cartUtils';
import api from '../../services/api';
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

const WholesalerCheckout = () => {
    const navigate = useNavigate();
    const { cartItems, clearCart, getCartTotals } = useWholesalerCart();
    const [loading, setLoading] = useState(false);
    const [deliveryAddress, setDeliveryAddress] = useState({
        name: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        landmark: '',
    });
    const [deliveryTerms, setDeliveryTerms] = useState('Standard Delivery');
    const [paymentTerms, setPaymentTerms] = useState('Payment on Delivery');
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [notes, setNotes] = useState('');

    const totals = getCartTotals();

    const handlePlaceOrders = async (e) => {
        e.preventDefault();

        if (cartItems.length === 0) {
            toast.error('Cart is empty');
            return;
        }

        setLoading(true);

        try {
            console.log('=== Placing Wholesaler Orders ===');
            console.log('Cart Items:', cartItems);
            console.log('Delivery Address:', deliveryAddress);
            console.log('Payment Method:', paymentMethod);

            const orderPromises = cartItems.map(async (item) => {
                if (item.type === 'negotiation') {
                    console.log('Creating order from negotiation:', item.negotiationId);
                    // Create order from negotiation
                    return api.post(`/wholesale-orders/from-negotiation/${item.negotiationId}`, {
                        deliveryAddress,
                        deliveryTerms,
                        paymentTerms,
                        paymentMethod,
                        notes,
                    });
                } else {
                    console.log('Creating direct order for crop:', item.crop._id);
                    console.log('Quantity:', item.quantity);
                    // Create direct order
                    const orderData = {
                        cropId: item.crop._id,
                        quantity: item.quantity,
                        deliveryAddress,
                        deliveryTerms,
                        paymentTerms,
                        paymentMethod,
                        notes,
                    };
                    console.log('Order Data:', JSON.stringify(orderData, null, 2));
                    return api.post('/wholesale-orders', orderData);
                }
            });

            const results = await Promise.all(orderPromises);
            console.log('Orders placed successfully:', results.length);

            clearCart();
            toast.success(`Successfully placed ${results.length} order(s)!`);
            navigate(`/wholesaler/order-success?count=${results.length}`);
        } catch (error) {
            console.error('Error placing orders:', error);
            console.error('Error response:', error.response?.data);
            toast.error(error.response?.data?.message || 'Failed to place orders');
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="container" style={{ marginTop: 'var(--spacing-8)' }}>
                <div className="card-premium text-center" style={{ padding: 'var(--spacing-12)', maxWidth: '600px', margin: '0 auto' }}>
                    <h2>Cart is Empty</h2>
                    <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--spacing-4)' }}>
                        Add items to cart before checkout
                    </p>
                    <button onClick={() => navigate('/wholesaler/marketplace')} className="btn btn-primary">
                        Browse Marketplace
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', minHeight: '100vh', paddingTop: 'var(--spacing-8)', paddingBottom: 'var(--spacing-12)' }}>
            <div className="container" style={{ maxWidth: '1200px' }}>
                <button onClick={() => navigate('/wholesaler/cart')} className="btn btn-outline btn-sm mb-6">
                    <FaArrowLeft /> Back to Cart
                </button>

                <h1 className="gradient-text mb-6">Checkout</h1>

                <form onSubmit={handlePlaceOrders}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-6)' }}>
                        {/* Left Column - Forms */}
                        <div className="flex flex-col gap-6">
                            <div className="card-premium">
                                <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Delivery Address</h3>
                                <div className="grid gap-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="form-group">
                                            <label className="form-label">Full Name *</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={deliveryAddress.name}
                                                onChange={(e) => setDeliveryAddress({ ...deliveryAddress, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Phone Number *</label>
                                            <input
                                                type="tel"
                                                className="form-input"
                                                value={deliveryAddress.phone}
                                                onChange={(e) => setDeliveryAddress({ ...deliveryAddress, phone: e.target.value })}
                                                required
                                                pattern="[0-9]{10}"
                                                maxLength="10"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Street Address *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={deliveryAddress.street}
                                            onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="form-group">
                                            <label className="form-label">City *</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={deliveryAddress.city}
                                                onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">State *</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={deliveryAddress.state}
                                                onChange={(e) => setDeliveryAddress({ ...deliveryAddress, state: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="form-group">
                                            <label className="form-label">Pincode *</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={deliveryAddress.pincode}
                                                onChange={(e) => setDeliveryAddress({ ...deliveryAddress, pincode: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Landmark</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={deliveryAddress.landmark}
                                                onChange={(e) => setDeliveryAddress({ ...deliveryAddress, landmark: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Terms & Payment */}
                            <div className="card-premium">
                                <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Terms & Payment</h3>
                                <div className="grid gap-4">
                                    <div className="form-group">
                                        <label className="form-label">Delivery Terms</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={deliveryTerms}
                                            onChange={(e) => setDeliveryTerms(e.target.value)}
                                            placeholder="e.g., FOB, CIF, Ex-warehouse"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Payment Terms</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={paymentTerms}
                                            onChange={(e) => setPaymentTerms(e.target.value)}
                                            placeholder="e.g., 30 days credit, Advance payment"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Payment Method</label>
                                        <select
                                            className="form-select"
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        >
                                            <option value="cod">Cash on Delivery</option>
                                            <option value="online">Online Payment</option>
                                            <option value="bank_transfer">Bank Transfer</option>
                                            <option value="credit">Credit (30 days)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Additional Notes</label>
                                        <textarea
                                            className="form-textarea"
                                            rows="3"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Any special instructions..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Order Summary */}
                        <div>
                            <div className="card-premium" style={{ position: 'sticky', top: 'var(--spacing-8)' }}>
                                <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Order Summary</h3>

                                <div className="grid gap-3 mb-4">
                                    {cartItems.map((item) => (
                                        <div key={item.id} style={{ padding: 'var(--spacing-3)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                                            <div className="flex gap-3">
                                                <img
                                                    src={item.crop?.images?.[0] || '/placeholder.jpg'}
                                                    alt={item.crop?.name}
                                                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                                                />
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-1)' }}>
                                                        {item.crop?.name}
                                                    </p>
                                                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                                                        {item.quantity.value} {item.quantity.unit} × {formatPrice(item.pricePerUnit)}
                                                    </p>
                                                    <p style={{ fontWeight: 700, color: 'var(--primary-green)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-1)' }}>
                                                        {formatPrice(item.totalAmount)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="divider"></div>

                                <div className="grid gap-2 mb-4">
                                    <div className="flex justify-between">
                                        <span style={{ color: 'var(--gray-600)' }}>Subtotal</span>
                                        <span style={{ fontWeight: 600 }}>{formatPrice(totals.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>Total</span>
                                        <span style={{ fontWeight: 700, fontSize: 'var(--font-size-xl)', color: 'var(--primary-green)' }}>
                                            {formatPrice(totals.total)}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-full"
                                    disabled={loading}
                                    style={{ marginBottom: 'var(--spacing-3)' }}
                                >
                                    {loading ? (
                                        <>
                                            <div className="spinner" style={{ width: '16px', height: '16px', marginRight: 'var(--spacing-2)' }}></div>
                                            Placing Orders...
                                        </>
                                    ) : (
                                        <>
                                            <FaCheckCircle style={{ marginRight: 'var(--spacing-2)' }} />
                                            Place {cartItems.length} Order{cartItems.length > 1 ? 's' : ''}
                                        </>
                                    )}
                                </button>

                                <div style={{ padding: 'var(--spacing-3)', background: 'var(--blue-50)', borderRadius: 'var(--radius-md)' }}>
                                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-700)' }}>
                                        <strong>Note:</strong> Separate orders will be created for each item. Farmers will be notified immediately.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WholesalerCheckout;

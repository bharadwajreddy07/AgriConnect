import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useWholesalerCart } from '../../context/WholesalerCartContext';
import { formatPrice } from '../../utils/cartUtils';
import { FaTrash, FaShoppingCart, FaArrowLeft } from 'react-icons/fa';

const WholesalerCart = () => {
    const navigate = useNavigate();
    const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotals } = useWholesalerCart();
    const [quantities, setQuantities] = useState({});

    const totals = getCartTotals();

    const handleQuantityChange = (itemId, field, value) => {
        const item = cartItems.find(i => i.id === itemId);
        if (!item) return;

        const newQuantity = {
            ...item.quantity,
            [field]: field === 'value' ? parseFloat(value) || 0 : value,
        };

        updateQuantity(itemId, newQuantity);
    };

    const handleRemove = (itemId) => {
        if (window.confirm('Remove this item from cart?')) {
            removeFromCart(itemId);
            toast.success('Item removed from cart');
        }
    };

    const handleClearCart = () => {
        if (window.confirm('Clear all items from cart?')) {
            clearCart();
            toast.success('Cart cleared');
        }
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            toast.error('Cart is empty');
            return;
        }
        navigate('/wholesaler/checkout');
    };

    if (cartItems.length === 0) {
        return (
            <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', minHeight: '100vh', paddingTop: 'var(--spacing-8)', paddingBottom: 'var(--spacing-12)' }}>
                <div className="container" style={{ maxWidth: '800px' }}>
                    <button onClick={() => navigate('/wholesaler/marketplace')} className="btn btn-outline mb-6">
                        <FaArrowLeft /> Back to Marketplace
                    </button>

                    <div className="card-premium text-center" style={{ padding: 'var(--spacing-12)' }}>
                        <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-4)' }}>🛒</div>
                        <h2>Your Cart is Empty</h2>
                        <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--spacing-4)' }}>
                            Add items from negotiations or browse the marketplace
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => navigate('/wholesaler/marketplace')} className="btn btn-primary">
                                Browse Marketplace
                            </button>
                            <button onClick={() => navigate('/wholesaler/negotiations')} className="btn btn-outline">
                                View Negotiations
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', minHeight: '100vh', paddingTop: 'var(--spacing-8)', paddingBottom: 'var(--spacing-12)' }}>
            <div className="container" style={{ maxWidth: '1200px' }}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <button onClick={() => navigate('/wholesaler/marketplace')} className="btn btn-outline btn-sm mb-3">
                            <FaArrowLeft /> Continue Shopping
                        </button>
                        <h1 className="gradient-text">
                            <FaShoppingCart style={{ display: 'inline', marginRight: 'var(--spacing-2)' }} />
                            Wholesale Cart
                        </h1>
                        <p style={{ color: 'var(--gray-600)' }}>
                            {totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'} in cart
                        </p>
                    </div>
                    <button onClick={handleClearCart} className="btn btn-outline btn-sm" style={{ color: 'var(--danger)' }}>
                        Clear Cart
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-6)' }}>
                    {/* Cart Items */}
                    <div className="flex flex-col gap-4">
                        {cartItems.map((item) => (
                            <div key={item.id} className="card-premium">
                                <div className="flex gap-4">
                                    <img
                                        src={item.crop?.images?.[0] || '/placeholder.jpg'}
                                        alt={item.crop?.name}
                                        style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 style={{ marginBottom: 'var(--spacing-1)' }}>{item.crop?.name}</h3>
                                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                                    Farmer: {item.farmer?.name}
                                                </p>
                                                {item.type === 'negotiation' && (
                                                    <span className="badge badge-success" style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-1)' }}>
                                                        From Negotiation
                                                    </span>
                                                )}
                                            </div>
                                            <button onClick={() => handleRemove(item.id)} className="btn btn-outline btn-sm" style={{ color: 'var(--danger)' }}>
                                                <FaTrash />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 mt-4">
                                            <div>
                                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-1)' }}>
                                                    Price per Unit
                                                </p>
                                                <p style={{ fontWeight: 700, color: 'var(--primary-green)' }}>
                                                    {formatPrice(item.pricePerUnit)}
                                                </p>
                                            </div>

                                            <div>
                                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-1)' }}>
                                                    Quantity
                                                </p>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="number"
                                                        className="form-input form-input-sm"
                                                        value={item.quantity.value}
                                                        onChange={(e) => handleQuantityChange(item.id, 'value', e.target.value)}
                                                        min="1"
                                                        style={{ width: '80px' }}
                                                    />
                                                    <select
                                                        className="form-select form-select-sm"
                                                        value={item.quantity.unit}
                                                        onChange={(e) => handleQuantityChange(item.id, 'unit', e.target.value)}
                                                        style={{ width: '100px' }}
                                                    >
                                                        <option value="kg">kg</option>
                                                        <option value="quintal">quintal</option>
                                                        <option value="ton">ton</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-1)' }}>
                                                    Total
                                                </p>
                                                <p style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)', color: 'var(--primary-green)' }}>
                                                    {formatPrice(item.totalAmount)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div>
                        <div className="card-premium" style={{ position: 'sticky', top: 'var(--spacing-8)' }}>
                            <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Order Summary</h3>

                            <div className="grid gap-3 mb-4">
                                <div className="flex justify-between">
                                    <span style={{ color: 'var(--gray-600)' }}>Items ({totals.itemCount})</span>
                                    <span style={{ fontWeight: 600 }}>{formatPrice(totals.subtotal)}</span>
                                </div>
                                <div className="divider"></div>
                                <div className="flex justify-between">
                                    <span style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>Total</span>
                                    <span style={{ fontWeight: 700, fontSize: 'var(--font-size-xl)', color: 'var(--primary-green)' }}>
                                        {formatPrice(totals.total)}
                                    </span>
                                </div>
                            </div>

                            <button onClick={handleCheckout} className="btn btn-primary w-full" style={{ marginBottom: 'var(--spacing-3)' }}>
                                Proceed to Checkout
                            </button>

                            <button onClick={() => navigate('/wholesaler/marketplace')} className="btn btn-outline w-full">
                                Continue Shopping
                            </button>

                            <div style={{ marginTop: 'var(--spacing-4)', padding: 'var(--spacing-3)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                                    💡 <strong>Note:</strong> Final prices and delivery terms will be confirmed at checkout.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WholesalerCart;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FaShoppingCart,
    FaTrash,
    FaPlus,
    FaMinus,
    FaArrowRight,
    FaShoppingBag,
} from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/cropData';

const ShoppingCart = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { cartItems, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart();

    const handleUpdateQuantity = (productId, newQuantity) => {
        updateQuantity(productId, newQuantity);
    };

    const handleRemoveItem = (productId) => {
        removeFromCart(productId);
    };

    const handleClearCart = () => {
        if (window.confirm('Are you sure you want to clear your cart?')) {
            clearCart();
        }
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            toast.error('Your cart is empty');
            return;
        }
        navigate('/consumer/checkout');
    };

    const subtotal = getCartTotal();
    const delivery = 0; // Free delivery for all orders
    const tax = subtotal * 0.05;
    const total = subtotal + delivery + tax;

    if (cartItems.length === 0) {
        return (
            <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', minHeight: '100vh', paddingTop: 'var(--spacing-8)', paddingBottom: 'var(--spacing-12)' }}>
                <div className="container">
                    <div className="card-premium text-center" style={{ maxWidth: '600px', margin: '0 auto', padding: 'var(--spacing-12)' }}>
                        <div style={{ fontSize: '5rem', marginBottom: 'var(--spacing-4)' }}>
                            🛒
                        </div>
                        <h2 style={{ marginBottom: 'var(--spacing-3)' }}>Your Cart is Empty</h2>
                        <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--spacing-6)', fontSize: 'var(--font-size-lg)' }}>
                            Looks like you haven't added any products yet.
                        </p>
                        <Link to="/consumer/products" className="btn btn-primary btn-lg">
                            <FaShoppingBag /> Start Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', minHeight: '100vh', paddingTop: 'var(--spacing-8)', paddingBottom: 'var(--spacing-12)' }}>
            <div className="container">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="gradient-text">Shopping Cart</h1>
                        <p style={{ color: 'var(--gray-600)' }}>
                            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                        </p>
                    </div>
                    <button
                        onClick={handleClearCart}
                        className="btn btn-outline"
                        style={{ color: 'var(--error)' }}
                    >
                        <FaTrash /> Clear Cart
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {/* Cart Items */}
                    <div className="col-span-2">
                        <div className="card-premium">
                            {cartItems.map((item, index) => (
                                <div
                                    key={item._id}
                                    style={{
                                        padding: 'var(--spacing-4)',
                                        borderBottom: index < cartItems.length - 1 ? '1px solid var(--gray-200)' : 'none',
                                    }}
                                >
                                    <div className="flex gap-4">
                                        {/* Product Image */}
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
                                                src={item.images?.[0] || '/images/crops/paddy.png'}
                                                alt={item.name}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                }}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/images/crops/paddy.png'; // Fallback to paddy if image fails
                                                }}
                                            />
                                        </div>

                                        {/* Product Details */}
                                        <div style={{ flex: 1 }}>
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 style={{ marginBottom: 'var(--spacing-1)' }}>
                                                        {item.name}
                                                    </h3>
                                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                                        {item.category} • {item.season}
                                                    </p>
                                                    {item.organicCertified && (
                                                        <span className="badge badge-success" style={{ marginTop: 'var(--spacing-2)' }}>
                                                            Organic
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveItem(item._id)}
                                                    className="btn btn-sm"
                                                    style={{ background: 'transparent', border: 'none', color: 'var(--error)' }}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>

                                            {/* Farmer Info */}
                                            <div className="flex items-center gap-2 mb-3" style={{ padding: 'var(--spacing-2)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', width: 'fit-content' }}>
                                                <div style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '50%',
                                                    background: 'var(--primary-green)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontSize: 'var(--font-size-xs)',
                                                    fontWeight: 'bold',
                                                }}>
                                                    {item.farmer?.name?.charAt(0) || 'F'}
                                                </div>
                                                <span style={{ fontSize: 'var(--font-size-sm)' }}>
                                                    {item.farmer?.name || 'Farmer'}
                                                </span>
                                            </div>

                                            {/* Quantity and Price */}
                                            <div className="flex items-center justify-between">
                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item._id, item.cartQuantity - 1)}
                                                        className="btn btn-sm btn-outline"
                                                        disabled={item.cartQuantity <= 1}
                                                        style={{ width: '36px', height: '36px', padding: 0 }}
                                                    >
                                                        <FaMinus />
                                                    </button>
                                                    <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, minWidth: '40px', textAlign: 'center' }}>
                                                        {item.cartQuantity}
                                                    </span>
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item._id, item.cartQuantity + 1)}
                                                        className="btn btn-sm btn-outline"
                                                        disabled={item.cartQuantity >= (item.stockQuantity || 100)}
                                                        style={{ width: '36px', height: '36px', padding: 0 }}
                                                    >
                                                        <FaPlus />
                                                    </button>
                                                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>
                                                        / {item.stockQuantity || 100} available
                                                    </span>
                                                </div>

                                                {/* Price */}
                                                <div className="text-right">
                                                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-1)' }}>
                                                        {formatPrice((item.consumerPrice || item.expectedPrice))} × {item.cartQuantity}
                                                    </div>
                                                    <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--primary-green)' }}>
                                                        {formatPrice((item.consumerPrice || item.expectedPrice) * item.cartQuantity)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Continue Shopping */}
                        <Link
                            to="/consumer/products"
                            className="btn btn-outline"
                            style={{ marginTop: 'var(--spacing-4)', width: '100%' }}
                        >
                            Continue Shopping
                        </Link>
                    </div>

                    {/* Order Summary */}
                    <div>
                        <div className="card-premium" style={{ position: 'sticky', top: 'var(--spacing-4)' }}>
                            <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Order Summary</h3>

                            {/* Price Breakdown */}
                            <div style={{ marginBottom: 'var(--spacing-4)' }}>
                                <div className="flex items-center justify-between mb-3">
                                    <span style={{ color: 'var(--gray-600)' }}>Subtotal</span>
                                    <span style={{ fontWeight: 600 }}>{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex items-center justify-between mb-3">
                                    <span style={{ color: 'var(--gray-600)' }}>Delivery Charges</span>
                                    <span style={{ fontWeight: 600, color: delivery === 0 ? 'var(--success)' : 'inherit' }}>
                                        {delivery === 0 ? 'FREE' : formatPrice(delivery)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mb-3">
                                    <span style={{ color: 'var(--gray-600)' }}>Tax (GST 5%)</span>
                                    <span style={{ fontWeight: 600 }}>{formatPrice(tax)}</span>
                                </div>

                                {subtotal < 1000 && (
                                    <div className="alert alert-info" style={{ padding: 'var(--spacing-2)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-3)' }}>
                                        Add {formatPrice(1000 - subtotal)} more for FREE delivery!
                                    </div>
                                )}

                                <div style={{ borderTop: '2px solid var(--gray-200)', paddingTop: 'var(--spacing-3)', marginTop: 'var(--spacing-3)' }}>
                                    <div className="flex items-center justify-between">
                                        <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>Total</span>
                                        <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--primary-green)' }}>
                                            {formatPrice(total)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Checkout Button */}
                            <button
                                onClick={handleCheckout}
                                className="btn btn-primary btn-lg animate-pulse"
                                style={{ width: '100%' }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
                                ) : (
                                    <>
                                        Proceed to Checkout <FaArrowRight />
                                    </>
                                )}
                            </button>

                            {/* Security Badge */}
                            <div className="text-center" style={{ marginTop: 'var(--spacing-4)', padding: 'var(--spacing-3)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-1)' }}>
                                    🔒 Secure Checkout
                                </p>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>
                                    Your payment information is safe with us
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShoppingCart;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FaShoppingCart,
    FaMapMarkerAlt,
    FaCreditCard,
    FaCheckCircle,
    FaArrowLeft,
    FaArrowRight,
} from 'react-icons/fa';
import api from '../../services/api';
import {
    getCartTotal as getUtilsCartTotal,
    formatPrice,
    clearCart as utilsClearCart,
    validateCart,
} from '../../utils/cartUtils';
import { getCropImage } from '../../utils/cropData';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Checkout = () => {
    // Context hooks
    const { cartItems: contextCartItems, loading: cartLoading, clearCart: contextClearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    // State
    const [currentStep, setCurrentStep] = useState(1);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [validationIssues, setValidationIssues] = useState([]);

    // Delivery Address State
    const [deliveryAddress, setDeliveryAddress] = useState({
        name: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        pincode: '',
    });

    // Initialize user data once user is loaded
    useEffect(() => {
        if (user) {
            setDeliveryAddress(prev => ({
                ...prev,
                name: user.name || '',
                phone: user.phone || '',
                street: user.address?.street || '',
                city: user.address?.city || '',
                state: user.address?.state || '',
                pincode: user.address?.pincode || '',
            }));
        }
    }, [user]);

    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    // Initialize Cart
    useEffect(() => {
        // Hotfix: Check for stale data (zero price) and warn/clear
        if (cart.length > 0 && cart.some(item => !item.consumerPrice && !item.expectedPrice)) {
            console.warn('Stale cart data detected (missing price). Clearing cart.');
            contextClearCart();
            toast.info('Cart cleared due to product updates. Please add items again.');
        }
    }, [cart]);

    useEffect(() => {
        if (!cartLoading && contextCartItems.length === 0) {
            toast.error('Your cart is empty');
            navigate('/consumer/cart');
            return;
        }
        setCart(contextCartItems);
        checkCartValidation();
    }, [contextCartItems, cartLoading, navigate]);

    const checkCartValidation = async () => {
        try {
            const issues = await validateCart(api);
            if (issues.length > 0) {
                setValidationIssues(issues);
                toast.warning('Some items in your cart have changed. Please review.');
            }
        } catch (error) {
            console.error('Cart validation error:', error);
        }
    };

    const handleAddressChange = (e) => {
        setDeliveryAddress({
            ...deliveryAddress,
            [e.target.name]: e.target.value,
        });
    };

    const validateAddress = () => {
        const { name, phone, street, city, state, pincode } = deliveryAddress;
        if (!name || !phone || !street || !city || !state || !pincode) {
            toast.error('Please fill all address fields');
            return false;
        }
        if (phone.length !== 10) {
            toast.error('Please enter a valid 10-digit phone number');
            return false;
        }
        if (pincode.length !== 6) {
            toast.error('Please enter a valid 6-digit pincode');
            return false;
        }
        return true;
    };

    const handleNextStep = () => {
        if (currentStep === 1 && !validateAddress()) {
            return;
        }
        setCurrentStep(currentStep + 1);
    };

    const handlePreviousStep = () => {
        setCurrentStep(currentStep - 1);
    };

    // Calculate Totals derived directly from current cart state (WYSIWYG)
    const calculateTotals = () => {
        const subtotal = cart.reduce((total, item) => {
            let price = item.consumerPrice;
            if (price === undefined || price === null) price = item.expectedPrice;

            // Handle string prices
            if (typeof price === 'string') {
                price = parseFloat(price.replace(/[^0-9.]/g, '') || 0);
            }

            return total + ((price || 0) * (item.cartQuantity || 1));
        }, 0);

        const delivery = 0; // Free delivery
        const tax = subtotal * 0.05; // 5% GST
        const total = subtotal + delivery + tax;

        return { subtotal, delivery, tax, total };
    };

    const { subtotal, delivery, tax, total } = calculateTotals();

    const handlePlaceOrder = async () => {
        if (!agreedToTerms) {
            toast.error('Please agree to terms and conditions');
            return;
        }

        // Process order with Cash on Delivery
        processOrder('cod', 'pending');
    };

    const processOrder = async (method, paymentStatus) => {
        setLoading(true);
        try {
            const orderData = {
                items: cart.map(item => ({
                    cropId: item._id,
                    quantity: item.cartQuantity,
                })),
                deliveryAddress: deliveryAddress,
                paymentMethod: method,
                paymentStatus: paymentStatus
            };

            const response = await api.post('/marketplace/orders', orderData);

            if (response.data.success) {
                toast.success('Orders placed successfully!');
                utilsClearCart();
                // Handle array of orders (bulk) or single order object
                const orders = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
                // Navigate to confirmation with orders state. 
                // Using the first order's ID for the route param to satisfy the route pattern, but state carries full list.
                navigate(`/consumer/order-confirmation/${orders[0]._id}`, { state: { orders } });
            }
        } catch (error) {
            console.error('Checkout error:', error);
            const msg = error.response?.data?.message || 'Failed to place order';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { number: 1, title: 'Delivery Address', icon: FaMapMarkerAlt },
        { number: 2, title: 'Review Order', icon: FaShoppingCart },
        { number: 3, title: 'Payment', icon: FaCreditCard },
    ];

    if (!user) return <div className="spinner"></div>;

    return (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', minHeight: '100vh', paddingTop: 'var(--spacing-8)', paddingBottom: 'var(--spacing-12)' }}>
            <div className="container" style={{ maxWidth: '1000px' }}>
                <h1 className="gradient-text mb-6">Checkout</h1>

                {/* Progress Steps */}
                <div className="card-premium mb-6">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center" style={{ flex: 1 }}>
                                <div className="flex flex-col items-center" style={{ flex: 1 }}>
                                    <div
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '50%',
                                            background: currentStep >= step.number ? 'var(--primary-green)' : 'var(--gray-200)',
                                            color: currentStep >= step.number ? 'white' : 'var(--gray-500)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 'var(--font-size-xl)',
                                            marginBottom: 'var(--spacing-2)',
                                            transition: 'all 0.3s ease',
                                        }}
                                    >
                                        {currentStep > step.number ? <FaCheckCircle /> : <step.icon />}
                                    </div>
                                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: currentStep === step.number ? 600 : 400, color: currentStep >= step.number ? 'var(--primary-green)' : 'var(--gray-500)' }}>
                                        {step.title}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div style={{ flex: 1, height: '2px', background: currentStep > step.number ? 'var(--primary-green)' : 'var(--gray-200)', marginTop: '-30px' }} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div style={{ gridColumn: 'span 2' }}>
                        {currentStep === 1 && (
                            <div className="card-premium">
                                <h2 style={{ marginBottom: 'var(--spacing-4)' }}>Delivery Address</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="form-label">Full Name *</label>
                                        <input type="text" name="name" className="form-input" value={deliveryAddress.name} onChange={handleAddressChange} required />
                                    </div>
                                    <div>
                                        <label className="form-label">Phone Number *</label>
                                        <input type="tel" name="phone" className="form-input" value={deliveryAddress.phone} onChange={handleAddressChange} maxLength="10" required />
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label className="form-label">Street Address *</label>
                                        <input type="text" name="street" className="form-input" value={deliveryAddress.street} onChange={handleAddressChange} placeholder="House no., Building name, Street" required />
                                    </div>
                                    <div>
                                        <label className="form-label">City *</label>
                                        <input type="text" name="city" className="form-input" value={deliveryAddress.city} onChange={handleAddressChange} required />
                                    </div>
                                    <div>
                                        <label className="form-label">State *</label>
                                        <input type="text" name="state" className="form-input" value={deliveryAddress.state} onChange={handleAddressChange} required />
                                    </div>
                                    <div>
                                        <label className="form-label">Pincode *</label>
                                        <input type="text" name="pincode" className="form-input" value={deliveryAddress.pincode} onChange={handleAddressChange} maxLength="6" required />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button onClick={handleNextStep} className="btn btn-primary">
                                        Continue to Review <FaArrowRight />
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="card-premium">
                                <h2 style={{ marginBottom: 'var(--spacing-4)' }}>Review Your Order</h2>
                                {validationIssues.length > 0 && (
                                    <div className="alert alert-warning mb-4">
                                        <strong>Cart Issues:</strong>
                                        <ul style={{ marginTop: 'var(--spacing-2)', paddingLeft: 'var(--spacing-4)' }}>
                                            {validationIssues.map((issue, index) => (
                                                <li key={index}>{issue.productName}: {issue.message}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <div style={{ marginBottom: 'var(--spacing-4)' }}>
                                    {cart.map((item) => (
                                        <div key={item._id} className="flex gap-4 mb-4" style={{ paddingBottom: 'var(--spacing-4)', borderBottom: '1px solid var(--gray-200)' }}>
                                            <img
                                                src={item.images?.[0] || getCropImage(item.name) || '/placeholder.jpg'}
                                                alt={item.name}
                                                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                                            />
                                            <div style={{ flex: 1 }}>
                                                <h4>{item.name}</h4>
                                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Quantity: {item.cartQuantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <div style={{ fontWeight: 600 }}>
                                                    {(() => {
                                                        let price = item.consumerPrice !== undefined ? item.consumerPrice : item.expectedPrice;
                                                        if (typeof price === 'string') {
                                                            price = parseFloat(price.replace(/[^0-9.]/g, ''));
                                                        }
                                                        if (!price || isNaN(price)) price = 0;
                                                        return formatPrice(price * (item.cartQuantity || 1));
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ padding: 'var(--spacing-4)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                                    <h4 style={{ marginBottom: 'var(--spacing-2)' }}>Delivery Address</h4>
                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-700)' }}>
                                        {deliveryAddress.name}<br />{deliveryAddress.phone}<br />{deliveryAddress.street}<br />{deliveryAddress.city}, {deliveryAddress.state} - {deliveryAddress.pincode}
                                    </p>
                                </div>
                                <div className="mt-6 flex justify-between">
                                    <button onClick={handlePreviousStep} className="btn btn-outline">
                                        <FaArrowLeft /> Back
                                    </button>
                                    <button onClick={handleNextStep} className="btn btn-primary">
                                        Proceed to Payment <FaArrowRight />
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="card-premium">
                                <h2 style={{ marginBottom: 'var(--spacing-4)' }}>Payment Method</h2>
                                <div style={{ marginBottom: 'var(--spacing-4)' }}>
                                    <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer mb-3" style={{ borderColor: paymentMethod === 'cod' ? 'var(--primary-green)' : 'var(--gray-300)', background: paymentMethod === 'cod' ? 'var(--green-50)' : 'white' }}>
                                        <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} />
                                        <div>
                                            <div style={{ fontWeight: 600 }}>Cash on Delivery</div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Pay when you receive your order</div>
                                        </div>
                                    </label>
                                </div>
                                <div style={{ marginBottom: 'var(--spacing-6)' }}>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} />
                                        <span style={{ fontSize: 'var(--font-size-sm)' }}>
                                            I agree to the <a href="#" style={{ color: 'var(--primary-green)' }}>Terms and Conditions</a>
                                        </span>
                                    </label>
                                </div>
                                <div className="flex justify-between">
                                    <button onClick={handlePreviousStep} className="btn btn-outline">
                                        <FaArrowLeft /> Back
                                    </button>
                                    <button
                                        onClick={handlePlaceOrder}
                                        className="btn btn-primary btn-lg"
                                        disabled={loading || !agreedToTerms}
                                    >
                                        {loading ? <div className="spinner"></div> : 'Place Order'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    <div>
                        <div className="card-premium" style={{ position: 'sticky', top: 'var(--spacing-4)' }}>
                            <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Order Summary</h3>
                            <div style={{ marginBottom: 'var(--spacing-4)' }}>
                                <div className="flex items-center justify-between mb-3">
                                    <span style={{ color: 'var(--gray-600)' }}>Subtotal ({cart.length} items)</span>
                                    <span style={{ fontWeight: 600 }}>{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex items-center justify-between mb-3">
                                    <span style={{ color: 'var(--gray-600)' }}>Delivery</span>
                                    <span style={{ fontWeight: 600, color: delivery === 0 ? 'var(--success)' : 'inherit' }}>{delivery === 0 ? 'FREE' : formatPrice(delivery)}</span>
                                </div>
                                <div className="flex items-center justify-between mb-3">
                                    <span style={{ color: 'var(--gray-600)' }}>Tax (GST)</span>
                                    <span style={{ fontWeight: 600 }}>{formatPrice(tax)}</span>
                                </div>
                                <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: 'var(--spacing-3)', marginTop: 'var(--spacing-3)' }}>
                                    <div className="flex items-center justify-between">
                                        <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>Total</span>
                                        <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--primary-green)' }}>
                                            {formatPrice(total)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center" style={{ background: 'var(--gray-50)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-md)' }}>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>
                                    Step {currentStep} of 3
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;

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

    // Calculate Totals using utils function
    const cartTotals = getUtilsCartTotal() || { subtotal: 0, delivery: 0, tax: 0, total: 0 };
    const { subtotal, delivery, tax, total } = cartTotals;

    const handlePlaceOrder = async () => {
        if (!agreedToTerms) {
            toast.error('Please agree to terms and conditions');
            return;
        }

        if (paymentMethod === 'online') {
            // Mock Razorpay Payment Flow
            setLoading(true);
            toast.info('Opening Secure Payment Gateway...', { autoClose: 2000 });

            setTimeout(() => {
                const isSuccess = window.confirm('Mock Razorpay: Simulate Successful Payment?');

                if (isSuccess) {
                    processOrder('online', 'paid');
                } else {
                    setLoading(false);
                    toast.error('Payment Failed or Cancelled');
                }
            }, 1000);
        } else {
            // COD
            processOrder('cod', 'pending');
        }
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
                // Clear cart via context if available, else utils
                if (contextClearCart) contextClearCart();
                else utilsClearCart();

                toast.success('Order placed successfully!');
                navigate(`/consumer/order-confirmation/${response.data.data._id}`);
            }
        } catch (error) {
            console.error('Order placement error:', error);
            toast.error(error.response?.data?.message || 'Failed to place order');
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
                                            <img src={item.images?.[0] || '/placeholder.jpg'} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                                            <div style={{ flex: 1 }}>
                                                <h4>{item.name}</h4>
                                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Quantity: {item.cartQuantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <div style={{ fontWeight: 600 }}>{formatPrice(item.consumerPrice * item.cartQuantity)}</div>
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
                                    <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer" style={{ borderColor: paymentMethod === 'online' ? 'var(--primary-green)' : 'var(--gray-300)', background: paymentMethod === 'online' ? 'var(--green-50)' : 'white' }}>
                                        <input type="radio" name="paymentMethod" value="online" checked={paymentMethod === 'online'} onChange={(e) => setPaymentMethod(e.target.value)} />
                                        <div>
                                            <div style={{ fontWeight: 600 }}>Online Payment</div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Pay securely with Razorpay</div>
                                        </div>
                                    </label>
                                </div>
                                <label className="flex items-start gap-2 cursor-pointer">
                                    <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} style={{ marginTop: '4px' }} />
                                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-700)' }}>I agree to the <a href="#" style={{ color: 'var(--primary-green)' }}>Terms and Conditions</a></span>
                                </label>
                            </div>
                        )}

                        <div className="flex items-center justify-between mt-6">
                            {currentStep > 1 && (
                                <button onClick={handlePreviousStep} className="btn btn-outline" disabled={loading}><FaArrowLeft /> Previous</button>
                            )}
                            {currentStep < 3 ? (
                                <button onClick={handleNextStep} className="btn btn-primary" style={{ marginLeft: 'auto' }}>Next <FaArrowRight /></button>
                            ) : (
                                <button onClick={handlePlaceOrder} className="btn btn-primary btn-lg animate-pulse" style={{ marginLeft: 'auto' }} disabled={loading || !agreedToTerms}>
                                    {loading ? <div className="spinner" style={{ width: '20px', height: '20px' }}></div> : <>{paymentMethod === 'online' ? 'Pay with Razorpay' : 'Place Order'}</>}
                                </button>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="card-premium" style={{ position: 'sticky', top: 'var(--spacing-4)' }}>
                            <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Order Summary</h3>
                            <div style={{ marginBottom: 'var(--spacing-4)' }}>
                                <div className="flex items-center justify-between mb-3"><span style={{ color: 'var(--gray-600)' }}>Subtotal ({cart.length} items)</span><span style={{ fontWeight: 600 }}>{formatPrice(subtotal)}</span></div>
                                <div className="flex items-center justify-between mb-3"><span style={{ color: 'var(--gray-600)' }}>Delivery</span><span style={{ fontWeight: 600, color: delivery === 0 ? 'var(--success)' : 'inherit' }}>{delivery === 0 ? 'FREE' : formatPrice(delivery)}</span></div>
                                <div className="flex items-center justify-between mb-3"><span style={{ color: 'var(--gray-600)' }}>Tax (GST)</span><span style={{ fontWeight: 600 }}>{formatPrice(tax)}</span></div>
                                <div style={{ borderTop: '2px solid var(--gray-200)', paddingTop: 'var(--spacing-3)', marginTop: 'var(--spacing-3)' }}><div className="flex items-center justify-between"><span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>Total</span><span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--primary-green)' }}>{formatPrice(total)}</span></div></div>
                            </div>
                            <div className="text-center" style={{ padding: 'var(--spacing-3)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>🔒 100% Secure Payment</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;

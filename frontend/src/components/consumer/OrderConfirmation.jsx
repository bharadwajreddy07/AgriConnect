import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FaCheckCircle,
    FaShoppingBag,
    FaMapMarkerAlt,
    FaDownload,
    FaTruck,
} from 'react-icons/fa';
import api from '../../services/api';
import { formatPrice } from '../../utils/cartUtils';

const OrderConfirmation = () => {
    const { orderId } = useParams();
    const location = useLocation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (location.state?.orders) {
            setOrders(location.state.orders);
            setLoading(false);
        } else {
            loadOrder();
        }
    }, [orderId, location.state]);

    const loadOrder = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/orders/${orderId}`);
            const data = response.data.data;
            setOrders(Array.isArray(data) ? data : [data]);
        } catch (error) {
            console.error('Error loading order:', error);
            toast.error('Failed to load order details');
            navigate('/consumer/orders');
        } finally {
            setLoading(false);
        }
    };

    const getEstimatedDelivery = () => {
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 5); // 5 days from now
        return deliveryDate.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const totalAmount = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const primaryOrder = orders[0];

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: '80vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!orders.length) {
        return null;
    }

    return (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', minHeight: '100vh', paddingTop: 'var(--spacing-8)', paddingBottom: 'var(--spacing-12)' }}>
            <div className="container" style={{ maxWidth: '800px' }}>
                {/* Success Message */}
                <div className="card-premium text-center mb-6" style={{ padding: 'var(--spacing-8)' }}>
                    <div
                        className="animate-bounce"
                        style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'var(--success)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '3rem',
                            margin: '0 auto var(--spacing-4)',
                        }}
                    >
                        <FaCheckCircle />
                    </div>
                    <h1 className="gradient-text mb-3">Order Placed Successfully!</h1>
                    <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-2)' }}>
                        Thank you for your order
                    </p>
                    <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, color: 'var(--primary-green)' }}>
                        {orders.length > 1 ? `${orders.length} Orders Placed` : `Order #${primaryOrder.orderNumber}`}
                    </div>
                </div>

                {/* Display each order or a summary list */}
                {orders.map(order => (
                    <div key={order._id} className="card-premium mb-6">
                        <div className="flex justify-between items-center mb-4" style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                            <h3>Order #{order.orderNumber}</h3>
                            <span className="badge" style={{ background: 'var(--success)', color: 'white' }}>{order.orderStatus}</span>
                        </div>

                        {/* Items */}
                        <div style={{ marginBottom: 'var(--spacing-4)' }}>
                            <div className="flex gap-4 mb-4">
                                <img
                                    src={order.crop?.images?.[0] || '/placeholder.jpg'}
                                    alt={order.crop?.name}
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        objectFit: 'cover',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                />
                                <div style={{ flex: 1 }}>
                                    <h4>{order.crop?.name}</h4>
                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                        Quantity: {order.quantity?.value} {order.quantity?.unit}
                                    </p>
                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                        Farmer: {order.farmer?.name}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div style={{ fontWeight: 600 }}>
                                        {formatPrice(order.totalAmount)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Total Summary */}
                <div className="card-premium mb-6">
                    <div style={{ padding: 'var(--spacing-4)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                        <div className="flex items-center justify-between mb-2">
                            <span>Total Amount Paid</span>
                            <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--primary-green)' }}>
                                {formatPrice(totalAmount)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                Payment Method
                            </span>
                            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                                {primaryOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Delivery Information (Using primary order for address as they are same for bulk) */}
                <div className="card-premium mb-6">
                    <div className="flex items-start gap-3 mb-4">
                        <FaMapMarkerAlt style={{ color: 'var(--primary-green)', fontSize: 'var(--font-size-xl)', marginTop: '4px' }} />
                        <div>
                            <h3 style={{ marginBottom: 'var(--spacing-2)' }}>Delivery Address</h3>
                            <p style={{ color: 'var(--gray-700)', lineHeight: 1.6 }}>
                                {primaryOrder.deliveryAddress.name}<br />
                                {primaryOrder.deliveryAddress.phone}<br />
                                {primaryOrder.deliveryAddress.street}<br />
                                {primaryOrder.deliveryAddress.city}, {primaryOrder.deliveryAddress.state} - {primaryOrder.deliveryAddress.pincode}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <FaTruck style={{ color: 'var(--primary-green)', fontSize: 'var(--font-size-xl)', marginTop: '4px' }} />
                        <div>
                            <h3 style={{ marginBottom: 'var(--spacing-2)' }}>Estimated Delivery</h3>
                            <p style={{ color: 'var(--gray-700)', fontWeight: 600 }}>
                                {getEstimatedDelivery()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-4">
                    <Link
                        to={`/consumer/orders/${primaryOrder._id}`}
                        className="btn btn-primary"
                    >
                        <FaTruck /> Track Order
                    </Link>
                    <Link
                        to="/consumer/products"
                        className="btn btn-outline"
                    >
                        <FaShoppingBag /> Continue Shopping
                    </Link>
                </div>

                {/* Order Confirmation Email Notice */}
                <div className="text-center mt-6" style={{ padding: 'var(--spacing-4)', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)' }}>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                        📧 Order confirmation has been sent to your email
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;

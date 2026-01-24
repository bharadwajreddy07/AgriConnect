import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadOrder();
    }, [orderId]);

    const loadOrder = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/marketplace/orders/${orderId}/track`);
            setOrder(response.data.data);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: '80vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!order) {
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
                        Order #{order.orderNumber}
                    </div>
                </div>

                {/* Order Details */}
                <div className="card-premium mb-6">
                    <h2 style={{ marginBottom: 'var(--spacing-4)' }}>Order Details</h2>

                    {/* Items */}
                    <div style={{ marginBottom: 'var(--spacing-4)' }}>
                        {order.items.map((item) => (
                            <div
                                key={item._id}
                                className="flex gap-4 mb-4"
                                style={{ paddingBottom: 'var(--spacing-4)', borderBottom: '1px solid var(--gray-200)' }}
                            >
                                <img
                                    src={item.crop?.images?.[0] || '/placeholder.jpg'}
                                    alt={item.crop?.name}
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        objectFit: 'cover',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                />
                                <div style={{ flex: 1 }}>
                                    <h4>{item.crop?.name}</h4>
                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                        Quantity: {item.quantity}
                                    </p>
                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                        Farmer: {item.farmer?.name}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div style={{ fontWeight: 600 }}>
                                        {formatPrice(item.total)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Price Summary */}
                    <div style={{ padding: 'var(--spacing-4)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                        <div className="flex items-center justify-between mb-2">
                            <span>Total Amount</span>
                            <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--primary-green)' }}>
                                {formatPrice(order.totalAmount)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                Payment Method
                            </span>
                            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Delivery Information */}
                <div className="card-premium mb-6">
                    <div className="flex items-start gap-3 mb-4">
                        <FaMapMarkerAlt style={{ color: 'var(--primary-green)', fontSize: 'var(--font-size-xl)', marginTop: '4px' }} />
                        <div>
                            <h3 style={{ marginBottom: 'var(--spacing-2)' }}>Delivery Address</h3>
                            <p style={{ color: 'var(--gray-700)', lineHeight: 1.6 }}>
                                {order.deliveryAddress.name}<br />
                                {order.deliveryAddress.phone}<br />
                                {order.deliveryAddress.street}<br />
                                {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
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
                        to={`/consumer/orders/${order._id}`}
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

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FaCheckCircle,
    FaClock,
    FaBox,
    FaTruck,
    FaHome,
    FaTimesCircle,
    FaPhone,
    FaChevronDown,
    FaChevronUp,
} from 'react-icons/fa';
import api from '../../services/api';
import { formatPrice } from '../../utils/cartUtils';

const OrderTracking = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        loadOrder();
        // Poll for updates every 30 seconds
        const interval = setInterval(loadOrder, 30000);
        return () => clearInterval(interval);
    }, [orderId]);

    const loadOrder = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/marketplace/orders/${orderId}/track`);
            setOrder(response.data.data);
        } catch (error) {
            console.error('Error loading order:', error);
            toast.error('Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const getStatusSteps = () => {
        return [
            { key: 'placed', label: 'Order Placed', icon: FaCheckCircle },
            { key: 'confirmed', label: 'Confirmed', icon: FaCheckCircle },
            { key: 'processing', label: 'Processing', icon: FaBox },
            { key: 'packed', label: 'Packed', icon: FaBox },
            { key: 'shipped', label: 'Shipped', icon: FaTruck },
            { key: 'out_for_delivery', label: 'Out for Delivery', icon: FaTruck },
            { key: 'delivered', label: 'Delivered', icon: FaHome },
        ];
    };

    const getCurrentStepIndex = () => {
        const steps = getStatusSteps();
        const currentIndex = steps.findIndex(step => step.key === order?.orderStatus);
        return currentIndex >= 0 ? currentIndex : 0;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
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
        return (
            <div className="container" style={{ paddingTop: 'var(--spacing-8)' }}>
                <div className="card-premium text-center">
                    <h2>Order Not Found</h2>
                    <Link to="/consumer/orders" className="btn btn-primary mt-4">
                        View All Orders
                    </Link>
                </div>
            </div>
        );
    }

    const steps = getStatusSteps();
    const currentStepIndex = getCurrentStepIndex();
    const isCancelled = order.orderStatus === 'cancelled';

    return (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', minHeight: '100vh', paddingTop: 'var(--spacing-8)', paddingBottom: 'var(--spacing-12)' }}>
            <div className="container" style={{ maxWidth: '1000px' }}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="gradient-text">Track Order</h1>
                        <p style={{ color: 'var(--gray-600)' }}>Order #{order.orderNumber}</p>
                    </div>
                    <Link to="/consumer/orders" className="btn btn-outline">
                        All Orders
                    </Link>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {/* Tracking Timeline */}
                    <div style={{ gridColumn: 'span 2' }}>
                        <div className="card-premium">
                            <h2 style={{ marginBottom: 'var(--spacing-6)' }}>
                                {isCancelled ? 'Order Cancelled' : 'Delivery Status'}
                            </h2>

                            {isCancelled ? (
                                <div className="text-center" style={{ padding: 'var(--spacing-6)' }}>
                                    <FaTimesCircle style={{ fontSize: '4rem', color: 'var(--error)', marginBottom: 'var(--spacing-4)' }} />
                                    <h3 style={{ color: 'var(--error)', marginBottom: 'var(--spacing-2)' }}>
                                        Order Cancelled
                                    </h3>
                                    {order.cancellationReason && (
                                        <p style={{ color: 'var(--gray-600)' }}>
                                            Reason: {order.cancellationReason}
                                        </p>
                                    )}
                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)', marginTop: 'var(--spacing-2)' }}>
                                        Cancelled on {formatDate(order.cancelledAt)}
                                    </p>
                                </div>
                            ) : (
                                <div style={{ position: 'relative' }}>
                                    {/* Progress Line */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            left: '24px',
                                            top: '24px',
                                            bottom: '24px',
                                            width: '2px',
                                            background: 'var(--gray-200)',
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: '100%',
                                                height: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
                                                background: 'var(--primary-green)',
                                                transition: 'height 0.5s ease',
                                            }}
                                        />
                                    </div>

                                    {/* Status Steps */}
                                    {steps.map((step, index) => {
                                        const isCompleted = index <= currentStepIndex;
                                        const isCurrent = index === currentStepIndex;
                                        const StepIcon = step.icon;

                                        return (
                                            <div
                                                key={step.key}
                                                className="flex items-start gap-4 mb-6"
                                                style={{ position: 'relative' }}
                                            >
                                                {/* Icon */}
                                                <div
                                                    style={{
                                                        width: '48px',
                                                        height: '48px',
                                                        borderRadius: '50%',
                                                        background: isCompleted ? 'var(--primary-green)' : 'var(--gray-200)',
                                                        color: isCompleted ? 'white' : 'var(--gray-500)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: 'var(--font-size-xl)',
                                                        position: 'relative',
                                                        zIndex: 1,
                                                        transition: 'all 0.3s ease',
                                                        transform: isCurrent ? 'scale(1.1)' : 'scale(1)',
                                                    }}
                                                >
                                                    {isCurrent ? <FaClock className="animate-pulse" /> : <StepIcon />}
                                                </div>

                                                {/* Content */}
                                                <div style={{ flex: 1, paddingTop: '8px' }}>
                                                    <h4
                                                        style={{
                                                            marginBottom: 'var(--spacing-1)',
                                                            color: isCompleted ? 'var(--primary-green)' : 'var(--gray-500)',
                                                            fontWeight: isCurrent ? 700 : 600,
                                                        }}
                                                    >
                                                        {step.label}
                                                    </h4>
                                                    {isCompleted && (
                                                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                                            {step.key === 'placed' && order.createdAt && formatDate(order.createdAt)}
                                                            {step.key === 'confirmed' && order.confirmedAt && formatDate(order.confirmedAt)}
                                                            {step.key === 'shipped' && order.shippedAt && formatDate(order.shippedAt)}
                                                            {step.key === 'delivered' && order.deliveredAt && formatDate(order.deliveredAt)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Tracking Info */}
                            {order.trackingInfo?.trackingNumber && (
                                <div style={{ marginTop: 'var(--spacing-6)', padding: 'var(--spacing-4)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                                    <h4 style={{ marginBottom: 'var(--spacing-2)' }}>Tracking Information</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                                Courier
                                            </p>
                                            <p style={{ fontWeight: 600 }}>{order.trackingInfo.courierName}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                                Tracking Number
                                            </p>
                                            <p style={{ fontWeight: 600 }}>{order.trackingInfo.trackingNumber}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Order Details Accordion */}
                        <div className="card-premium mt-6">
                            <button
                                onClick={() => setShowDetails(!showDetails)}
                                className="flex items-center justify-between w-full"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            >
                                <h3>Order Details</h3>
                                {showDetails ? <FaChevronUp /> : <FaChevronDown />}
                            </button>

                            {showDetails && (
                                <div style={{ marginTop: 'var(--spacing-4)' }}>
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
                                                    width: '60px',
                                                    height: '60px',
                                                    objectFit: 'cover',
                                                    borderRadius: 'var(--radius-md)',
                                                }}
                                            />
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ fontSize: 'var(--font-size-base)' }}>{item.crop?.name}</h4>
                                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                                    Qty: {item.quantity} × {formatPrice(item.price)}
                                                </p>
                                            </div>
                                            <div style={{ fontWeight: 600 }}>
                                                {formatPrice(item.total)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div>
                        {/* Delivery Address */}
                        <div className="card-premium mb-6">
                            <h3 style={{ marginBottom: 'var(--spacing-3)' }}>Delivery Address</h3>
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-700)', lineHeight: 1.6 }}>
                                {order.deliveryAddress.name}<br />
                                {order.deliveryAddress.phone}<br />
                                {order.deliveryAddress.street}<br />
                                {order.deliveryAddress.city}, {order.deliveryAddress.state}<br />
                                {order.deliveryAddress.pincode}
                            </p>
                        </div>

                        {/* Order Summary */}
                        <div className="card-premium mb-6">
                            <h3 style={{ marginBottom: 'var(--spacing-3)' }}>Order Summary</h3>
                            <div className="flex items-center justify-between mb-2">
                                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                    Total Amount
                                </span>
                                <span style={{ fontWeight: 700, color: 'var(--primary-green)' }}>
                                    {formatPrice(order.totalAmount)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                    Payment
                                </span>
                                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                                    {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                    Status
                                </span>
                                <span
                                    className="badge"
                                    style={{
                                        background: order.paymentStatus === 'paid' ? 'var(--success)' : 'var(--warning)',
                                        color: 'white',
                                    }}
                                >
                                    {order.paymentStatus}
                                </span>
                            </div>
                        </div>

                        {/* Contact Support */}
                        <div className="card-premium">
                            <h3 style={{ marginBottom: 'var(--spacing-3)' }}>Need Help?</h3>
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-3)' }}>
                                Contact us for any queries about your order
                            </p>
                            <a href="tel:+911234567890" className="btn btn-outline" style={{ width: '100%' }}>
                                <FaPhone /> Contact Support
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;

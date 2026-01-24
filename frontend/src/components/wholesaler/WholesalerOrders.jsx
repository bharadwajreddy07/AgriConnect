import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FaBox,
    FaTruck,
    FaCheckCircle,
    FaTimesCircle,
    FaSearch,
    FaPhone,
    FaMapMarkerAlt,
} from 'react-icons/fa';
import api from '../../services/api';
import { formatPrice } from '../../utils/cartUtils';

const WholesalerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const response = await api.get('/orders/wholesaler');
            setOrders(response.data.data || []);
        } catch (error) {
            console.error('Error loading orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) {
            return;
        }

        try {
            await api.put(`/orders/wholesaler/${orderId}/cancel`);
            toast.success('Order cancelled successfully');
            loadOrders();
        } catch (error) {
            console.error('Error cancelling order:', error);
            toast.error('Failed to cancel order');
        }
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'delivered':
                return 'var(--success)';
            case 'shipped':
            case 'in_transit':
                return 'var(--primary-green)';
            case 'cancelled':
                return 'var(--error)';
            default:
                return 'var(--warning)';
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const filteredOrders = orders.filter(order => {
        // Status filter
        if (filter === 'active' && ['delivered', 'cancelled'].includes(order.orderStatus)) {
            return false;
        }
        if (filter === 'delivered' && order.orderStatus !== 'delivered') {
            return false;
        }
        if (filter === 'cancelled' && order.orderStatus !== 'cancelled') {
            return false;
        }

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                order.orderNumber?.toLowerCase().includes(query) ||
                order.crop?.name?.toLowerCase().includes(query) ||
                order.farmer?.name?.toLowerCase().includes(query)
            );
        }

        return true;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: '80vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', minHeight: '100vh', paddingTop: 'var(--spacing-8)', paddingBottom: 'var(--spacing-12)' }}>
            <div className="container">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="gradient-text">My Orders</h1>
                    <p style={{ color: 'var(--gray-600)' }}>
                        {orders.length} {orders.length === 1 ? 'order' : 'orders'} total
                    </p>
                </div>

                {/* Filters */}
                <div className="card-premium mb-6">
                    <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
                        {/* Search */}
                        <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                            <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search by order number, crop, or farmer..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ paddingLeft: '2.5rem' }}
                            />
                        </div>

                        {/* Status Filters */}
                        <div className="flex gap-2">
                            {['all', 'active', 'delivered', 'cancelled'].map((filterOption) => (
                                <button
                                    key={filterOption}
                                    onClick={() => setFilter(filterOption)}
                                    className={`btn ${filter === filterOption ? 'btn-primary' : 'btn-outline'}`}
                                    style={{ textTransform: 'capitalize' }}
                                >
                                    {filterOption}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="card-premium text-center" style={{ padding: 'var(--spacing-12)' }}>
                        <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-4)' }}>📦</div>
                        <h3>No orders found</h3>
                        <p style={{ color: 'var(--gray-600)' }}>
                            {searchQuery ? 'Try adjusting your search' : 'You haven\'t placed any orders yet'}
                        </p>
                        {!searchQuery && (
                            <Link to="/wholesaler/marketplace" className="btn btn-primary mt-4">
                                Browse Crops
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredOrders.map((order) => (
                            <div key={order._id} className="card-premium">
                                <div className="flex gap-4">
                                    {/* Crop Image */}
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
                                            src={order.crop?.images?.[0] || '/placeholder.jpg'}
                                            alt={order.crop?.name}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                            }}
                                        />
                                    </div>

                                    {/* Order Details */}
                                    <div style={{ flex: 1 }}>
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 0 }}>
                                                        Order #{order.orderNumber}
                                                    </h3>
                                                    <span
                                                        className="badge"
                                                        style={{
                                                            background: getStatusBadgeColor(order.orderStatus),
                                                            color: 'white',
                                                        }}
                                                    >
                                                        {order.orderStatus.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                                    Placed on {formatDate(order.createdAt)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--primary-green)' }}>
                                                    {formatPrice(order.totalAmount)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Crop Info */}
                                        <div style={{ marginBottom: 'var(--spacing-3)', padding: 'var(--spacing-2)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                                            <p style={{ fontWeight: 600, marginBottom: 'var(--spacing-1)' }}>
                                                {order.crop?.name}
                                            </p>
                                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                                Quantity: {order.quantity?.value} {order.quantity?.unit} •
                                                Price: {formatPrice(order.agreedPrice)} per {order.quantity?.unit}
                                            </p>
                                        </div>

                                        {/* Farmer Info */}
                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                            <div style={{ padding: 'var(--spacing-2)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-1)' }}>
                                                    Farmer
                                                </p>
                                                <p style={{ fontWeight: 600 }}>{order.farmer?.name}</p>
                                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                                                    <FaPhone style={{ marginRight: '4px' }} />
                                                    {order.farmer?.phone}
                                                </p>
                                            </div>
                                            <div style={{ padding: 'var(--spacing-2)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-1)' }}>
                                                    Delivery Address
                                                </p>
                                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-700)' }}>
                                                    <FaMapMarkerAlt style={{ marginRight: '4px' }} />
                                                    {order.deliveryAddress?.city}, {order.deliveryAddress?.state}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Delivery Info */}
                                        {order.deliverySchedule?.estimatedDate && (
                                            <div style={{ marginBottom: 'var(--spacing-3)', padding: 'var(--spacing-2)', background: 'var(--blue-50)', borderRadius: 'var(--radius-md)' }}>
                                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                                                    Estimated Delivery: {formatDate(order.deliverySchedule.estimatedDate)}
                                                </p>
                                                {order.deliverySchedule.trackingInfo?.trackingNumber && (
                                                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-700)' }}>
                                                        Tracking: {order.deliverySchedule.trackingInfo.carrier} - {order.deliverySchedule.trackingInfo.trackingNumber}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <Link
                                                to={`/wholesaler/orders/${order._id}`}
                                                className="btn btn-outline btn-sm"
                                            >
                                                View Details
                                            </Link>
                                            {!['delivered', 'cancelled'].includes(order.orderStatus) && (
                                                <button
                                                    onClick={() => handleCancelOrder(order._id)}
                                                    className="btn btn-sm"
                                                    style={{ background: 'var(--error)', color: 'white' }}
                                                >
                                                    Cancel Order
                                                </button>
                                            )}
                                            <a
                                                href={`tel:${order.farmer?.phone}`}
                                                className="btn btn-outline btn-sm"
                                            >
                                                <FaPhone /> Contact Farmer
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WholesalerOrders;

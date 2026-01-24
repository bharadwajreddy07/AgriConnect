import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FaBox,
    FaTruck,
    FaCheckCircle,
    FaTimesCircle,
    FaEye,
    FaSearch,
} from 'react-icons/fa';
import api from '../../services/api';
import { formatPrice } from '../../utils/cartUtils';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, active, delivered, cancelled
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const response = await api.get('/marketplace/orders');
            setOrders(response.data.data || []);
        } catch (error) {
            console.error('Error loading orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered':
                return <FaCheckCircle style={{ color: 'var(--success)' }} />;
            case 'cancelled':
                return <FaTimesCircle style={{ color: 'var(--error)' }} />;
            case 'shipped':
            case 'out_for_delivery':
                return <FaTruck style={{ color: 'var(--primary-green)' }} />;
            default:
                return <FaBox style={{ color: 'var(--warning)' }} />;
        }
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'delivered':
                return 'var(--success)';
            case 'cancelled':
                return 'var(--error)';
            case 'shipped':
            case 'out_for_delivery':
                return 'var(--primary-green)';
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
        // Filter by status
        if (filter === 'active' && ['delivered', 'cancelled'].includes(order.orderStatus)) {
            return false;
        }
        if (filter === 'delivered' && order.orderStatus !== 'delivered') {
            return false;
        }
        if (filter === 'cancelled' && order.orderStatus !== 'cancelled') {
            return false;
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesOrderNumber = order.orderNumber.toLowerCase().includes(query);
            const matchesProduct = order.items.some(item =>
                item.crop?.name?.toLowerCase().includes(query)
            );
            return matchesOrderNumber || matchesProduct;
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
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="gradient-text">My Orders</h1>
                        <p style={{ color: 'var(--gray-600)' }}>
                            {orders.length} {orders.length === 1 ? 'order' : 'orders'} total
                        </p>
                    </div>
                    <Link to="/consumer/products" className="btn btn-primary">
                        Continue Shopping
                    </Link>
                </div>

                {/* Filters and Search */}
                <div className="card-premium mb-6">
                    <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
                        {/* Search */}
                        <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                            <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search by order number or product..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ paddingLeft: '2.5rem' }}
                            />
                        </div>

                        {/* Filter Buttons */}
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
                        <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--spacing-6)' }}>
                            {searchQuery ? 'Try adjusting your search' : 'Start shopping to see your orders here'}
                        </p>
                        <Link to="/consumer/products" className="btn btn-primary">
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredOrders.map((order) => (
                            <div key={order._id} className="card-premium hover-3d">
                                <div className="flex gap-4">
                                    {/* Order Image (First Item) */}
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
                                            src={order.items[0]?.crop?.images?.[0] || '/placeholder.jpg'}
                                            alt={order.items[0]?.crop?.name}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                            }}
                                        />
                                    </div>

                                    {/* Order Details */}
                                    <div style={{ flex: 1 }}>
                                        <div className="flex items-start justify-between mb-2">
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
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                                                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Items Preview */}
                                        <div style={{ marginBottom: 'var(--spacing-3)' }}>
                                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-700)' }}>
                                                {order.items.slice(0, 2).map((item, index) => (
                                                    <span key={item._id}>
                                                        {item.crop?.name}
                                                        {index < Math.min(order.items.length, 2) - 1 && ', '}
                                                    </span>
                                                ))}
                                                {order.items.length > 2 && (
                                                    <span style={{ color: 'var(--gray-500)' }}>
                                                        {' '}and {order.items.length - 2} more
                                                    </span>
                                                )}
                                            </p>
                                        </div>

                                        {/* Delivery Address */}
                                        <div style={{ padding: 'var(--spacing-2)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-3)' }}>
                                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-1)' }}>
                                                Delivery Address
                                            </p>
                                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-700)' }}>
                                                {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <Link
                                                to={`/consumer/orders/${order._id}`}
                                                className="btn btn-primary btn-sm"
                                            >
                                                <FaEye /> Track Order
                                            </Link>
                                            {order.orderStatus === 'delivered' && (
                                                <button className="btn btn-outline btn-sm">
                                                    Reorder
                                                </button>
                                            )}
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

export default MyOrders;

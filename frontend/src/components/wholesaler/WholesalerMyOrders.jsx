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
    FaMoneyBillWave,
    FaShoppingCart,
    FaChartLine,
} from 'react-icons/fa';
import api from '../../services/api';
import { formatPrice } from '../../utils/cartUtils';

const WholesalerMyOrders = () => {
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
            const response = await api.get('/wholesale-orders');
            setOrders(response.data.data || []);
        } catch (error) {
            console.error('Error loading orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    // Calculate statistics
    const stats = {
        totalSpent: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
        totalOrders: orders.length,
        activeOrders: orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length,
        deliveredOrders: orders.filter(o => o.status === 'delivered').length,
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered':
                return <FaCheckCircle style={{ color: 'var(--success)' }} />;
            case 'cancelled':
                return <FaTimesCircle style={{ color: 'var(--error)' }} />;
            case 'shipped':
            case 'in_transit':
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
            case 'in_transit':
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
        if (filter === 'active' && ['delivered', 'cancelled'].includes(order.status)) {
            return false;
        }
        if (filter === 'delivered' && order.status !== 'delivered') {
            return false;
        }
        if (filter === 'cancelled' && order.status !== 'cancelled') {
            return false;
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesOrderNumber = order.orderNumber?.toLowerCase().includes(query);
            const matchesCrop = order.crop?.name?.toLowerCase().includes(query);
            const matchesFarmer = order.farmer?.name?.toLowerCase().includes(query);
            return matchesOrderNumber || matchesCrop || matchesFarmer;
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
        <div style={{ background: 'var(--gray-50)', minHeight: '100vh', paddingTop: 'var(--spacing-8)', paddingBottom: 'var(--spacing-12)' }}>
            <div className="container">
                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="card-premium" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
                        <div className="flex items-center gap-3">
                            <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <FaMoneyBillWave size={24} />
                            </div>
                            <div>
                                <p style={{ fontSize: 'var(--font-size-xs)', opacity: 0.9, marginBottom: 'var(--spacing-1)' }}>Total Spent</p>
                                <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, margin: 0 }}>
                                    {formatPrice(stats.totalSpent)}
                                </h3>
                            </div>
                        </div>
                    </div>

                    <div className="card-premium">
                        <div className="flex items-center gap-3">
                            <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                background: 'var(--blue-100)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--accent-blue)',
                            }}>
                                <FaShoppingCart size={20} />
                            </div>
                            <div>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-1)' }}>Total Orders</p>
                                <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, margin: 0 }}>{stats.totalOrders}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="card-premium">
                        <div className="flex items-center gap-3">
                            <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                background: 'var(--orange-100)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--warning)',
                            }}>
                                <FaTruck size={20} />
                            </div>
                            <div>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-1)' }}>Active</p>
                                <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, margin: 0 }}>{stats.activeOrders}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="card-premium">
                        <div className="flex items-center gap-3">
                            <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                background: 'var(--green-100)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--success)',
                            }}>
                                <FaCheckCircle size={20} />
                            </div>
                            <div>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-1)' }}>Delivered</p>
                                <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, margin: 0 }}>{stats.deliveredOrders}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="gradient-text">My Orders</h1>
                        <p style={{ color: 'var(--gray-600)' }}>
                            Track and manage your wholesale orders
                        </p>
                    </div>
                    <Link to="/wholesaler/marketplace" className="btn btn-primary">
                        Continue Shopping
                    </Link>
                </div>

                {/* Filters and Search */}
                <div className="card-premium mb-6">
                    <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
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
                        <Link to="/wholesaler/marketplace" className="btn btn-primary">
                            Browse Marketplace
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredOrders.map((order) => (
                            <div key={order._id} className="card-premium hover-3d">
                                <div className="flex gap-4">
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
                                                            background: getStatusBadgeColor(order.status),
                                                            color: 'white',
                                                        }}
                                                    >
                                                        {order.status.replace('_', ' ')}
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
                                                    {order.quantity?.value} {order.quantity?.unit}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: 'var(--spacing-3)' }}>
                                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-700)' }}>
                                                <strong>{order.crop?.name}</strong> from {order.farmer?.name}
                                            </p>
                                        </div>

                                        <div style={{ padding: 'var(--spacing-2)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-3)' }}>
                                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-1)' }}>
                                                Delivery Address
                                            </p>
                                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-700)' }}>
                                                {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}
                                            </p>
                                        </div>

                                        <div className="flex gap-2">
                                            <Link
                                                to={`/wholesaler/orders/${order._id}`}
                                                className="btn btn-primary btn-sm"
                                            >
                                                <FaEye /> Track Order
                                            </Link>
                                            {order.status === 'delivered' && (
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

export default WholesalerMyOrders;

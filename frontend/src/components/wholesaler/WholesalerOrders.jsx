import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { formatPrice } from '../../utils/cartUtils';
import { FaBox, FaEye, FaTruck, FaCheckCircle } from 'react-icons/fa';

const WholesalerOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

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
            // Set empty orders array
            setOrders([]);
            // Only show error if it's not a 404 or network issue
            if (error.response && error.response.status !== 404) {
                toast.error('Unable to load orders. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: '#f59e0b',
            confirmed: '#3b82f6',
            processing: '#8b5cf6',
            shipped: '#06b6d4',
            delivered: '#10b981',
            cancelled: '#ef4444',
        };
        return colors[status] || '#6b7280';
    };

    const getStatusBg = (status) => {
        const colors = {
            pending: '#fef3c7',
            confirmed: '#dbeafe',
            processing: '#ede9fe',
            shipped: '#cffafe',
            delivered: '#d1fae5',
            cancelled: '#fee2e2',
        };
        return colors[status] || '#f3f4f6';
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        return order.status === filter;
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
            <div className="container" style={{ maxWidth: '1200px' }}>
                <div className="mb-6">
                    <h1 className="gradient-text">
                        <FaBox style={{ display: 'inline', marginRight: 'var(--spacing-2)' }} />
                        My Wholesale Orders
                    </h1>
                    <p style={{ color: 'var(--gray-600)' }}>
                        Track and manage your bulk purchase orders
                    </p>
                </div>

                {/* Filters */}
                <div className="card-premium mb-6">
                    <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
                        <button
                            onClick={() => setFilter('all')}
                            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'} btn-sm`}
                        >
                            All Orders ({orders.length})
                        </button>
                        <button
                            onClick={() => setFilter('pending')}
                            className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline'} btn-sm`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setFilter('confirmed')}
                            className={`btn ${filter === 'confirmed' ? 'btn-primary' : 'btn-outline'} btn-sm`}
                        >
                            Confirmed
                        </button>
                        <button
                            onClick={() => setFilter('shipped')}
                            className={`btn ${filter === 'shipped' ? 'btn-primary' : 'btn-outline'} btn-sm`}
                        >
                            Shipped
                        </button>
                        <button
                            onClick={() => setFilter('delivered')}
                            className={`btn ${filter === 'delivered' ? 'btn-primary' : 'btn-outline'} btn-sm`}
                        >
                            Delivered
                        </button>
                    </div>
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="card-premium text-center" style={{ padding: 'var(--spacing-12)' }}>
                        <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-4)' }}>📦</div>
                        <h3>No Orders Found</h3>
                        <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--spacing-4)' }}>
                            {filter === 'all'
                                ? 'You haven\'t placed any orders yet'
                                : `No ${filter} orders`
                            }
                        </p>
                        <button onClick={() => navigate('/wholesaler/marketplace')} className="btn btn-primary">
                            Browse Marketplace
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredOrders.map((order) => (
                            <div key={order._id} className="card-premium">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 style={{ marginBottom: 'var(--spacing-1)' }}>
                                            Order #{order.orderNumber}
                                        </h3>
                                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: 'var(--radius-md)',
                                            fontSize: 'var(--font-size-sm)',
                                            fontWeight: 600,
                                            background: getStatusBg(order.status),
                                            color: getStatusColor(order.status),
                                            textTransform: 'capitalize',
                                        }}
                                    >
                                        {order.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-4" style={{ padding: 'var(--spacing-3)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                                    <div>
                                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-1)' }}>
                                            Crop
                                        </p>
                                        <p style={{ fontWeight: 600 }}>{order.crop?.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-1)' }}>
                                            Farmer
                                        </p>
                                        <p style={{ fontWeight: 600 }}>{order.farmer?.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-1)' }}>
                                            Quantity
                                        </p>
                                        <p style={{ fontWeight: 600 }}>
                                            {order.quantity?.value} {order.quantity?.unit}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div>
                                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                            Total Amount
                                        </p>
                                        <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--primary-green)' }}>
                                            {formatPrice(order.totalAmount)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/wholesaler/orders/${order._id}`)}
                                        className="btn btn-outline"
                                    >
                                        <FaEye /> View Details
                                    </button>
                                </div>

                                {order.status === 'delivered' && (
                                    <div style={{ marginTop: 'var(--spacing-3)', padding: 'var(--spacing-3)', background: 'var(--green-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--green-200)' }}>
                                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--green-700)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                                            <FaCheckCircle /> Order delivered successfully!
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WholesalerOrders;

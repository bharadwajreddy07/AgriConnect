import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaCalendar, FaFilter, FaDownload } from 'react-icons/fa';

const WholesalerInvestments = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [stats, setStats] = useState({
        totalSpent: 0,
        directPurchases: 0,
        negotiatedOrders: 0,
        orderCount: 0,
    });

    useEffect(() => {
        loadOrders();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [dateFilter, typeFilter, orders]);

    const loadOrders = async () => {
        try {
            const response = await api.get('/wholesale-orders');
            const orderData = response.data.data || [];
            setOrders(orderData);
            calculateStats(orderData);
        } catch (error) {
            toast.error('Failed to load investment data');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (orderData) => {
        const totalSpent = orderData.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const directPurchases = orderData.filter(o => !o.negotiation).reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const negotiatedOrders = orderData.filter(o => o.negotiation).reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        setStats({
            totalSpent,
            directPurchases,
            negotiatedOrders,
            orderCount: orderData.length,
        });
    };

    const applyFilters = () => {
        let filtered = [...orders];

        // Date filter
        if (dateFilter !== 'all') {
            const now = new Date();
            const filterDate = new Date();

            switch (dateFilter) {
                case '7days':
                    filterDate.setDate(now.getDate() - 7);
                    break;
                case '30days':
                    filterDate.setDate(now.getDate() - 30);
                    break;
                case '90days':
                    filterDate.setDate(now.getDate() - 90);
                    break;
            }

            filtered = filtered.filter(order => new Date(order.createdAt) >= filterDate);
        }

        // Type filter
        if (typeFilter !== 'all') {
            if (typeFilter === 'direct') {
                filtered = filtered.filter(order => !order.negotiation);
            } else if (typeFilter === 'negotiated') {
                filtered = filtered.filter(order => order.negotiation);
            }
        }

        setFilteredOrders(filtered);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: '80vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="container" style={{ marginTop: 'var(--spacing-8)', marginBottom: 'var(--spacing-8)' }}>
            {/* Header */}
            <div style={{ marginBottom: 'var(--spacing-6)' }}>
                <button
                    onClick={() => navigate('/wholesaler')}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary-green)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-2)',
                        fontSize: 'var(--font-size-sm)',
                        marginBottom: 'var(--spacing-4)',
                    }}
                >
                    <FaArrowLeft /> Back to Dashboard
                </button>
                <h1>Investment & Purchase Tracking</h1>
                <p style={{ color: 'var(--gray-600)' }}>Track all your investments and purchases</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="card-premium">
                    <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-2)' }}>
                        Total Spent
                    </p>
                    <h2 style={{ color: 'var(--primary-green)', marginBottom: 0 }}>
                        {formatCurrency(stats.totalSpent)}
                    </h2>
                </div>

                <div className="card-premium">
                    <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-2)' }}>
                        Direct Purchases
                    </p>
                    <h2 style={{ marginBottom: 0 }}>
                        {formatCurrency(stats.directPurchases)}
                    </h2>
                </div>

                <div className="card-premium">
                    <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-2)' }}>
                        Negotiated Orders
                    </p>
                    <h2 style={{ marginBottom: 0 }}>
                        {formatCurrency(stats.negotiatedOrders)}
                    </h2>
                </div>

                <div className="card-premium">
                    <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-2)' }}>
                        Total Orders
                    </p>
                    <h2 style={{ marginBottom: 0 }}>
                        {stats.orderCount}
                    </h2>
                </div>
            </div>

            {/* Filters */}
            <div className="card-premium" style={{ marginBottom: 'var(--spacing-6)' }}>
                <div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                        <FaCalendar style={{ color: 'var(--gray-500)' }} />
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="form-input"
                            style={{ width: 'auto' }}
                        >
                            <option value="all">All Time</option>
                            <option value="7days">Last 7 Days</option>
                            <option value="30days">Last 30 Days</option>
                            <option value="90days">Last 90 Days</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                        <FaFilter style={{ color: 'var(--gray-500)' }} />
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="form-input"
                            style={{ width: 'auto' }}
                        >
                            <option value="all">All Types</option>
                            <option value="direct">Direct Purchases</option>
                            <option value="negotiated">Negotiated Orders</option>
                        </select>
                    </div>

                    <div style={{ marginLeft: 'auto' }}>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                            Showing {filteredOrders.length} of {orders.length} orders
                        </p>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="card-premium">
                <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Purchase History</h3>

                {filteredOrders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-8)', color: 'var(--gray-500)' }}>
                        <p>No orders found matching your filters</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--gray-200)' }}>
                                    <th style={{ padding: 'var(--spacing-3)', textAlign: 'left', fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--gray-700)' }}>
                                        Order #
                                    </th>
                                    <th style={{ padding: 'var(--spacing-3)', textAlign: 'left', fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--gray-700)' }}>
                                        Crop
                                    </th>
                                    <th style={{ padding: 'var(--spacing-3)', textAlign: 'left', fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--gray-700)' }}>
                                        Type
                                    </th>
                                    <th style={{ padding: 'var(--spacing-3)', textAlign: 'left', fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--gray-700)' }}>
                                        Quantity
                                    </th>
                                    <th style={{ padding: 'var(--spacing-3)', textAlign: 'left', fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--gray-700)' }}>
                                        Amount
                                    </th>
                                    <th style={{ padding: 'var(--spacing-3)', textAlign: 'left', fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--gray-700)' }}>
                                        Date
                                    </th>
                                    <th style={{ padding: 'var(--spacing-3)', textAlign: 'left', fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--gray-700)' }}>
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => (
                                    <tr
                                        key={order._id}
                                        style={{
                                            borderBottom: '1px solid var(--gray-200)',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s',
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                        onClick={() => navigate(`/wholesaler/orders/${order._id}`)}
                                    >
                                        <td style={{ padding: 'var(--spacing-3)', fontSize: 'var(--font-size-sm)' }}>
                                            {order.orderNumber}
                                        </td>
                                        <td style={{ padding: 'var(--spacing-3)', fontSize: 'var(--font-size-sm)' }}>
                                            {order.crop?.name || 'N/A'}
                                        </td>
                                        <td style={{ padding: 'var(--spacing-3)', fontSize: 'var(--font-size-sm)' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: 'var(--radius-sm)',
                                                fontSize: 'var(--font-size-xs)',
                                                background: order.negotiation ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                color: order.negotiation ? '#3b82f6' : '#10b981',
                                            }}>
                                                {order.negotiation ? 'Negotiated' : 'Direct'}
                                            </span>
                                        </td>
                                        <td style={{ padding: 'var(--spacing-3)', fontSize: 'var(--font-size-sm)' }}>
                                            {order.quantity?.value} {order.quantity?.unit}
                                        </td>
                                        <td style={{ padding: 'var(--spacing-3)', fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--primary-green)' }}>
                                            {formatCurrency(order.totalAmount)}
                                        </td>
                                        <td style={{ padding: 'var(--spacing-3)', fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                            {formatDate(order.createdAt)}
                                        </td>
                                        <td style={{ padding: 'var(--spacing-3)', fontSize: 'var(--font-size-sm)' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: 'var(--radius-sm)',
                                                fontSize: 'var(--font-size-xs)',
                                                background: order.status === 'delivered' ? 'rgba(34, 197, 94, 0.1)' :
                                                    order.status === 'cancelled' ? 'rgba(239, 68, 68, 0.1)' :
                                                        'rgba(245, 158, 11, 0.1)',
                                                color: order.status === 'delivered' ? '#22c55e' :
                                                    order.status === 'cancelled' ? '#ef4444' :
                                                        '#f59e0b',
                                            }}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WholesalerInvestments;

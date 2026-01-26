import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaShoppingCart, FaBox, FaHistory, FaTruck, FaCheckCircle } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const ConsumerDashboard = () => {
    const { user } = useAuth();
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRecentOrders();
    }, []);

    const loadRecentOrders = async () => {
        try {
            const response = await api.get('/marketplace/orders').catch(() => ({ data: { data: [] } }));
            setRecentOrders(response.data.data?.slice(0, 3) || []);
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return '#0ea5e9';
            case 'shipped': return '#f59e0b';
            case 'processing': return '#8b5cf6';
            case 'pending': return '#6b7280';
            default: return '#6b7280';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered': return <FaCheckCircle />;
            case 'shipped': return <FaTruck />;
            case 'processing': return <FaBox />;
            default: return <FaHistory />;
        }
    };

    return (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', minHeight: '100vh', paddingTop: 'var(--spacing-8)', paddingBottom: 'var(--spacing-12)' }}>
            <div className="container">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="gradient-text" style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--spacing-2)' }}>
                        Welcome back, {user.name}!
                    </h1>
                    <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-lg)' }}>
                        Fresh farm produce delivered to your doorstep
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                    <Link to="/consumer/products" className="card-premium hover-3d text-center" style={{ padding: 'var(--spacing-6)' }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            margin: '0 auto var(--spacing-3)',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
                        }}>
                            <FaShoppingCart style={{ color: 'white', fontSize: '1.5rem' }} />
                        </div>
                        <h4 style={{ marginBottom: 'var(--spacing-2)' }}>Shop Now</h4>
                        <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>Browse fresh products</p>
                    </Link>

                    <Link to="/consumer/orders" className="card-premium hover-3d text-center" style={{ padding: 'var(--spacing-6)' }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            margin: '0 auto var(--spacing-3)',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 10px 30px rgba(14, 165, 233, 0.3)'
                        }}>
                            <FaBox style={{ color: 'white', fontSize: '1.5rem' }} />
                        </div>
                        <h4 style={{ marginBottom: 'var(--spacing-2)' }}>My Orders</h4>
                        <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>Track your orders</p>
                    </Link>

                    <Link to="/consumer/cart" className="card-premium hover-3d text-center" style={{ padding: 'var(--spacing-6)' }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            margin: '0 auto var(--spacing-3)',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 10px 30px rgba(245, 158, 11, 0.3)'
                        }}>
                            <FaShoppingCart style={{ color: 'white', fontSize: '1.5rem' }} />
                        </div>
                        <h4 style={{ marginBottom: 'var(--spacing-2)' }}>Cart</h4>
                        <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>View your cart</p>
                    </Link>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {/* Recent Orders */}
                    <div className="card-premium col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h3>Recent Orders</h3>
                            <Link to="/consumer/orders" style={{ color: 'var(--primary-green)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                                View All →
                            </Link>
                        </div>

                        {loading ? (
                            <div className="text-center" style={{ padding: 'var(--spacing-8)' }}>
                                <div className="spinner"></div>
                            </div>
                        ) : recentOrders.length === 0 ? (
                            <div className="text-center" style={{ padding: 'var(--spacing-8)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-3)' }}>📦</div>
                                <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--spacing-4)' }}>No orders yet</p>
                                <Link to="/consumer/products" className="btn btn-primary">
                                    Start Shopping
                                </Link>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {recentOrders.map((order) => (
                                    <Link
                                        key={order._id}
                                        to={`/consumer/orders/${order._id}`}
                                        className="card hover-lift"
                                        style={{ padding: 'var(--spacing-4)', textDecoration: 'none' }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3" style={{ flex: 1 }}>
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '50%',
                                                    background: `${getStatusColor(order.status)}20`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: getStatusColor(order.status)
                                                }}>
                                                    {getStatusIcon(order.status)}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontWeight: 600, marginBottom: 'var(--spacing-1)', color: 'var(--gray-900)' }}>
                                                        Order #{order._id?.slice(-6)}
                                                    </p>
                                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                                        {order.items?.length || 0} items • ₹{order.totalAmount}
                                                    </p>
                                                </div>
                                            </div>
                                            <span
                                                style={{
                                                    padding: '4px 12px',
                                                    borderRadius: 'var(--radius-md)',
                                                    background: `${getStatusColor(order.status)}20`,
                                                    color: getStatusColor(order.status),
                                                    fontSize: 'var(--font-size-xs)',
                                                    fontWeight: 600,
                                                    textTransform: 'capitalize'
                                                }}
                                            >
                                                {order.status}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Info */}
                    <div className="grid gap-6" style={{ gridTemplateRows: 'auto auto' }}>
                        <div className="card-premium" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', color: 'white' }}>
                            <h4 style={{ color: 'white', marginBottom: 'var(--spacing-2)' }}>🎉 Welcome Offer</h4>
                            <p style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9, marginBottom: 'var(--spacing-3)' }}>
                                Get ₹100 off on your first order above ₹500
                            </p>
                            <Link to="/consumer/products" className="btn" style={{ background: 'white', color: '#0ea5e9', width: '100%' }}>
                                Shop Now
                            </Link>
                        </div>

                        <div className="card-premium">
                            <h4 style={{ marginBottom: 'var(--spacing-3)' }}>Why Choose Us?</h4>
                            <div className="grid gap-2">
                                <div className="flex items-center gap-2">
                                    <span style={{ color: 'var(--primary-green)' }}>✓</span>
                                    <span style={{ fontSize: 'var(--font-size-sm)' }}>Fresh from farms</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span style={{ color: 'var(--primary-green)' }}>✓</span>
                                    <span style={{ fontSize: 'var(--font-size-sm)' }}>Quality assured</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span style={{ color: 'var(--primary-green)' }}>✓</span>
                                    <span style={{ fontSize: 'var(--font-size-sm)' }}>Fast delivery</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span style={{ color: 'var(--primary-green)' }}>✓</span>
                                    <span style={{ fontSize: 'var(--font-size-sm)' }}>Fair prices</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConsumerDashboard;

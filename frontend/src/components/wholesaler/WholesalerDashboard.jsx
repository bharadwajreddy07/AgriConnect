import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/i18n';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FaChartLine, FaShoppingBag, FaBoxOpen, FaHandshake } from 'react-icons/fa';

const WholesalerDashboard = () => {
    const { user } = useAuth();
    const { t } = useI18n();
    const [stats, setStats] = useState({
        samplesRequested: 0,
        activeNegotiations: 0,
        ordersPlaced: 0,
        totalSpending: 0,
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [samplesRes, negotiationsRes, wholesaleOrdersRes] = await Promise.all([
                api.get('/samples/wholesaler'),
                api.get('/negotiations'),
                api.get('/wholesale-orders?role=wholesaler').catch(() => ({ data: { data: [] } })),
            ]);

            const wholesaleOrders = wholesaleOrdersRes.data.data || [];
            const totalSpending = wholesaleOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

            setStats({
                samplesRequested: samplesRes.data.count || 0,
                activeNegotiations: negotiationsRes.data.data?.filter((n) => n.status === 'ongoing').length || 0,
                ordersPlaced: wholesaleOrders.length,
                totalSpending: totalSpending,
            });

            // Combine recent activity
            const activity = [
                ...samplesRes.data.data?.slice(0, 3).map(s => ({
                    type: 'sample',
                    title: `Sample requested for ${s.crop?.name}`,
                    date: s.createdAt,
                    status: s.status
                })) || [],
                ...negotiationsRes.data.data?.slice(0, 3).map(n => ({
                    type: 'negotiation',
                    title: `Negotiation for ${n.crop?.name}`,
                    date: n.updatedAt,
                    status: n.status
                })) || [],
            ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

            setRecentActivity(activity);
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

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
                <div className="mb-8 scale-in">
                    <h1 className="gradient-text">{t('dashboard.welcomeBack')}, {user.name}!</h1>
                    {!user.isVerified && (
                        <div className="card" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--warning)', marginTop: 'var(--spacing-4)' }}>
                            <p style={{ color: 'var(--warning)', fontWeight: 500 }}>
                                ⚠️ {t('dashboard.pendingVerification')}
                            </p>
                        </div>
                    )}
                </div>

                {/* Analytics Stats Cards */}
                <div className="grid grid-cols-4 gap-6 mb-8">
                    <div className="card-premium">
                        <div className="flex items-center justify-between">
                            <div>
                                <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-2)' }}>{t('dashboard.samplesRequested')}</p>
                                <h2 style={{ marginBottom: 0 }}>{stats.samplesRequested}</h2>
                            </div>
                            <div style={{ fontSize: '2.5rem', color: 'var(--primary-green)', opacity: 0.2 }}>
                                <FaBoxOpen />
                            </div>
                        </div>
                    </div>

                    <div className="card-premium">
                        <div className="flex items-center justify-between">
                            <div>
                                <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-2)' }}>{t('dashboard.activeNegotiations')}</p>
                                <h2 style={{ marginBottom: 0 }}>{stats.activeNegotiations}</h2>
                            </div>
                            <div style={{ fontSize: '2.5rem', color: 'var(--amber-500)', opacity: 0.2 }}>
                                <FaHandshake />
                            </div>
                        </div>
                    </div>

                    <div className="card-premium">
                        <div className="flex items-center justify-between">
                            <div>
                                <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-2)' }}>Purchases Made</p>
                                <h2 style={{ marginBottom: 0 }}>{stats.ordersPlaced}</h2>
                            </div>
                            <div style={{ fontSize: '2.5rem', color: 'var(--sky-500)', opacity: 0.2 }}>
                                <FaShoppingBag />
                            </div>
                        </div>
                    </div>

                    <Link
                        to="/wholesaler/investments"
                        className="card-premium"
                        style={{
                            textDecoration: 'none',
                            color: 'inherit',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-2)' }}>
                                    {t('dashboard.totalSpending')}
                                </p>
                                <h2 style={{ marginBottom: 0, color: 'var(--primary-green)' }}>
                                    ₹{stats.totalSpending.toLocaleString('en-IN')}
                                </h2>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)', marginTop: 'var(--spacing-2)' }}>
                                    Click to view details →
                                </p>
                            </div>
                            <div style={{ fontSize: '2.5rem', color: 'var(--emerald-500)', opacity: 0.2 }}>
                                <FaChartLine />
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {/* Quick Actions */}
                    <div className="card-premium" style={{ gridColumn: 'span 2' }}>
                        <h3 className="mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Link to="/wholesaler/marketplace" className="card hover-lift text-center" style={{ padding: 'var(--spacing-6)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-3)' }}>🌾</div>
                                <h4 style={{ marginBottom: 'var(--spacing-2)' }}>Crop Marketplace</h4>
                                <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>Browse and source quality crops</p>
                            </Link>

                            <Link to="/wholesaler/cart" className="card hover-lift text-center" style={{ padding: 'var(--spacing-6)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-3)' }}>🛒</div>
                                <h4 style={{ marginBottom: 'var(--spacing-2)' }}>My Cart</h4>
                                <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>View and manage cart items</p>
                            </Link>

                            <Link to="/wholesaler/samples" className="card hover-lift text-center" style={{ padding: 'var(--spacing-6)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-3)' }}>📦</div>
                                <h4 style={{ marginBottom: 'var(--spacing-2)' }}>My Samples</h4>
                                <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>Track your sample requests</p>
                            </Link>

                            <Link to="/wholesaler/negotiations" className="card hover-lift text-center" style={{ padding: 'var(--spacing-6)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-3)' }}>💬</div>
                                <h4 style={{ marginBottom: 'var(--spacing-2)' }}>Negotiations</h4>
                                <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>Manage price negotiations</p>
                            </Link>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="card-premium">
                        <h3 className="mb-4">{t('dashboard.recentActivity')}</h3>
                        {recentActivity.length === 0 ? (
                            <div className="text-center" style={{ padding: 'var(--spacing-8)' }}>
                                <p style={{ color: 'var(--gray-500)', fontSize: 'var(--font-size-sm)' }}>No recent activity</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                                {recentActivity.map((activity, index) => {
                                    const getStatusColor = (status) => {
                                        if (status === 'approved' || status === 'accepted') return '#10b981';
                                        if (status === 'pending' || status === 'ongoing') return '#f59e0b';
                                        if (status === 'rejected') return '#ef4444';
                                        return '#6b7280';
                                    };

                                    const getStatusBg = (status) => {
                                        if (status === 'approved' || status === 'accepted') return '#d1fae5';
                                        if (status === 'pending' || status === 'ongoing') return '#fef3c7';
                                        if (status === 'rejected') return '#fee2e2';
                                        return '#f3f4f6';
                                    };

                                    return (
                                        <div
                                            key={index}
                                            style={{
                                                padding: 'var(--spacing-3)',
                                                background: 'white',
                                                borderRadius: 'var(--radius-lg)',
                                                border: `2px solid ${activity.type === 'sample' ? '#0ea5e9' : '#f59e0b'}`,
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                            }}
                                        >
                                            <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-2)', color: 'var(--gray-900)' }}>
                                                {activity.title}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                                                    {new Date(activity.date).toLocaleDateString()}
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: 'var(--font-size-xs)',
                                                        fontWeight: 600,
                                                        padding: '4px 8px',
                                                        borderRadius: 'var(--radius-md)',
                                                        background: getStatusBg(activity.status),
                                                        color: getStatusColor(activity.status),
                                                        textTransform: 'capitalize'
                                                    }}
                                                >
                                                    {activity.status}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WholesalerDashboard;

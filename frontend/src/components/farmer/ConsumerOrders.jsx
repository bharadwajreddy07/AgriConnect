import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
    FaBox,
    FaTruck,
    FaCheckCircle,
    FaEye,
    FaPhone,
    FaMapMarkerAlt,
    FaSearch,
} from 'react-icons/fa';
import api from '../../services/api';
import { formatPrice } from '../../utils/cartUtils';

const ConsumerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [trackingInfo, setTrackingInfo] = useState({
        courierName: '',
        trackingNumber: '',
    });

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);

            // Load both consumer and wholesale orders in parallel
            const [consumerRes, wholesaleRes] = await Promise.all([
                api.get('/marketplace/farmer/orders').catch(() => ({ data: { data: [] } })),
                api.get('/wholesale-orders/farmer').catch(() => ({ data: { data: [] } })),
            ]);

            const consumerOrders = (consumerRes.data.data || []).map(order => ({
                ...order,
                orderType: 'consumer'
            }));

            const wholesaleOrders = (wholesaleRes.data.data || []).map(order => ({
                ...order,
                orderType: 'wholesale'
            }));

            // Combine and sort by date
            const allOrders = [...consumerOrders, ...wholesaleOrders].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );

            setOrders(allOrders);
        } catch (error) {
            console.error('Error loading orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId) => {
        if (!newStatus) {
            toast.error('Please select a status');
            return;
        }

        try {
            const isWholesale = selectedOrder?.orderType === 'wholesale';

            if (isWholesale) {
                // Update wholesale order status
                await api.put(`/wholesale-orders/${orderId}/status`, {
                    status: newStatus,
                });
            } else {
                // Update consumer order status
                await api.put(`/marketplace/farmer/orders/${orderId}/status`, {
                    status: newStatus,
                });

                // If shipped, add tracking info separately (consumer orders only)
                if (newStatus === 'shipped' && (trackingInfo.courierName || trackingInfo.trackingNumber)) {
                    await api.put(`/marketplace/farmer/orders/${orderId}/tracking`, trackingInfo);
                }
            }

            toast.success('Order status updated');
            setShowStatusModal(false);
            setNewStatus('');
            setTrackingInfo({ courierName: '', trackingNumber: '' });
            loadOrders();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered':
                return <FaCheckCircle style={{ color: 'var(--success)' }} />;
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
            case 'shipped':
            case 'out_for_delivery':
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
        // Determine status field based on order type
        const status = order.orderType === 'wholesale' ? order.status : order.orderStatus;

        if (filter === 'active' && ['delivered', 'cancelled'].includes(status)) {
            return false;
        }
        if (filter === 'delivered' && status !== 'delivered') {
            return false;
        }
        if (filter === 'cancelled' && status !== 'cancelled') {
            return false;
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const buyerName = order.orderType === 'wholesale'
                ? order.wholesaler?.name
                : order.buyer?.name;
            return (
                order.orderNumber.toLowerCase().includes(query) ||
                buyerName?.toLowerCase().includes(query)
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
                    <h1 className="gradient-text">All Orders</h1>
                    <p style={{ color: 'var(--gray-600)' }}>
                        {orders.length} {orders.length === 1 ? 'order' : 'orders'} total
                        ({orders.filter(o => o.orderType === 'consumer').length} consumer, {orders.filter(o => o.orderType === 'wholesale').length} wholesale)
                    </p>
                </div>

                {/* Filters */}
                <div className="card-premium mb-6">
                    <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                            <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search by order number or customer..."
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
                        <p style={{ color: 'var(--gray-600)' }}>
                            {searchQuery ? 'Try adjusting your search' : 'You haven\'t received any consumer orders yet'}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredOrders.map((order) => {
                            const isWholesale = order.orderType === 'wholesale';
                            const status = isWholesale ? order.status : order.orderStatus;
                            const buyerName = isWholesale ? order.wholesaler?.name : order.buyer?.name;
                            const buyerPhone = isWholesale ? order.wholesaler?.phone : order.buyer?.phone;

                            // For consumer orders, filter items that belong to this farmer
                            const myItems = isWholesale ? [] : (order.items?.filter(item => item.farmer?._id === order.items[0]?.farmer?._id) || []);
                            const myTotal = isWholesale ? (order.farmerTotal || order.totalAmount || 0) : myItems.reduce((sum, item) => sum + item.total, 0);

                            return (
                                <div key={order._id} className="card-premium">
                                    <div className="flex gap-4">
                                        {/* Order Image */}
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
                                                src={isWholesale ? (order.crop?.images?.[0] || '/placeholder.jpg') : (myItems[0]?.crop?.images?.[0] || '/placeholder.jpg')}
                                                alt={isWholesale ? order.crop?.name : myItems[0]?.crop?.name}
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
                                                                background: getStatusBadgeColor(status),
                                                                color: 'white',
                                                            }}
                                                        >
                                                            {status.replace('_', ' ')}
                                                        </span>
                                                        <span
                                                            className="badge"
                                                            style={{
                                                                background: isWholesale ? 'var(--primary-green)' : 'var(--accent-blue)',
                                                                color: 'white',
                                                                fontSize: 'var(--font-size-xs)',
                                                                padding: '2px 8px'
                                                            }}
                                                        >
                                                            {isWholesale ? 'WHOLESALE' : 'CONSUMER'}
                                                        </span>
                                                    </div>
                                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                                        Placed on {formatDate(order.createdAt)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--primary-green)' }}>
                                                        {formatPrice(myTotal)}
                                                    </div>
                                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                                                        {isWholesale ? `${order.quantity?.value || 0} ${order.quantity?.unit || ''}` : `${myItems.length} ${myItems.length === 1 ? 'item' : 'items'}`}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Items */}
                                            <div style={{ marginBottom: 'var(--spacing-3)' }}>
                                                {isWholesale ? (
                                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-700)', marginBottom: 'var(--spacing-1)' }}>
                                                        {order.crop?.name} × {order.quantity?.value} {order.quantity?.unit}
                                                    </p>
                                                ) : (
                                                    myItems.map((item, index) => (
                                                        <p key={index} style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-700)', marginBottom: 'var(--spacing-1)' }}>
                                                            {item.crop?.name} × {item.quantity} - {formatPrice(item.total)}
                                                        </p>
                                                    ))
                                                )}
                                            </div>

                                            {/* Customer Info */}
                                            <div className="grid grid-cols-2 gap-3 mb-3">
                                                <div style={{ padding: 'var(--spacing-2)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                                                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-1)' }}>
                                                        {isWholesale ? 'Wholesaler' : 'Customer'}
                                                    </p>
                                                    <p style={{ fontWeight: 600 }}>{buyerName}</p>
                                                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                                                        <FaPhone style={{ marginRight: '4px' }} />
                                                        {buyerPhone}
                                                    </p>
                                                </div>
                                                <div style={{ padding: 'var(--spacing-2)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                                                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-1)' }}>
                                                        Delivery Address
                                                    </p>
                                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-700)' }}>
                                                        <FaMapMarkerAlt style={{ marginRight: '4px' }} />
                                                        {order.deliveryAddress?.city || 'N/A'}, {order.deliveryAddress?.state || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                {status !== 'delivered' && status !== 'cancelled' && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedOrder(order);
                                                            setShowStatusModal(true);
                                                            setNewStatus(status);
                                                        }}
                                                        className="btn btn-primary btn-sm"
                                                    >
                                                        Update Status
                                                    </button>
                                                )}
                                                <a
                                                    href={`tel:${buyerPhone}`}
                                                    className="btn btn-outline btn-sm"
                                                >
                                                    <FaPhone /> Contact {isWholesale ? 'Wholesaler' : 'Customer'}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Status Update Modal */}
                {showStatusModal && selectedOrder && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                        }}
                        onClick={() => setShowStatusModal(false)}
                    >
                        <div
                            className="card-premium"
                            style={{ maxWidth: '500px', width: '90%' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 style={{ marginBottom: 'var(--spacing-4)' }}>Update Order Status</h2>
                            <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--spacing-4)' }}>
                                Order #{selectedOrder.orderNumber}
                            </p>

                            <div style={{ marginBottom: 'var(--spacing-4)' }}>
                                <label className="form-label">New Status</label>
                                <select
                                    className="form-select"
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="processing">Processing</option>
                                    <option value="packed">Packed</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="out_for_delivery">Out for Delivery</option>
                                    <option value="delivered">Delivered</option>
                                </select>
                            </div>

                            {newStatus === 'shipped' && selectedOrder?.orderType !== 'wholesale' && (
                                <>
                                    <div style={{ marginBottom: 'var(--spacing-3)' }}>
                                        <label className="form-label">Courier Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={trackingInfo.courierName}
                                            onChange={(e) => setTrackingInfo({ ...trackingInfo, courierName: e.target.value })}
                                            placeholder="e.g., Delhivery, BlueDart"
                                        />
                                    </div>
                                    <div style={{ marginBottom: 'var(--spacing-4)' }}>
                                        <label className="form-label">Tracking Number</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={trackingInfo.trackingNumber}
                                            onChange={(e) => setTrackingInfo({ ...trackingInfo, trackingNumber: e.target.value })}
                                            placeholder="Enter tracking number"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleUpdateStatus(selectedOrder._id)}
                                    className="btn btn-primary flex-1"
                                >
                                    Update Status
                                </button>
                                <button
                                    onClick={() => {
                                        setShowStatusModal(false);
                                        setNewStatus('');
                                        setTrackingInfo({ courierName: '', trackingNumber: '' });
                                    }}
                                    className="btn btn-outline flex-1"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConsumerOrders;

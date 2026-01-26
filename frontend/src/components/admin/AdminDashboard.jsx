import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { formatPrice } from '../../utils/cropData';
import {
    FaCheckCircle,
    FaTimesCircle,
    FaBell,
    FaDownload,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaIdCard,
    FaCalendar,
    FaStar,
    FaEye
} from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AdminDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [recentNegotiations, setRecentNegotiations] = useState([]);
    const [pendingCrops, setPendingCrops] = useState([]);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [verifiedUsers, setVerifiedUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedCrop, setSelectedCrop] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [analyticsRes, cropsRes, pendingUsersRes, verifiedUsersRes, negotiationsRes] = await Promise.all([
                api.get('/admin/analytics'),
                api.get('/admin/crops/pending'),
                api.get('/admin/users?isVerified=false'),
                api.get('/admin/users?isVerified=true'),
                api.get('/admin/negotiations/recent'),
            ]);

            setAnalytics(analyticsRes.data.data);
            setPendingCrops(cropsRes.data.data || []);
            setPendingUsers(pendingUsersRes.data.data || []);
            setVerifiedUsers(verifiedUsersRes.data.data || []);
            setRecentNegotiations(negotiationsRes.data.data || []);
        } catch (error) {
            toast.error('Failed to load dashboard data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveCrop = async (cropId) => {
        try {
            await api.put(`/crops/${cropId}/approve`, { status: 'approved' });
            toast.success('✅ Crop approved successfully!');
            loadDashboardData();
            setSelectedCrop(null);
        } catch (error) {
            toast.error('Failed to approve crop');
        }
    };

    const handleRejectCrop = async (cropId) => {
        try {
            await api.put(`/crops/${cropId}/approve`, { status: 'rejected' });
            toast.success('Crop rejected');
            loadDashboardData();
            setSelectedCrop(null);
        } catch (error) {
            toast.error('Failed to reject crop');
        }
    };

    const handleVerifyUser = async (userId) => {
        try {
            await api.put(`/admin/users/${userId}/verify`);
            toast.success('✅ User verified successfully!');
            loadDashboardData();
            setSelectedUser(null);
        } catch (error) {
            toast.error('Failed to verify user');
        }
    };

    const handleRejectUser = () => {
        setSelectedUser(null);
        toast.info('User verification cancelled');
    };

    // PDF Export Function
    const exportVerifiedUsersToPDF = () => {
        const doc = new jsPDF();

        // Add header
        doc.setFontSize(20);
        doc.setTextColor(45, 122, 62);
        doc.text('AgriConnect - Verified Users Report', 14, 20);

        // Add date
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

        // Prepare table data
        const tableData = verifiedUsers.map((user, index) => [
            index + 1,
            user.name,
            user.email,
            user.phone,
            user.role.charAt(0).toUpperCase() + user.role.slice(1),
            user.region || 'N/A',
            new Date(user.createdAt).toLocaleDateString()
        ]);

        // Add table
        doc.autoTable({
            startY: 35,
            head: [['#', 'Name', 'Email', 'Phone', 'Role', 'Region', 'Joined Date']],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: [45, 122, 62],
                textColor: 255,
                fontSize: 10,
                fontStyle: 'bold'
            },
            styles: {
                fontSize: 9,
                cellPadding: 3
            },
            alternateRowStyles: {
                fillColor: [249, 250, 251]
            }
        });

        // Add footer
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150);
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.text(
                `Page ${i} of ${pageCount} | Total Verified Users: ${verifiedUsers.length}`,
                14,
                doc.internal.pageSize.height - 10
            );
        }

        // Save PDF
        doc.save(`AgriConnect_Verified_Users_${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('📄 PDF downloaded successfully!');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: '80vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    const totalPending = pendingCrops.length + pendingUsers.length;

    return (
        <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #d1fae5 100%)',
            minHeight: '100vh',
            paddingBottom: 'var(--spacing-12)'
        }}>
            <div className="container" style={{ marginTop: 'var(--spacing-8)' }}>
                {/* Header with Glass Effect */}
                <div
                    className="flex items-center justify-between mb-8"
                    style={{
                        background: 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(10px)',
                        padding: 'var(--spacing-6)',
                        borderRadius: 'var(--radius-2xl)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    <div>
                        <h1 style={{
                            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            marginBottom: 'var(--spacing-2)'
                        }}>
                            Admin Dashboard
                        </h1>
                        <p style={{ color: 'var(--gray-600)' }}>Manage platform operations and approvals</p>
                    </div>

                    <div className="flex gap-4">
                        {/* PDF Export Button */}
                        <button
                            className="btn btn-secondary"
                            onClick={exportVerifiedUsersToPDF}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-2)',
                                background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
                            }}
                        >
                            <FaDownload />
                            <span>Export Verified Users</span>
                        </button>

                        {/* Notification Bell */}
                        {totalPending > 0 && (
                            <button
                                className="btn"
                                style={{
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-2)',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: 'var(--error)',
                                    border: '2px solid var(--error)'
                                }}
                            >
                                <FaBell />
                                <span>{totalPending} Pending</span>
                                <span
                                    className="animate-pulse"
                                    style={{
                                        position: 'absolute',
                                        top: '-8px',
                                        right: '-8px',
                                        background: 'var(--error)',
                                        color: 'white',
                                        borderRadius: '50%',
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 'var(--font-size-xs)',
                                        fontWeight: 700,
                                    }}
                                >
                                    {totalPending}
                                </span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Analytics Stats with Glass Cards */}
                {analytics && (
                    <div className="grid grid-cols-4 gap-6 mb-8">
                        {[
                            { label: 'Total Users', value: analytics.users.total, icon: FaUser, color: '#3b82f6', detail: `Farmers: ${analytics.users.farmers} | Wholesalers: ${analytics.users.wholesalers}` },
                            { label: 'Total Crops', value: analytics.crops.total, icon: FaStar, color: '#10b981', detail: `Active: ${analytics.crops.active} | Pending: ${analytics.crops.pending}` },
                            { label: 'Total Orders', value: analytics.orders.total, icon: FaCheckCircle, color: '#f59e0b', detail: `Completed: ${analytics.orders.completed}` },
                            { label: 'Negotiations', value: analytics.negotiations.total, icon: FaEnvelope, color: '#8b5cf6', detail: `Success Rate: ${analytics.negotiations.successRate}%` }
                        ].map((stat, index) => (
                            <div
                                key={index}
                                className="hover-lift"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: 'var(--radius-xl)',
                                    padding: 'var(--spacing-6)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer'
                                }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>
                                        {stat.label}
                                    </p>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: `linear-gradient(135deg, ${stat.color}20 0%, ${stat.color}40 100%)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <stat.icon style={{ color: stat.color, fontSize: '1.2rem' }} />
                                    </div>
                                </div>
                                <h2 style={{ marginBottom: 'var(--spacing-2)', color: stat.color }}>{stat.value}</h2>
                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                    {stat.detail}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                <div className="grid gap-8">
                    {/* Negotiations Table */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 'var(--radius-2xl)',
                        padding: 'var(--spacing-6)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 style={{
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                Recent Negotiations
                            </h3>
                            <Link to="/admin" className="btn btn-outline btn-sm">View All</Link>
                        </div>

                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Crop</th>
                                        <th>Farmer</th>
                                        <th>Wholesaler</th>
                                        <th>Status</th>
                                        <th>Last Offer</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentNegotiations.map((neg) => (
                                        <tr key={neg._id}>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    {neg.crop?.images?.[0] && (
                                                        <img src={neg.crop.images[0]} alt="" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }} />
                                                    )}
                                                    {neg.crop?.name || 'Unknown Crop'}
                                                </div>
                                            </td>
                                            <td>{neg.farmer?.name}</td>
                                            <td>{neg.wholesaler?.name}</td>
                                            <td>
                                                <span className={`badge ${neg.status === 'accepted' ? 'badge-success' :
                                                    neg.status === 'rejected' ? 'badge-danger' :
                                                        'badge-warning'
                                                    }`}>
                                                    {neg.status}
                                                </span>
                                            </td>
                                            <td>{formatPrice(neg.currentOffer?.amount || 0)}</td>
                                            <td>{new Date(neg.updatedAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                    {recentNegotiations.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="text-center py-4 text-gray-500">
                                                No recent negotiations
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pending Approvals Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* Pending User Verifications */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: 'var(--radius-2xl)',
                            padding: 'var(--spacing-6)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                        }}>
                            <h3 className="mb-4" style={{
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                Pending User Verifications ({pendingUsers.length})
                            </h3>
                            {pendingUsers.length === 0 ? (
                                <p style={{ color: 'var(--gray-600)', textAlign: 'center', padding: 'var(--spacing-8)' }}>
                                    ✅ No pending verifications
                                </p>
                            ) : (
                                <div className="grid gap-3">
                                    {pendingUsers.map((user) => (
                                        <div
                                            key={user._id}
                                            className="hover-lift"
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                                                borderRadius: 'var(--radius-lg)',
                                                padding: 'var(--spacing-4)',
                                                border: '1px solid rgba(59, 130, 246, 0.2)',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onClick={() => setSelectedUser(user)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex gap-3">
                                                    <div style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontSize: '1.5rem',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h4 style={{ marginBottom: 'var(--spacing-1)' }}>{user.name}</h4>
                                                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-1)' }}>
                                                            <span className="badge badge-info">{user.role}</span>
                                                        </p>
                                                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    className="btn btn-sm"
                                                    style={{
                                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                        color: 'white'
                                                    }}
                                                >
                                                    <FaEye /> Review
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Pending Crops */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: 'var(--radius-2xl)',
                            padding: 'var(--spacing-6)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                        }}>
                            <h3 className="mb-4" style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                Pending Crop Approvals ({pendingCrops.length})
                            </h3>
                            {pendingCrops.length === 0 ? (
                                <p style={{ color: 'var(--gray-600)', textAlign: 'center', padding: 'var(--spacing-8)' }}>
                                    ✅ No pending crops
                                </p>
                            ) : (
                                <div className="grid gap-3">
                                    {pendingCrops.slice(0, 5).map((crop) => (
                                        <div
                                            key={crop._id}
                                            className="hover-lift"
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                                                borderRadius: 'var(--radius-lg)',
                                                padding: 'var(--spacing-4)',
                                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onClick={() => setSelectedCrop(crop)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 style={{ marginBottom: 'var(--spacing-1)' }}>{crop.name}</h4>
                                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                                        By: {crop.farmer?.name}
                                                    </p>
                                                    <p style={{ fontWeight: 600, color: 'var(--primary-green)', marginTop: 'var(--spacing-2)' }}>
                                                        {formatPrice(crop.expectedPrice)}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleApproveCrop(crop._id);
                                                        }}
                                                    >
                                                        <FaCheckCircle />
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRejectCrop(crop._id);
                                                        }}
                                                    >
                                                        <FaTimesCircle />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* User Detail Modal - Premium Design */}
                {selectedUser && (
                    <div
                        className="modal-overlay"
                        onClick={() => setSelectedUser(null)}
                        style={{ backdropFilter: 'blur(8px)' }}
                    >
                        <div
                            className="modal-content"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                maxWidth: '700px',
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                            }}
                        >
                            <h2 style={{
                                marginBottom: 'var(--spacing-6)',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                User Verification Details
                            </h2>

                            {/* User Info Form Layout */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="form-group">
                                    <label className="form-label">
                                        <FaUser style={{ display: 'inline', marginRight: '8px' }} />
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={selectedUser.name}
                                        readOnly
                                        style={{ background: 'var(--gray-100)' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        <FaIdCard style={{ display: 'inline', marginRight: '8px' }} />
                                        Role
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                                        readOnly
                                        style={{ background: 'var(--gray-100)' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        <FaEnvelope style={{ display: 'inline', marginRight: '8px' }} />
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={selectedUser.email}
                                        readOnly
                                        style={{ background: 'var(--gray-100)' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        <FaPhone style={{ display: 'inline', marginRight: '8px' }} />
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        value={selectedUser.phone}
                                        readOnly
                                        style={{ background: 'var(--gray-100)' }}
                                    />
                                </div>

                                {selectedUser.region && (
                                    <div className="form-group">
                                        <label className="form-label">
                                            <FaMapMarkerAlt style={{ display: 'inline', marginRight: '8px' }} />
                                            Region
                                        </label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={selectedUser.region}
                                            readOnly
                                            style={{ background: 'var(--gray-100)' }}
                                        />
                                    </div>
                                )}

                                <div className="form-group">
                                    <label className="form-label">
                                        <FaCalendar style={{ display: 'inline', marginRight: '8px' }} />
                                        Registration Date
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={new Date(selectedUser.createdAt).toLocaleDateString()}
                                        readOnly
                                        style={{ background: 'var(--gray-100)' }}
                                    />
                                </div>
                            </div>

                            {/* Address Section */}
                            {selectedUser.address && (
                                <div className="mb-6">
                                    <h4 className="mb-3">Address Information</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {selectedUser.address.street && (
                                            <div className="form-group">
                                                <label className="form-label">Street</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={selectedUser.address.street}
                                                    readOnly
                                                    style={{ background: 'var(--gray-100)' }}
                                                />
                                            </div>
                                        )}
                                        {selectedUser.address.village && (
                                            <div className="form-group">
                                                <label className="form-label">Village</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={selectedUser.address.village}
                                                    readOnly
                                                    style={{ background: 'var(--gray-100)' }}
                                                />
                                            </div>
                                        )}
                                        {selectedUser.address.district && (
                                            <div className="form-group">
                                                <label className="form-label">District</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={selectedUser.address.district}
                                                    readOnly
                                                    style={{ background: 'var(--gray-100)' }}
                                                />
                                            </div>
                                        )}
                                        {selectedUser.address.state && (
                                            <div className="form-group">
                                                <label className="form-label">State</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={selectedUser.address.state}
                                                    readOnly
                                                    style={{ background: 'var(--gray-100)' }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <button
                                    className="btn btn-primary flex-1"
                                    onClick={() => handleVerifyUser(selectedUser._id)}
                                    style={{
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                                    }}
                                >
                                    <FaCheckCircle /> Verify User
                                </button>
                                <button
                                    className="btn btn-danger flex-1"
                                    onClick={handleRejectUser}
                                >
                                    <FaTimesCircle /> Decline
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Crop Detail Modal */}
                {selectedCrop && (
                    <div className="modal-overlay" onClick={() => setSelectedCrop(null)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                            <h2 style={{ marginBottom: 'var(--spacing-4)' }}>Crop Details</h2>

                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>Crop Name</p>
                                    <h3>{selectedCrop.name}</h3>
                                </div>
                                <div>
                                    <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>Category</p>
                                    <h4>{selectedCrop.category}</h4>
                                </div>
                                <div>
                                    <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>Season</p>
                                    <h4>{selectedCrop.season}</h4>
                                </div>
                                <div>
                                    <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>Expected Price</p>
                                    <h4 style={{ color: 'var(--primary-green)' }}>{formatPrice(selectedCrop.expectedPrice)}</h4>
                                </div>
                                <div>
                                    <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>Quantity</p>
                                    <h4>{selectedCrop.quantity.value} {selectedCrop.quantity.unit}</h4>
                                </div>
                                <div>
                                    <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>Quality Grade</p>
                                    <h4>{selectedCrop.qualityGrade}</h4>
                                </div>
                            </div>

                            <div className="mb-6">
                                <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>Farmer Details</p>
                                <div className="card" style={{ background: 'var(--gray-50)' }}>
                                    <p><strong>Name:</strong> {selectedCrop.farmer?.name}</p>
                                    <p><strong>Email:</strong> {selectedCrop.farmer?.email}</p>
                                    <p><strong>Phone:</strong> {selectedCrop.farmer?.phone}</p>
                                    <p><strong>Location:</strong> {selectedCrop.location.district}, {selectedCrop.location.state}</p>
                                </div>
                            </div>

                            {selectedCrop.description && (
                                <div className="mb-6">
                                    <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>Description</p>
                                    <p>{selectedCrop.description}</p>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button
                                    className="btn btn-primary flex-1"
                                    onClick={() => handleApproveCrop(selectedCrop._id)}
                                >
                                    <FaCheckCircle /> Approve Crop
                                </button>
                                <button
                                    className="btn btn-danger flex-1"
                                    onClick={() => handleRejectCrop(selectedCrop._id)}
                                >
                                    <FaTimesCircle /> Reject
                                </button>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => setSelectedCrop(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;

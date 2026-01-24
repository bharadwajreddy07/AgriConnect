import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
    FaCheckCircle,
    FaTimesCircle,
    FaEye,
    FaUser,
    FaPhone,
    FaMapMarkerAlt,
    FaFileAlt,
} from 'react-icons/fa';
import api from '../../services/api';

const VerificationRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        loadRequests();
    }, [filter]);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/verification-requests?status=${filter}`);
            setRequests(response.data.data || []);
        } catch (error) {
            console.error('Error loading requests:', error);
            toast.error('Failed to load verification requests');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId) => {
        try {
            await api.put(`/admin/verify-user/${userId}`, { isVerified: true });
            toast.success('User verified successfully!');
            loadRequests();
            setShowModal(false);
        } catch (error) {
            console.error('Error approving user:', error);
            toast.error('Failed to verify user');
        }
    };

    const handleReject = async (userId, reason) => {
        try {
            await api.put(`/admin/verify-user/${userId}`, {
                isVerified: false,
                rejectionReason: reason
            });
            toast.success('Verification rejected');
            loadRequests();
            setShowModal(false);
        } catch (error) {
            console.error('Error rejecting user:', error);
            toast.error('Failed to reject verification');
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
                <div className="mb-6">
                    <h1 className="gradient-text">Verification Requests</h1>
                    <p style={{ color: 'var(--gray-600)' }}>
                        {requests.length} {requests.length === 1 ? 'request' : 'requests'} found
                    </p>
                </div>

                {/* Filters */}
                <div className="card-premium mb-6">
                    <div className="flex gap-2">
                        {['pending', 'approved', 'rejected'].map((filterOption) => (
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

                {/* Requests List */}
                {requests.length === 0 ? (
                    <div className="card-premium text-center" style={{ padding: 'var(--spacing-12)' }}>
                        <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-4)' }}>✅</div>
                        <h3>No {filter} requests</h3>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {requests.map((user) => (
                            <div key={user._id} className="card-premium">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3>{user.name}</h3>
                                        <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>
                                            <FaUser /> {user.role} • <FaPhone /> {user.phone}
                                        </p>
                                    </div>
                                    <span
                                        className="badge"
                                        style={{
                                            background: user.isVerified ? 'var(--success)' : 'var(--warning)',
                                            color: 'white',
                                        }}
                                    >
                                        {user.isVerified ? 'Verified' : 'Pending'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>Email</p>
                                        <p>{user.email}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>Location</p>
                                        <p><FaMapMarkerAlt /> {user.address?.state || 'N/A'}</p>
                                    </div>
                                </div>

                                {user.documents && user.documents.length > 0 && (
                                    <div className="mb-4">
                                        <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--spacing-2)' }}>
                                            Documents
                                        </p>
                                        <div className="flex gap-2">
                                            {user.documents.map((doc, idx) => (
                                                <a
                                                    key={idx}
                                                    href={doc}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-outline btn-sm"
                                                >
                                                    <FaFileAlt /> Document {idx + 1}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {filter === 'pending' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleApprove(user._id)}
                                            className="btn btn-sm"
                                            style={{ background: 'var(--success)', color: 'white' }}
                                        >
                                            <FaCheckCircle /> Approve
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setShowModal(true);
                                            }}
                                            className="btn btn-sm"
                                            style={{ background: 'var(--error)', color: 'white' }}
                                        >
                                            <FaTimesCircle /> Reject
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setShowModal(true);
                                            }}
                                            className="btn btn-outline btn-sm"
                                        >
                                            <FaEye /> View Details
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Detail Modal */}
                {showModal && selectedUser && (
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
                        onClick={() => setShowModal(false)}
                    >
                        <div
                            className="card-premium"
                            style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 style={{ marginBottom: 'var(--spacing-4)' }}>User Details</h2>

                            <div className="grid gap-4 mb-4">
                                <div>
                                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>Name</p>
                                    <p style={{ fontWeight: 600 }}>{selectedUser.name}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>Email</p>
                                    <p>{selectedUser.email}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>Phone</p>
                                    <p>{selectedUser.phone}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>Role</p>
                                    <p style={{ textTransform: 'capitalize' }}>{selectedUser.role}</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleApprove(selectedUser._id)}
                                    className="btn btn-primary flex-1"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="btn btn-outline flex-1"
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

export default VerificationRequests;

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
    FaUsers,
    FaUserCheck,
    FaUserTimes,
    FaSearch,
    FaBan,
    FaCheckCircle,
} from 'react-icons/fa';
import api from '../../services/api';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        farmers: 0,
        wholesalers: 0,
        consumers: 0,
        verified: 0,
    });

    useEffect(() => {
        loadUsers();
    }, [filter]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/users?role=${filter !== 'all' ? filter : ''}`);
            const userData = response.data.data || [];
            setUsers(userData);

            // Calculate stats
            setStats({
                total: userData.length,
                farmers: userData.filter(u => u.role === 'farmer').length,
                wholesalers: userData.filter(u => u.role === 'wholesaler').length,
                consumers: userData.filter(u => u.role === 'consumer').length,
                verified: userData.filter(u => u.isVerified).length,
            });
        } catch (error) {
            console.error('Error loading users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            await api.put(`/admin/users/${userId}/status`, { isActive: !currentStatus });
            toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`);
            loadUsers();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update user status');
        }
    };

    const filteredUsers = users.filter(user => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                user.name.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query) ||
                user.phone?.includes(query)
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
                <div className="mb-6">
                    <h1 className="gradient-text">User Management</h1>
                    <p style={{ color: 'var(--gray-600)' }}>Manage all platform users</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-5 gap-4 mb-6">
                    <div className="card-premium">
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-2)' }}>
                            Total Users
                        </p>
                        <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--primary-green)' }}>
                            {stats.total}
                        </p>
                    </div>
                    <div className="card-premium">
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-2)' }}>
                            Farmers
                        </p>
                        <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700 }}>
                            {stats.farmers}
                        </p>
                    </div>
                    <div className="card-premium">
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-2)' }}>
                            Wholesalers
                        </p>
                        <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700 }}>
                            {stats.wholesalers}
                        </p>
                    </div>
                    <div className="card-premium">
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-2)' }}>
                            Consumers
                        </p>
                        <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700 }}>
                            {stats.consumers}
                        </p>
                    </div>
                    <div className="card-premium">
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)', marginBottom: 'var(--spacing-2)' }}>
                            Verified
                        </p>
                        <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--success)' }}>
                            {stats.verified}
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="card-premium mb-6">
                    <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                            <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ paddingLeft: '2.5rem' }}
                            />
                        </div>
                        <div className="flex gap-2">
                            {['all', 'farmer', 'wholesaler', 'consumer'].map((filterOption) => (
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

                {/* Users Table */}
                <div className="card-premium">
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--gray-200)' }}>
                                    <th style={{ padding: 'var(--spacing-3)', textAlign: 'left' }}>User</th>
                                    <th style={{ padding: 'var(--spacing-3)', textAlign: 'left' }}>Contact</th>
                                    <th style={{ padding: 'var(--spacing-3)', textAlign: 'center' }}>Role</th>
                                    <th style={{ padding: 'var(--spacing-3)', textAlign: 'center' }}>Status</th>
                                    <th style={{ padding: 'var(--spacing-3)', textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user._id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                                        <td style={{ padding: 'var(--spacing-3)' }}>
                                            <p style={{ fontWeight: 600 }}>{user.name}</p>
                                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                                                {user.address?.state || 'N/A'}
                                            </p>
                                        </td>
                                        <td style={{ padding: 'var(--spacing-3)' }}>
                                            <p style={{ fontSize: 'var(--font-size-sm)' }}>{user.email}</p>
                                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                                                {user.phone}
                                            </p>
                                        </td>
                                        <td style={{ padding: 'var(--spacing-3)', textAlign: 'center' }}>
                                            <span className="badge" style={{ textTransform: 'capitalize' }}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: 'var(--spacing-3)', textAlign: 'center' }}>
                                            <div className="flex items-center justify-center gap-2">
                                                {user.isVerified ? (
                                                    <FaUserCheck style={{ color: 'var(--success)' }} />
                                                ) : (
                                                    <FaUserTimes style={{ color: 'var(--warning)' }} />
                                                )}
                                                {user.isActive ? (
                                                    <span style={{ color: 'var(--success)', fontSize: 'var(--font-size-sm)' }}>Active</span>
                                                ) : (
                                                    <span style={{ color: 'var(--error)', fontSize: 'var(--font-size-sm)' }}>Inactive</span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: 'var(--spacing-3)', textAlign: 'center' }}>
                                            <button
                                                onClick={() => handleToggleStatus(user._id, user.isActive)}
                                                className="btn btn-sm btn-outline"
                                            >
                                                {user.isActive ? <FaBan /> : <FaCheckCircle />}
                                                {user.isActive ? ' Deactivate' : ' Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;

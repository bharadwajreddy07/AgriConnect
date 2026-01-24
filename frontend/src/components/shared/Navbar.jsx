import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { FaUser, FaSignOutAlt, FaTractor, FaShoppingCart, FaBox } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { getCartCount } = useCart();
    const navigate = useNavigate();
    const cartCount = getCartCount();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getRoleBasedLinks = () => {
        if (!user) return null;

        switch (user.role) {
            case 'farmer':
                return (
                    <>
                        <Link to="/farmer" className="nav-link">Dashboard</Link>
                        <Link to="/farmer/crops/new" className="nav-link">List Crop</Link>
                        <Link to="/farmer/samples" className="nav-link">Samples</Link>
                        <Link to="/farmer/negotiations" className="nav-link">Negotiations</Link>
                    </>
                );
            case 'wholesaler':
                return (
                    <>
                        <Link to="/wholesaler" className="nav-link">Dashboard</Link>
                        <Link to="/wholesaler/marketplace" className="nav-link">Marketplace</Link>
                    </>
                );
            case 'consumer':
                return (
                    <>
                        <Link to="/consumer" className="nav-link">Dashboard</Link>
                        <Link to="/consumer/products" className="nav-link">Products</Link>
                        <Link to="/consumer/cart" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', position: 'relative' }}>
                            <FaShoppingCart /> Cart
                            {cartCount > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-8px',
                                    right: '-8px',
                                    background: 'var(--accent-orange)',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '20px',
                                    height: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: 700
                                }}>
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        <Link to="/consumer/orders" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                            <FaBox /> My Orders
                        </Link>
                    </>
                );
            case 'admin':
                return (
                    <>
                        <Link to="/admin" className="nav-link">Dashboard</Link>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <nav className="navbar">
            <div className="container">
                <div className="flex items-center justify-between" style={{ padding: 'var(--spacing-4) 0' }}>
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2" style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--primary-green)' }}>
                        <FaTractor />
                        <span>AgriConnect</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center gap-6">
                        {getRoleBasedLinks()}

                        {user ? (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <FaUser style={{ color: 'var(--gray-600)' }} />
                                    <span style={{ fontWeight: 500 }}>{user.name}</span>
                                    {!user.isVerified && user.role !== 'consumer' && (
                                        <span className="badge badge-warning">Unverified</span>
                                    )}
                                </div>
                                <button onClick={handleLogout} className="btn btn-outline btn-sm">
                                    <FaSignOutAlt />
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-4">
                                <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
                                <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <style jsx="true">{`
        .navbar {
          background: var(--white);
          box-shadow: var(--shadow-md);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .nav-link {
          color: var(--gray-700);
          font-weight: 500;
          transition: color var(--transition-base);
        }
        .nav-link:hover {
          color: var(--primary-green);
        }
      `}</style>
        </nav>
    );
};

export default Navbar;

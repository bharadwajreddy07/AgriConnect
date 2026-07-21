import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWholesalerCart } from '../../context/WholesalerCartContext';
import { useI18n } from '../../i18n/i18n';
import { FaUser, FaSignOutAlt, FaTractor, FaShoppingCart, FaBox, FaGlobe, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { getCartCount } = useCart();
    const { getCartTotals } = useWholesalerCart();
    const { t, language, setLanguage, languages } = useI18n();
    const navigate = useNavigate();
    const cartCount = getCartCount();
    const wholesalerCartCount = getCartTotals().itemCount;

    const [langDropdownOpen, setLangDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const langRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (langRef.current && !langRef.current.contains(e.target)) {
                setLangDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentLang = languages.find(l => l.code === language) || languages[0];

    const getRoleBasedLinks = () => {
        if (!user) return null;

        switch (user.role) {
            case 'farmer':
                return (
                    <>
                        <Link to="/farmer" className="nav-link">{t('nav.dashboard')}</Link>
                        <Link to="/farmer/crops/new" className="nav-link">{t('nav.listCrop')}</Link>
                        <Link to="/farmer/samples" className="nav-link">{t('nav.samples')}</Link>
                        <Link to="/farmer/negotiations" className="nav-link">{t('nav.negotiations')}</Link>
                        <Link to="/farmer/consumer-orders" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                            <FaBox /> {t('nav.orders')}
                        </Link>
                    </>
                );
            case 'wholesaler':
                return (
                    <>
                        <Link to="/wholesaler" className="nav-link">{t('nav.dashboard')}</Link>
                        <Link to="/wholesaler/marketplace" className="nav-link">{t('nav.marketplace')}</Link>
                        <Link to="/wholesaler/negotiations" className="nav-link">{t('nav.negotiations')}</Link>
                        <Link to="/wholesaler/orders" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                            <FaBox /> {t('nav.orders')}
                        </Link>
                        <Link to="/wholesaler/cart" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', position: 'relative' }}>
                            <FaShoppingCart /> {t('nav.cart')}
                            {wholesalerCartCount > 0 && (
                                <span className="cart-badge">{wholesalerCartCount}</span>
                            )}
                        </Link>
                    </>
                );
            case 'consumer':
                return (
                    <>
                        <Link to="/consumer" className="nav-link">{t('nav.dashboard')}</Link>
                        <Link to="/consumer/products" className="nav-link">{t('nav.products')}</Link>
                        <Link to="/consumer/cart" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', position: 'relative' }}>
                            <FaShoppingCart /> {t('nav.cart')}
                            {cartCount > 0 && (
                                <span className="cart-badge">{cartCount}</span>
                            )}
                        </Link>
                        <Link to="/consumer/orders" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                            <FaBox /> {t('nav.myOrders')}
                        </Link>
                    </>
                );
            case 'admin':
                return (
                    <>
                        <Link to="/admin" className="nav-link">{t('nav.dashboard')}</Link>
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

                    {/* Mobile Menu Toggle */}
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <FaTimes /> : <FaBars />}
                    </button>

                    {/* Navigation Links */}
                    <div className={`nav-links-container ${mobileMenuOpen ? 'nav-links-open' : ''}`}>
                        {getRoleBasedLinks()}

                        {/* Language Selector */}
                        <div className="lang-selector" ref={langRef}>
                            <button
                                className="lang-btn"
                                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                                aria-label="Select language"
                            >
                                <FaGlobe style={{ fontSize: '1rem' }} />
                                <span className="lang-btn-text">{currentLang.nativeName}</span>
                            </button>

                            {langDropdownOpen && (
                                <div className="lang-dropdown">
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            className={`lang-option ${language === lang.code ? 'lang-option-active' : ''}`}
                                            onClick={() => {
                                                setLanguage(lang.code);
                                                setLangDropdownOpen(false);
                                            }}
                                        >
                                            <span className="lang-flag">{lang.flag}</span>
                                            <span className="lang-native">{lang.nativeName}</span>
                                            <span className="lang-english">{lang.name}</span>
                                            {language === lang.code && (
                                                <span className="lang-check">✓</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {user ? (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <FaUser style={{ color: 'var(--gray-600)' }} />
                                    <span style={{ fontWeight: 500 }}>{user.name}</span>
                                    {!user.isVerified && user.role !== 'consumer' && (
                                        <span className="badge badge-warning">{t('nav.unverified')}</span>
                                    )}
                                </div>
                                <button onClick={handleLogout} className="btn btn-outline btn-sm">
                                    <FaSignOutAlt />
                                    {t('nav.logout')}
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-4">
                                <Link to="/login" className="btn btn-outline btn-sm">{t('nav.login')}</Link>
                                <Link to="/register" className="btn btn-primary btn-sm">{t('nav.register')}</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

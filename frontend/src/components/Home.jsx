import { Link } from 'react-router-dom';
import { FaTractor, FaWarehouse, FaShoppingCart, FaUserShield, FaLeaf, FaHandshake, FaChartLine, FaShieldAlt, FaCheckCircle, FaStar } from 'react-icons/fa';

const Home = () => {
    return (
        <div style={{ background: 'var(--white)' }}>
            {/* Hero Section with Real Image Background */}
            <section
                style={{
                    position: 'relative',
                    minHeight: '90vh',
                    display: 'flex',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.95) 0%, rgba(5, 150, 105, 0.9) 100%)',
                    overflow: 'hidden',
                }}
            >
                {/* Background Image */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: 'url(https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=80)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 0.2,
                        zIndex: 0,
                    }}
                />

                {/* Animated Pattern Overlay */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                        opacity: 0.3,
                        zIndex: 1,
                    }}
                />

                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ maxWidth: '800px' }}>
                        <div className="fade-in-up">
                            <h1
                                style={{
                                    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                                    marginBottom: 'var(--spacing-6)',
                                    fontWeight: 800,
                                    color: 'white',
                                    lineHeight: 1.1,
                                }}
                            >
                                Connecting Farms to Markets,
                                <span style={{
                                    display: 'block',
                                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}>
                                    Empowering Agriculture
                                </span>
                            </h1>
                            <p style={{
                                fontSize: 'var(--font-size-xl)',
                                marginBottom: 'var(--spacing-8)',
                                color: 'rgba(255, 255, 255, 0.95)',
                                lineHeight: 1.6,
                            }}>
                                Join India's fastest-growing agricultural marketplace. Fair prices, transparent deals, and direct connections between farmers, wholesalers, and consumers.
                            </p>
                            <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
                                <Link
                                    to="/register"
                                    className="btn btn-lg ripple"
                                    style={{
                                        background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                                        color: 'white',
                                        fontSize: 'var(--font-size-lg)',
                                        padding: 'var(--spacing-4) var(--spacing-10)',
                                        boxShadow: '0 10px 30px rgba(245, 158, 11, 0.4)',
                                    }}
                                >
                                    Get Started Free →
                                </Link>
                                <Link
                                    to="/login"
                                    className="btn btn-lg"
                                    style={{
                                        borderColor: 'white',
                                        color: 'white',
                                        fontSize: 'var(--font-size-lg)',
                                        padding: 'var(--spacing-4) var(--spacing-10)',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        backdropFilter: 'blur(10px)',
                                        border: '2px solid rgba(255, 255, 255, 0.3)',
                                    }}
                                >
                                    Sign In
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* User Roles Section */}
            <section style={{ padding: '6rem 0', background: 'var(--gray-50)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-12)' }}>
                        <h2 className="gradient-text" style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--spacing-3)' }}>
                            Choose Your Role
                        </h2>
                        <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-lg)', maxWidth: '600px', margin: '0 auto' }}>
                            Whether you're growing, buying, or selling - we've got you covered
                        </p>
                    </div>

                    <div className="grid grid-cols-4 gap-6">
                        {/* Farmer Card */}
                        <div
                            className="card-premium hover-3d"
                            style={{
                                textAlign: 'center',
                                borderTop: '4px solid var(--emerald-500)',
                            }}
                        >
                            <div
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    margin: '0 auto var(--spacing-4)',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
                                }}
                            >
                                <FaTractor style={{ color: 'white', fontSize: '2.5rem' }} />
                            </div>
                            <h3 style={{ marginBottom: 'var(--spacing-3)' }}>Farmer</h3>
                            <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--spacing-4)', fontSize: 'var(--font-size-sm)' }}>
                                List crops, negotiate prices, sell directly to wholesalers and consumers
                            </p>
                            <Link to="/register" className="btn btn-primary" style={{ width: '100%' }}>
                                Join as Farmer
                            </Link>
                        </div>

                        {/* Wholesaler Card */}
                        <div
                            className="card-premium hover-3d"
                            style={{
                                textAlign: 'center',
                                borderTop: '4px solid var(--amber-500)',
                            }}
                        >
                            <div
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    margin: '0 auto var(--spacing-4)',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 10px 30px rgba(245, 158, 11, 0.3)',
                                }}
                            >
                                <FaWarehouse style={{ color: 'white', fontSize: '2.5rem' }} />
                            </div>
                            <h3 style={{ marginBottom: 'var(--spacing-3)' }}>Wholesaler</h3>
                            <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--spacing-4)', fontSize: 'var(--font-size-sm)' }}>
                                Browse crops, request samples, negotiate bulk orders
                            </p>
                            <Link to="/register" className="btn btn-secondary" style={{ width: '100%' }}>
                                Join as Wholesaler
                            </Link>
                        </div>

                        {/* Consumer Card */}
                        <div
                            className="card-premium hover-3d"
                            style={{
                                textAlign: 'center',
                                borderTop: '4px solid var(--sky-500)',
                            }}
                        >
                            <div
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    margin: '0 auto var(--spacing-4)',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
                                }}
                            >
                                <FaShoppingCart style={{ color: 'white', fontSize: '2.5rem' }} />
                            </div>
                            <h3 style={{ marginBottom: 'var(--spacing-3)' }}>Consumer</h3>
                            <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--spacing-4)', fontSize: 'var(--font-size-sm)' }}>
                                Buy fresh produce directly from farmers at fair prices
                            </p>
                            <Link to="/register" className="btn btn-primary" style={{ width: '100%' }}>
                                Shop Now
                            </Link>
                        </div>

                        {/* Admin Card */}
                        <div
                            className="card-premium hover-3d"
                            style={{
                                textAlign: 'center',
                                borderTop: '4px solid var(--gray-700)',
                            }}
                        >
                            <div
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    margin: '0 auto var(--spacing-4)',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 10px 30px rgba(55, 65, 81, 0.3)',
                                }}
                            >
                                <FaUserShield style={{ color: 'white', fontSize: '2.5rem' }} />
                            </div>
                            <h3 style={{ marginBottom: 'var(--spacing-3)' }}>Admin</h3>
                            <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--spacing-4)', fontSize: 'var(--font-size-sm)' }}>
                                Manage platform, verify users, monitor transactions
                            </p>
                            <Link to="/admin/login" className="btn btn-outline" style={{ width: '100%' }}>
                                Admin Access
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Crops Section */}
            <section style={{ padding: '6rem 0', background: 'white' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-12)' }}>
                        <h2 className="gradient-text" style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--spacing-3)' }}>
                            Featured Seasonal Crops
                        </h2>
                        <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-lg)', maxWidth: '600px', margin: '0 auto' }}>
                            Fresh produce from verified farmers across India
                        </p>
                    </div>

                    <div className="grid grid-cols-4 gap-6">
                        {[
                            { name: 'Basmati Rice', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80', season: 'Kharif', price: '50', location: 'Punjab' },
                            { name: 'Alphonso Mangoes', image: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800&q=80', season: 'Zaid', price: '120', location: 'Maharashtra' },
                            { name: 'Tomatoes', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80', season: 'Year-Round', price: '25', location: 'Karnataka' },
                            { name: 'Green Grapes', image: 'https://images.unsplash.com/photo-1537640538965-17562995e9bb?w=800&q=80', season: 'Rabi', price: '50', location: 'Maharashtra' },
                            { name: 'Wheat', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80', season: 'Rabi', price: '22', location: 'Haryana' },
                            { name: 'Chickpeas (Kabuli)', image: 'https://images.unsplash.com/photo-1610440042657-612c396ff084?w=800&q=80', season: 'Rabi', price: '65', location: 'Rajasthan' },
                            { name: 'Oranges (Nagpur)', image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=800&q=80', season: 'Rabi', price: '32', location: 'Maharashtra' },
                            { name: 'Red Onions', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&q=80', season: 'Rabi', price: '18', location: 'Maharashtra' },
                        ].map((crop, index) => (
                            <div key={index} className="crop-card hover-3d">
                                <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-2xl) var(--radius-2xl) 0 0' }}>
                                    <img
                                        src={crop.image}
                                        alt={crop.name}
                                        className="crop-card-image"
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        top: 'var(--spacing-3)',
                                        right: 'var(--spacing-3)',
                                    }}>
                                        <span className={`badge ${crop.season === 'Kharif' ? 'season-kharif' : crop.season === 'Rabi' ? 'season-rabi' : crop.season === 'Zaid' ? 'season-zaid' : 'badge-info'}`}>
                                            {crop.season}
                                        </span>
                                    </div>
                                </div>
                                <div className="crop-card-content">
                                    <h4 className="crop-card-title">{crop.name}</h4>
                                    <div className="crop-card-meta">
                                        <span>📍 {crop.location}</span>
                                    </div>
                                    <div className="crop-card-price">₹{crop.price}/kg</div>
                                    <div className="crop-card-footer">
                                        <span className="badge badge-success" style={{ fontSize: 'var(--font-size-xs)' }}>
                                            ✓ Verified
                                        </span>
                                        <Link to="/register" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--primary-green)', fontWeight: 600 }}>
                                            View Details →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: 'var(--spacing-10)' }}>
                        <Link to="/register" className="btn btn-primary btn-lg">
                            Explore All Crops →
                        </Link>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section style={{ padding: '6rem 0', background: 'white' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-12)' }}>
                        <h2 className="gradient-text" style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--spacing-3)' }}>
                            How AgriConnect Works
                        </h2>
                        <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-lg)', maxWidth: '600px', margin: '0 auto' }}>
                            Simple, transparent, and efficient agricultural marketplace
                        </p>
                    </div>

                    <div className="grid grid-cols-4 gap-8">
                        {[
                            {
                                step: '01',
                                title: 'Register & Verify',
                                description: 'Create your account and get verified by our admin team for secure trading',
                                icon: FaUserShield,
                                color: '#10b981',
                            },
                            {
                                step: '02',
                                title: 'List or Browse',
                                description: 'Farmers list crops, buyers browse seasonal produce with quality samples',
                                icon: FaLeaf,
                                color: '#f59e0b',
                            },
                            {
                                step: '03',
                                title: 'Negotiate & Deal',
                                description: 'Fair price negotiation based on quality, quantity, and market rates',
                                icon: FaHandshake,
                                color: '#0ea5e9',
                            },
                            {
                                step: '04',
                                title: 'Track & Deliver',
                                description: 'Real-time order tracking from farm to delivery with transparency',
                                icon: FaChartLine,
                                color: '#8b5cf6',
                            },
                        ].map((item, index) => (
                            <div key={index} className="scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                                <div
                                    style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        background: `${item.color}20`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: 'var(--spacing-4)',
                                    }}
                                >
                                    <item.icon style={{ color: item.color, fontSize: '1.8rem' }} />
                                </div>
                                <div
                                    style={{
                                        fontSize: 'var(--font-size-3xl)',
                                        fontWeight: 700,
                                        color: item.color,
                                        marginBottom: 'var(--spacing-2)',
                                        opacity: 0.3,
                                    }}
                                >
                                    {item.step}
                                </div>
                                <h4 style={{ marginBottom: 'var(--spacing-2)' }}>{item.title}</h4>
                                <p style={{ color: 'var(--gray-600)', fontSize: 'var(--font-size-sm)' }}>
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* CTA Section */}
            <section
                style={{
                    padding: '6rem 0',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #10b981 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: 'url(https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1920&q=80)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 0.1,
                    }}
                />
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <h2 style={{ fontSize: 'var(--font-size-4xl)', color: 'white', marginBottom: 'var(--spacing-4)' }}>
                        Ready to Transform Agriculture?
                    </h2>
                    <p style={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: 'var(--font-size-xl)',
                        marginBottom: 'var(--spacing-8)',
                        maxWidth: '700px',
                        margin: '0 auto var(--spacing-8)',
                    }}>
                        Join thousands of farmers, wholesalers, and consumers making agriculture more efficient, transparent, and profitable
                    </p>
                    <Link
                        to="/register"
                        className="btn btn-lg ripple"
                        style={{
                            background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                            color: 'white',
                            fontSize: 'var(--font-size-xl)',
                            padding: 'var(--spacing-5) var(--spacing-12)',
                            boxShadow: '0 10px 40px rgba(245, 158, 11, 0.5)',
                        }}
                    >
                        Create Your Free Account →
                    </Link>
                </div>
            </section>



            {/* Footer */}
            <footer style={{ background: 'var(--gray-900)', color: 'white', padding: '3rem 0 2rem' }}>
                <div className="container">
                    <div className="grid grid-cols-4 gap-8 mb-8">
                        <div>
                            <h4 style={{ color: 'white', marginBottom: 'var(--spacing-4)' }}>AgriConnect</h4>
                            <p style={{ color: 'var(--gray-400)', fontSize: 'var(--font-size-sm)' }}>
                                India's leading agricultural marketplace connecting farmers, wholesalers, and consumers.
                            </p>
                        </div>
                        <div>
                            <h5 style={{ color: 'white', marginBottom: 'var(--spacing-3)' }}>Platform</h5>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {['For Farmers', 'For Wholesalers', 'For Consumers', 'Pricing'].map((item, i) => (
                                    <li key={i} style={{ marginBottom: 'var(--spacing-2)' }}>
                                        <a href="#" style={{ color: 'var(--gray-400)', fontSize: 'var(--font-size-sm)' }}>{item}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h5 style={{ color: 'white', marginBottom: 'var(--spacing-3)' }}>Company</h5>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {['About Us', 'Contact', 'Careers', 'Blog'].map((item, i) => (
                                    <li key={i} style={{ marginBottom: 'var(--spacing-2)' }}>
                                        <a href="#" style={{ color: 'var(--gray-400)', fontSize: 'var(--font-size-sm)' }}>{item}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h5 style={{ color: 'white', marginBottom: 'var(--spacing-3)' }}>Legal</h5>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Disclaimer'].map((item, i) => (
                                    <li key={i} style={{ marginBottom: 'var(--spacing-2)' }}>
                                        <a href="#" style={{ color: 'var(--gray-400)', fontSize: 'var(--font-size-sm)' }}>{item}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div style={{ borderTop: '1px solid var(--gray-800)', paddingTop: 'var(--spacing-6)', textAlign: 'center' }}>
                        <p style={{ color: 'var(--gray-500)', fontSize: 'var(--font-size-sm)' }}>
                            © 2026 AgriConnect. All rights reserved. Made with ❤️ for Indian Agriculture
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;

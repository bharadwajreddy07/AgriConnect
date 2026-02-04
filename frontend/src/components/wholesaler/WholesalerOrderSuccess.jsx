import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaBox, FaTruck, FaEye } from 'react-icons/fa';

const WholesalerOrderSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const orderCount = searchParams.get('count') || '1';
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--spacing-4)'
        }}>
            <div className="card-premium" style={{
                maxWidth: '600px',
                width: '100%',
                textAlign: 'center',
                padding: 'var(--spacing-8)'
            }}>
                {/* Success Icon */}
                <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto var(--spacing-6)',
                    animation: 'scaleIn 0.5s ease-out'
                }}>
                    <FaCheckCircle style={{ fontSize: '3rem', color: 'white' }} />
                </div>

                {/* Success Message */}
                <h1 style={{
                    color: 'var(--primary-green)',
                    marginBottom: 'var(--spacing-2)',
                    fontSize: 'var(--font-size-2xl)',
                    fontWeight: 700
                }}>
                    Order{orderCount > 1 ? 's' : ''} Placed Successfully! 🎉
                </h1>

                <p style={{
                    color: 'var(--gray-600)',
                    fontSize: 'var(--font-size-lg)',
                    marginBottom: 'var(--spacing-6)'
                }}>
                    Your {orderCount} wholesale order{orderCount > 1 ? 's have' : ' has'} been confirmed.
                    Farmers will be notified immediately.
                </p>

                {/* Order Info Cards */}
                <div className="grid gap-4 mb-6" style={{ textAlign: 'left' }}>
                    <div style={{
                        padding: 'var(--spacing-4)',
                        background: 'var(--green-50)',
                        borderRadius: 'var(--radius-lg)',
                        border: '2px solid var(--green-200)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                            <FaBox style={{ fontSize: '1.5rem', color: 'var(--primary-green)' }} />
                            <div>
                                <p style={{ fontWeight: 600, color: 'var(--gray-900)', marginBottom: 'var(--spacing-1)' }}>
                                    Order Confirmation
                                </p>
                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                    Separate orders created for each item
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        padding: 'var(--spacing-4)',
                        background: 'var(--blue-50)',
                        borderRadius: 'var(--radius-lg)',
                        border: '2px solid var(--blue-200)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                            <FaTruck style={{ fontSize: '1.5rem', color: 'var(--accent-blue)' }} />
                            <div>
                                <p style={{ fontWeight: 600, color: 'var(--gray-900)', marginBottom: 'var(--spacing-1)' }}>
                                    Track Your Orders
                                </p>
                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                    Monitor delivery status in real-time
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => navigate('/wholesaler/orders')}
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-2)' }}
                    >
                        <FaEye /> View Orders
                    </button>
                    <button
                        onClick={() => navigate('/wholesaler/dashboard')}
                        className="btn btn-outline"
                    >
                        Go to Dashboard
                    </button>
                </div>

                {/* Auto Redirect Notice */}
                {countdown > 0 && (
                    <p style={{
                        marginTop: 'var(--spacing-4)',
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--gray-500)'
                    }}>
                        Redirecting to orders page in {countdown} seconds...
                    </p>
                )}
            </div>

            <style>{`
                @keyframes scaleIn {
                    from {
                        transform: scale(0);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default WholesalerOrderSuccess;

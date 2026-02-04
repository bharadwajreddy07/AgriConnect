import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WholesalerCartProvider } from './context/WholesalerCartContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AdminLogin from './components/auth/AdminLogin';
import OTPLogin from './components/auth/OTPLogin';
import GoogleCallback from './components/auth/GoogleCallback';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';

// Farmer Components
import FarmerDashboard from './components/farmer/FarmerDashboard';
import CropListing from './components/farmer/CropListing';
import EditCrop from './components/farmer/EditCrop';
import SampleRequests from './components/farmer/SampleRequests';
import NegotiationPanel from './components/farmer/NegotiationPanel';
import NegotiationDetail from './components/farmer/NegotiationDetail';
import MyCrops from './components/farmer/MyCrops';
import ConsumerOrders from './components/farmer/ConsumerOrders';
import Inventory from './components/farmer/Inventory';
import SalesAnalytics from './components/farmer/SalesAnalytics';

// Wholesaler Components
import WholesalerDashboard from './components/wholesaler/WholesalerDashboard';
import WholesalerMarketplace from './components/wholesaler/WholesalerMarketplace';
import WholesalerSamples from './components/wholesaler/WholesalerSamples';
import WholesalerOrders from './components/wholesaler/WholesalerOrders';
import WholesalerMyOrders from './components/wholesaler/WholesalerMyOrders';
import WholesalerOrderTracking from './components/wholesaler/WholesalerOrderTracking';
import WholesalerNegotiation from './components/wholesaler/WholesalerNegotiation';
import WholesalerNegotiationDetail from './components/wholesaler/WholesalerNegotiationDetail';
import WholesalerCart from './components/wholesaler/WholesalerCart';
import WholesalerCheckout from './components/wholesaler/WholesalerCheckout';
import WholesalerOrderSuccess from './components/wholesaler/WholesalerOrderSuccess';
import WholesalerInvestments from './components/wholesaler/WholesalerInvestments';

// Consumer Components
import ConsumerDashboard from './components/consumer/ConsumerDashboard';
import ProductCatalog from './components/consumer/ProductCatalog';
import ShoppingCart from './components/consumer/ShoppingCart';
import Checkout from './components/consumer/Checkout';
import OrderConfirmation from './components/consumer/OrderConfirmation';
import OrderTracking from './components/consumer/OrderTracking';
import MyOrders from './components/consumer/MyOrders';
import ProductDetail from './components/consumer/ProductDetail';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import VerificationRequests from './components/admin/VerificationRequests';
import UserManagement from './components/admin/UserManagement';
import AdminAnalytics from './components/admin/AdminAnalytics';
import CropApprovalDetail from './components/admin/CropApprovalDetail';
import UserVerificationDetail from './components/admin/UserVerificationDetail';

// Shared Components
import Navbar from './components/shared/Navbar';
import Home from './components/Home';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to={`/${user.role}`} replace />;
    }

    return children;
};

// App Routes Component
const AppRoutes = () => {
    const { user } = useAuth();

    return (
        <>
            <Navbar />
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={user ? <Navigate to={`/${user.role}`} replace /> : <Home />} />
                <Route
                    path="/login"
                    element={user ? <Navigate to={`/${user.role}`} replace /> : <Login />}
                />
                <Route
                    path="/login/otp"
                    element={user ? <Navigate to={`/${user.role}`} replace /> : <OTPLogin />}
                />
                <Route
                    path="/auth/google/callback"
                    element={<GoogleCallback />}
                />
                <Route
                    path="/register"
                    element={user ? <Navigate to={`/${user.role}`} replace /> : <Register />}
                />
                <Route
                    path="/admin/login"
                    element={user ? <Navigate to={`/${user.role}`} replace /> : <AdminLogin />}
                />
                <Route
                    path="/forgot-password"
                    element={user ? <Navigate to={`/${user.role}`} replace /> : <ForgotPassword />}
                />
                <Route
                    path="/reset-password/:token"
                    element={user ? <Navigate to={`/${user.role}`} replace /> : <ResetPassword />}
                />

                {/* Farmer Routes */}
                <Route
                    path="/farmer"
                    element={
                        <ProtectedRoute allowedRoles={['farmer']}>
                            <FarmerDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/farmer/crops/new"
                    element={
                        <ProtectedRoute allowedRoles={['farmer']}>
                            <CropListing />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/farmer/samples"
                    element={
                        <ProtectedRoute allowedRoles={['farmer']}>
                            <SampleRequests />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/farmer/negotiations"
                    element={
                        <ProtectedRoute allowedRoles={['farmer']}>
                            <NegotiationPanel />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/farmer/negotiations/:id"
                    element={
                        <ProtectedRoute allowedRoles={['farmer']}>
                            <NegotiationDetail />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/farmer/crops"
                    element={
                        <ProtectedRoute allowedRoles={['farmer']}>
                            <MyCrops />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/farmer/crops/edit/:id"
                    element={
                        <ProtectedRoute allowedRoles={['farmer']}>
                            <EditCrop />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/farmer/consumer-orders"
                    element={
                        <ProtectedRoute allowedRoles={['farmer']}>
                            <ConsumerOrders />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/farmer/inventory"
                    element={
                        <ProtectedRoute allowedRoles={['farmer']}>
                            <Inventory />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/farmer/analytics"
                    element={
                        <ProtectedRoute allowedRoles={['farmer']}>
                            <SalesAnalytics />
                        </ProtectedRoute>
                    }
                />

                {/* Wholesaler Routes */}
                <Route
                    path="/wholesaler"
                    element={
                        <ProtectedRoute allowedRoles={['wholesaler']}>
                            <WholesalerDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/wholesaler/marketplace"
                    element={
                        <ProtectedRoute allowedRoles={['wholesaler']}>
                            <WholesalerMarketplace />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/wholesaler/samples"
                    element={
                        <ProtectedRoute allowedRoles={['wholesaler']}>
                            <WholesalerSamples />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/wholesaler/negotiations"
                    element={
                        <ProtectedRoute allowedRoles={['wholesaler']}>
                            <WholesalerNegotiation />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/wholesaler/negotiations/:id"
                    element={
                        <ProtectedRoute allowedRoles={['wholesaler']}>
                            <WholesalerNegotiationDetail />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/wholesaler/negotiate/:cropId"
                    element={
                        <ProtectedRoute allowedRoles={['wholesaler']}>
                            <WholesalerNegotiation />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/wholesaler/orders"
                    element={
                        <ProtectedRoute allowedRoles={['wholesaler']}>
                            <WholesalerMyOrders />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/wholesaler/orders/:orderId"
                    element={
                        <ProtectedRoute allowedRoles={['wholesaler']}>
                            <WholesalerOrderTracking />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/wholesaler/cart"
                    element={
                        <ProtectedRoute allowedRoles={['wholesaler']}>
                            <WholesalerCart />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/wholesaler/checkout"
                    element={
                        <ProtectedRoute allowedRoles={['wholesaler']}>
                            <WholesalerCheckout />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/wholesaler/order-success"
                    element={
                        <ProtectedRoute allowedRoles={['wholesaler']}>
                            <WholesalerOrderSuccess />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/wholesaler/investments"
                    element={
                        <ProtectedRoute allowedRoles={['wholesaler']}>
                            <WholesalerInvestments />
                        </ProtectedRoute>
                    }
                />

                {/* Consumer Routes */}
                <Route
                    path="/consumer"
                    element={
                        <ProtectedRoute allowedRoles={['consumer']}>
                            <ConsumerDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/consumer/products"
                    element={
                        <ProtectedRoute allowedRoles={['consumer']}>
                            <ProductCatalog />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/consumer/product/:productId"
                    element={
                        <ProtectedRoute allowedRoles={['consumer']}>
                            <ProductDetail />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/consumer/cart"
                    element={
                        <ProtectedRoute allowedRoles={['consumer']}>
                            <ShoppingCart />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/consumer/checkout"
                    element={
                        <ProtectedRoute allowedRoles={['consumer']}>
                            <Checkout />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/consumer/order-confirmation/:orderId"
                    element={
                        <ProtectedRoute allowedRoles={['consumer']}>
                            <OrderConfirmation />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/consumer/orders"
                    element={
                        <ProtectedRoute allowedRoles={['consumer']}>
                            <MyOrders />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/consumer/orders/:orderId"
                    element={
                        <ProtectedRoute allowedRoles={['consumer']}>
                            <OrderTracking />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Routes */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/verifications"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <VerificationRequests />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/users"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <UserManagement />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/analytics"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminAnalytics />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/crops/:id/approve"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <CropApprovalDetail />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/users/:id/verify"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <UserVerificationDetail />
                        </ProtectedRoute>
                    }
                />

                {/* 404 Route */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <WholesalerCartProvider>
                    <CartProvider>
                        <AppRoutes />
                        <ToastContainer
                            position="top-right"
                            autoClose={3000}
                            hideProgressBar={false}
                            newestOnTop
                            closeOnClick
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                        />
                    </CartProvider>
                </WholesalerCartProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;

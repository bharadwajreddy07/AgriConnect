import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Export AuthContext for direct usage
export { AuthContext };

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            // Set default axios header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // Load user profile
            loadUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const loadUser = async () => {
        try {
            const response = await axios.get('/api/auth/profile');
            setUser(response.data);
        } catch (error) {
            console.error('Failed to load user:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await axios.post('/api/auth/login', { email, password });
            const { token, ...userData } = response.data;

            localStorage.setItem('token', token);
            setToken(token);
            setUser(userData);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            return { success: true, user: userData };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed',
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post('/api/auth/register', userData);
            const { token, ...newUser } = response.data;

            localStorage.setItem('token', token);
            setToken(token);
            setUser(newUser);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            return { success: true, user: newUser };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed',
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    const updateUser = (updatedData) => {
        setUser((prev) => ({ ...prev, ...updatedData }));
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

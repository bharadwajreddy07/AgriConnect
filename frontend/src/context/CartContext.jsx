import { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('agriconnect_cart');
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (e) {
                console.error('Failed to parse cart', e);
            }
        }
        setLoading(false);
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('agriconnect_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, quantity = 1) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item._id === product._id);

            if (existingItem) {
                // Update quantity if item already in cart
                return prevItems.map(item =>
                    item._id === product._id
                        ? { ...item, cartQuantity: item.cartQuantity + quantity }
                        : item
                );
            } else {
                // Add new item to cart
                return [...prevItems, { ...product, cartQuantity: quantity }];
            }
        });
        toast.success(`${product.name} added to cart!`);
    };

    const removeFromCart = (productId) => {
        setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
        toast.info('Item removed from cart');
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCartItems(prevItems =>
            prevItems.map(item =>
                item._id === productId
                    ? { ...item, cartQuantity: quantity }
                    : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
        toast.info('Cart cleared');
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => {
            const price = item.consumerPrice || item.expectedPrice;
            return total + (price * item.cartQuantity);
        }, 0);
    };

    const getCartCount = () => {
        return cartItems.reduce((count, item) => count + item.cartQuantity, 0);
    };

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartTotal,
        getCartCount,
        loading,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;

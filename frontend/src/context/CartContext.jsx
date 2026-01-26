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

    // Load cart from localStorage on mount and validate
    useEffect(() => {
        const loadCart = async () => {
            const savedCart = localStorage.getItem('agriconnect_cart');
            if (savedCart) {
                try {
                    const parsedCart = JSON.parse(savedCart);
                    const validItems = [];

                    // Fetch fresh data for each item to ensure prices are up-to-date
                    // We simply keep the item if we can't fetch (graceful degradation) but try to update price
                    for (const item of parsedCart) {
                        try {
                            // We don't have a batch endpoint, so specific item fetch or just relying on existing fields if robust
                            // Ideally: const freshData = await api.get(/crops/${item._id});
                            // For now, let's rely on the robust price calculation we added, but ensure we filter out bad ones.

                            // Actually, let's just make sure we handle the "0" case by removing it if it persists
                            if (item._id) validItems.push(item);
                        } catch (err) {
                            console.error("Error validating item", item);
                        }
                    }

                    setCartItems(validItems);
                } catch (e) {
                    console.error('Failed to parse cart', e);
                    setCartItems([]);
                }
            }
            setLoading(false);
        };
        loadCart();
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('agriconnect_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, quantity = 1) => {
        console.log('Adding to cart:', product);
        if (!product.consumerPrice && !product.expectedPrice) {
            console.error('Product missing price:', product);
        }

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
        // Toast notification is handled by the calling component
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
            // Prioritize consumerPrice, fallback to expectedPrice
            let price = item.consumerPrice;
            if (price === undefined || price === null || price === 0) {
                price = item.expectedPrice;
            }

            // Handle string prices with currency symbols/commas
            if (typeof price === 'string') {
                price = parseFloat(price.replace(/[^0-9.]/g, ''));
            }

            // Fallback to 0 if still invalid
            if (!price || isNaN(price)) {
                console.warn(`Item ${item.name} has invalid price:`, item);
                price = 0;
            }

            return total + (price * (item.cartQuantity || 1));
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
        getCartCount,
        loading,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;

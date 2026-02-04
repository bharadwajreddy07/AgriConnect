import { createContext, useContext, useState, useEffect } from 'react';

const WholesalerCartContext = createContext();

export const useWholesalerCart = () => {
    const context = useContext(WholesalerCartContext);
    if (!context) {
        // Return default values instead of throwing error
        return {
            cartItems: [],
            addNegotiationToCart: () => { },
            addDirectPurchaseToCart: () => { },
            removeFromCart: () => { },
            updateQuantity: () => { },
            clearCart: () => { },
            getCartTotals: () => ({ subtotal: 0, itemCount: 0, total: 0 }),
        };
    }
    return context;
};

export const WholesalerCartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('wholesalerCart');
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (error) {
                console.error('Error loading cart:', error);
                localStorage.removeItem('wholesalerCart');
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('wholesalerCart', JSON.stringify(cartItems));
    }, [cartItems]);

    // Add item to cart from negotiation
    const addNegotiationToCart = (negotiation) => {
        const cartItem = {
            id: negotiation._id,
            type: 'negotiation',
            negotiationId: negotiation._id,
            crop: negotiation.crop,
            farmer: negotiation.farmer,
            quantity: negotiation.agreedQuantity,
            pricePerUnit: negotiation.finalAgreedPrice,
            totalAmount: negotiation.totalAmount,
            addedAt: new Date().toISOString(),
        };

        setCartItems((prev) => {
            // Check if already in cart
            const exists = prev.find((item) => item.negotiationId === negotiation._id);
            if (exists) {
                return prev; // Don't add duplicates
            }
            return [...prev, cartItem];
        });
    };

    // Add item to cart for direct purchase
    const addDirectPurchaseToCart = (crop, quantity) => {
        const cartItem = {
            id: `direct_${crop._id}_${Date.now()}`,
            type: 'direct',
            crop: crop,
            farmer: crop.farmer,
            quantity: quantity,
            pricePerUnit: crop.expectedPrice,
            totalAmount: crop.expectedPrice * quantity.value,
            addedAt: new Date().toISOString(),
        };

        setCartItems((prev) => [...prev, cartItem]);
    };

    // Remove item from cart
    const removeFromCart = (itemId) => {
        setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    };

    // Update quantity
    const updateQuantity = (itemId, newQuantity) => {
        setCartItems((prev) =>
            prev.map((item) => {
                if (item.id === itemId) {
                    const totalAmount = item.pricePerUnit * newQuantity.value;
                    return {
                        ...item,
                        quantity: newQuantity,
                        totalAmount,
                    };
                }
                return item;
            })
        );
    };

    // Clear cart
    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('wholesalerCart');
    };

    // Get cart totals
    const getCartTotals = () => {
        const subtotal = cartItems.reduce((sum, item) => sum + item.totalAmount, 0);
        const itemCount = cartItems.length;

        return {
            subtotal,
            itemCount,
            total: subtotal, // Can add taxes/fees later
        };
    };

    const value = {
        cartItems,
        addNegotiationToCart,
        addDirectPurchaseToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotals,
    };

    return (
        <WholesalerCartContext.Provider value={value}>
            {children}
        </WholesalerCartContext.Provider>
    );
};

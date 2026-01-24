/**
 * Shopping Cart Utility Functions
 * Manages cart state in localStorage with validation
 */

const CART_STORAGE_KEY = 'agrimart_cart';

/**
 * Get cart from localStorage
 */
export const getCart = () => {
    try {
        const cart = localStorage.getItem(CART_STORAGE_KEY);
        return cart ? JSON.parse(cart) : [];
    } catch (error) {
        console.error('Error reading cart:', error);
        return [];
    }
};

/**
 * Save cart to localStorage
 */
export const saveCart = (cart) => {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        return true;
    } catch (error) {
        console.error('Error saving cart:', error);
        return false;
    }
};

/**
 * Add item to cart or update quantity if exists
 */
export const addToCart = (product, quantity = 1) => {
    const cart = getCart();
    const existingItemIndex = cart.findIndex(item => item._id === product._id);

    if (existingItemIndex > -1) {
        // Update quantity
        cart[existingItemIndex].cartQuantity += quantity;

        // Check stock limit
        if (cart[existingItemIndex].cartQuantity > product.stockQuantity) {
            cart[existingItemIndex].cartQuantity = product.stockQuantity;
        }
    } else {
        // Add new item
        cart.push({
            ...product,
            cartQuantity: Math.min(quantity, product.stockQuantity),
        });
    }

    saveCart(cart);
    return cart;
};

/**
 * Update item quantity in cart
 */
export const updateCartQuantity = (productId, quantity) => {
    const cart = getCart();
    const itemIndex = cart.findIndex(item => item._id === productId);

    if (itemIndex > -1) {
        if (quantity <= 0) {
            // Remove item if quantity is 0 or less
            cart.splice(itemIndex, 1);
        } else {
            // Update quantity (respect stock limit)
            const maxQuantity = cart[itemIndex].stockQuantity;
            cart[itemIndex].cartQuantity = Math.min(quantity, maxQuantity);
        }
        saveCart(cart);
    }

    return cart;
};

/**
 * Remove item from cart
 */
export const removeFromCart = (productId) => {
    const cart = getCart();
    const updatedCart = cart.filter(item => item._id !== productId);
    saveCart(updatedCart);
    return updatedCart;
};

/**
 * Clear entire cart
 */
export const clearCart = () => {
    localStorage.removeItem(CART_STORAGE_KEY);
    return [];
};

/**
 * Get total number of items in cart
 */
export const getCartCount = () => {
    const cart = getCart();
    return cart.reduce((total, item) => total + item.cartQuantity, 0);
};

/**
 * Calculate cart subtotal
 */
export const getCartSubtotal = () => {
    const cart = getCart();
    return cart.reduce((total, item) => {
        const price = item.consumerPrice || 0;
        return total + (price * item.cartQuantity);
    }, 0);
};

/**
 * Calculate delivery charges based on cart total
 */
export const calculateDeliveryCharges = (subtotal) => {
    if (subtotal >= 1000) return 0; // Free delivery above ₹1000
    if (subtotal >= 500) return 40;
    return 60;
};

/**
 * Calculate tax (GST)
 */
export const calculateTax = (subtotal) => {
    // 5% GST on food items
    return subtotal * 0.05;
};

/**
 * Get cart total with all charges
 */
export const getCartTotal = () => {
    const subtotal = getCartSubtotal();
    const delivery = calculateDeliveryCharges(subtotal);
    const tax = calculateTax(subtotal);

    return {
        subtotal,
        delivery,
        tax,
        total: subtotal + delivery + tax,
    };
};

/**
 * Validate cart items against current stock
 * Returns array of items with stock issues
 */
export const validateCart = async (apiClient) => {
    const cart = getCart();
    const issues = [];

    for (const item of cart) {
        try {
            const response = await apiClient.get(`/marketplace/crops/${item._id}`);
            const currentProduct = response.data.data;

            if (!currentProduct.availableForConsumers) {
                issues.push({
                    productId: item._id,
                    productName: item.name,
                    issue: 'no_longer_available',
                    message: 'This product is no longer available',
                });
            } else if (currentProduct.stockQuantity === 0) {
                issues.push({
                    productId: item._id,
                    productName: item.name,
                    issue: 'out_of_stock',
                    message: 'This product is out of stock',
                });
            } else if (item.cartQuantity > currentProduct.stockQuantity) {
                issues.push({
                    productId: item._id,
                    productName: item.name,
                    issue: 'insufficient_stock',
                    message: `Only ${currentProduct.stockQuantity} units available`,
                    availableQuantity: currentProduct.stockQuantity,
                });
            } else if (item.consumerPrice !== currentProduct.consumerPrice) {
                issues.push({
                    productId: item._id,
                    productName: item.name,
                    issue: 'price_changed',
                    message: 'Price has changed',
                    oldPrice: item.consumerPrice,
                    newPrice: currentProduct.consumerPrice,
                });
            }
        } catch (error) {
            issues.push({
                productId: item._id,
                productName: item.name,
                issue: 'validation_error',
                message: 'Unable to validate this product',
            });
        }
    }

    return issues;
};

/**
 * Format price in Indian Rupees
 */
export const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(price);
};

/**
 * Check if cart is empty
 */
export const isCartEmpty = () => {
    return getCart().length === 0;
};

/**
 * Get cart item by product ID
 */
export const getCartItem = (productId) => {
    const cart = getCart();
    return cart.find(item => item._id === productId);
};

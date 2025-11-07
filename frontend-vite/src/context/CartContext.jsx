import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchCart = async () => {
    // ... (same as before) ...
    setLoading(true);
    try {
      const { data } = await api.get('/cart');
      setCart(data);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // ... (same as before) ...
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart({ items: [], total: 0 });
    }
  }, [isAuthenticated]);

  const addToCart = async (productId, quantity) => {
    // ... (same as before) ...
    if (!isAuthenticated) {
      alert('Please log in to add items to your cart.');
      return;
    }
    try {
      await api.post('/cart', { productId, quantity });
      await fetchCart();
    } catch (err) {
      console.error('Failed to add to cart:', err);
      alert(err.response?.data?.message || 'Error adding to cart');
    }
  };

  const removeFromCart = async (cartItemId) => {
    // ... (same as before) ...
    try {
      await api.delete(`/cart/${cartItemId}`);
      await fetchCart();
    } catch (err) {
      console.error('Failed to remove from cart:', err);
      alert('Error removing item from cart');
    }
  };
  
  // --- NEW FUNCTION ---
  const decreaseQuantity = async (productId) => {
    try {
      await api.post('/cart/decrease', { productId });
      await fetchCart();
    } catch (err) {
      console.error('Failed to decrease quantity:', err);
      alert('Error decreasing quantity');
    }
  };
  // --- END NEW FUNCTION ---

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        loading, 
        addToCart, 
        removeFromCart, 
        fetchCart, 
        decreaseQuantity // Add new function
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};
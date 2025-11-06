import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';
const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/cart`);
      setCart(data);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (productId, quantity) => {
    try {
      await axios.post(`${API_URL}/cart`, { productId, quantity });
      fetchCart(); // Re-fetch cart to update state
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await axios.delete(`${API_URL}/cart/${cartItemId}`);
      fetchCart(); // Re-fetch
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const checkout = async () => {
    try {
      const { data } = await axios.post(`${API_URL}/checkout`, { total: cart.total });
      fetchCart(); // Clears the cart
      return data.receipt; // Return receipt for modal
    } catch (error) {
      console.error("Error checking out:", error);
      return null;
    }
  };

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, removeFromCart, checkout }}>
      {children}
    </CartContext.Provider>
  );
};
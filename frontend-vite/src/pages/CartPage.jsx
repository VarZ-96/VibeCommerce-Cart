import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import api from '../api'; // Import our api service
import styles from './CartPage.module.css';

// Get the public key from the .env file
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

// A simple Trash Can SVG Icon
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.578 0v-.001a48.108 48.108 0 0 1 3.478-.397m7.5 0v-.001a48.108 48.108 0 0 0-3.478-.397m-7.5 0v-.001a48.108 48.108 0 0 1-3.478-.397m12.578 0c-.105.02-.213.038-.323.054a48.093 48.093 0 0 1-3.426.054m-7.5 0c.105.02.213.038.323.054a48.093 48.093 0 0 0 3.426.054m0 0c-1.141 0-2.277.054-3.426.054M4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.578 0v-.001a48.108 48.108 0 0 1 3.478-.397m7.5 0v-.001a48.108 48.108 0 0 0-3.478-.397m-7.5 0v-.001a48.108 48.108 0 0 1-3.478-.397m12.578 0c-.105.02-.213.038-.323.054a48.093 48.093 0 0 1-3.426.054m-7.5 0c.105.02.213.038.323.054a48.093 48.093 0 0 0 3.426.054m0 0c-1.141 0-2.277.054-3.426.054" />
  </svg>
);

const CartPage = () => {
  const { cart, loading, removeFromCart, addToCart, decreaseQuantity, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- THIS IS THE FULL, WORKING CHECKOUT FUNCTION ---
  const handleCheckout = async () => {
    if (!user) {
      alert('Please log in to check out.');
      return;
    }

    try {
      // Step 1: Create the order on your backend
      const { data: orderData } = await api.post('/payment/create-order');
      
      // Step 2: Define Razorpay options
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderData.amount, // Amount in paise
        currency: 'INR',
        name: 'Vibe Commerce',
        description: 'Test Transaction',
        order_id: orderData.orderId,
        
        // Step 3: Define the payment success handler
        handler: async (response) => {
          try {
            // Step 4: Verify the payment on your backend
            await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // Step 5: Handle success
            alert('Payment Successful! Your order is confirmed.');
            fetchCart(); // Refresh cart (it will be empty)
            navigate('/'); // Send user to homepage
            
          } catch (verifyError) {
            console.error('Payment verification failed:', verifyError);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          email: user.email,
          name: user.display_name,
        },
        theme: {
          color: '#016B61', // Your primary-dark color
        },
      };

      // Step 6: Open the Razorpay modal
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error('Checkout error:', err);
      alert('Failed to create payment order. Please try again.');
    }
  };
  // --- END OF CHECKOUT FUNCTION ---


  if (loading) {
    return <p className={styles.loading}>Loading your cart...</p>;
  }

  return (
    <div className={styles.cartContainer}>
      <h1 className={styles.title}>Your Shopping Cart</h1>
      
      {cart.items.length === 0 ? (
        <div className={styles.emptyCart}>
          <p>Your cart is empty.</p>
          <Link to="/" className={styles.continueShopping}>
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className={styles.cartLayout}>
          <div className={styles.itemsList}>
            {cart.items.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <img src={item.image_url} alt={item.name} className={styles.itemImage} />
                <div className={styles.itemDetails}>
                  <h3 className={styles.itemName}>{item.name}</h3>
                  <p className={styles.itemPrice}>₹{parseFloat(item.price).toFixed(2)}</p>
                  
                  <div className={styles.quantityManager}>
                    <button 
                      className={styles.quantityButton}
                      onClick={() => decreaseQuantity(item.product_id)}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      className={styles.quantityButton}
                      onClick={() => addToCart(item.product_id, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => removeFromCart(item.id)}
                  className={styles.removeButton}
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>

          <div className={styles.orderSummary}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>
            <div className={styles.summaryLine}>
              <span>Subtotal ({cart.items.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
              <span>₹{parseFloat(cart.total).toFixed(2)}</span>
            </div>
            <div className={styles.summaryLine}>
              <span>Shipping</span>
              <span className={styles.freeShipping}>FREE</span>
            </div>
            <hr className={styles.divider} />
            <div className={styles.summaryTotal}>
              <span>Total</span>
              <span>₹{parseFloat(cart.total).toFixed(2)}</span>
            </div>
            <button 
              onClick={handleCheckout}
              className={styles.checkoutButton}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
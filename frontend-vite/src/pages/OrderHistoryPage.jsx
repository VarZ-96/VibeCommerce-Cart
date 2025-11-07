import React, { useState, useEffect } from 'react';
import api from '../api'; // This is 'http://localhost:3001/api'
import { Link } from 'react-router-dom';
import styles from './OrderHistoryPage.module.css';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        setLoading(true);
        // --- THIS IS THE FIX ---
        // Changed from '/api/orders' to just '/orders'
        const { data } = await api.get('/orders'); 
        // --- END OF FIX ---
        
        setOrders(data);
      } catch (err) {
        console.error('Error fetching order history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, []);

  if (loading) {
    return <p className={styles.loading}>Loading your order history...</p>;
  }

  return (
    <div className={styles.historyContainer}>
      <h1 className={styles.title}>My Orders</h1>
      
      {orders.length === 0 ? (
        <div className={styles.noOrders}>
          <p>You haven't placed any orders yet.</p>
          <Link to="/" className={styles.continueShopping}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className={styles.orderList}>
          {orders.map((order) => (
            <div key={order.order_id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div>
                  <h3 className={styles.orderDate}>
                    Order Placed: {new Date(order.order_date).toLocaleDateString()}
                  </h3>
                  <p className={styles.orderId}>
                    Order ID: {order.razorpay_payment_id}
                  </p>
                </div>
                <div className={styles.orderTotal}>
                  <span>Total</span>
                  <strong>₹{parseFloat(order.total_amount).toFixed(2)}</strong>
                </div>
              </div>
              
              <hr className={styles.divider} />

              <div className={styles.itemList}>
                {order.items.map((item) => (
                  <div key={item.id} className={styles.item}>
                    <img src={item.image_url} alt={item.name} className={styles.itemImage} />
                    <div className={styles.itemDetails}>
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.itemQty}>Qty: {item.quantity}</span>
                    </div>
                    <span className={styles.itemPrice}>
                      ₹{parseFloat(item.price_at_purchase).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
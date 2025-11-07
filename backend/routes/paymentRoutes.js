// --- 1. Load environment variables FIRST ---
require('dotenv').config({ path: '../../.env' });

const express = require('express'); // Make sure this is require('express')
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { query } = require('../db/pool');
const authMiddleware = require('../middleware/authMiddleware');

// 2. Import the cache clearing function
const { clearProductCache } = require('./productRoutes');

// 3. Initialize Razorpay Instance (NOW it will work)
let razorpayInstance;
try {
  razorpayInstance = new Razorpay({
    key_id: process.env.VITE_RAZORPAY_KEY_ID,
    key_secret: process.env.VITE_RAZORPAY_KEY_SECRET,
  });
} catch (err) {
  console.error('Failed to initialize Razorpay:', err.message);
  // If this fails, the app can't process payments.
}

// --- POST /api/payment/create-order ---
router.post('/create-order', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const cartSql = `
      SELECT SUM(p.price * c.quantity) as total
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1
    `;
    const cartResult = await query(cartSql, [userId]);
    const totalAmount = cartResult.rows[0]?.total;

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: 'Cart is empty or total is zero' });
    }

    const amountInPaise = Math.round(totalAmount * 100);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_order_${userId}_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      keyId: process.env.VITE_RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Error creating Razorpay order:', err.stack);
    res.status(500).json({ message: 'Error creating payment order' });
  }
});

// --- POST /api/payment/verify ---
router.post('/verify', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ message: 'Missing payment details' });
  }

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.VITE_RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ message: 'Payment verification failed' });
  }

  const client = await query('BEGIN'); 
  
  try {
    const { rows: cartItems } = await query(
      `SELECT c.product_id, c.quantity, p.price 
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = $1`,
      [userId]
    );

    if (cartItems.length === 0) {
      throw new Error('Cart already empty during verification.');
    }

    for (const item of cartItems) {
      await query(
        `UPDATE products 
         SET stock = stock - $1 
         WHERE id = $2 AND stock >= $1`,
        [item.quantity, item.product_id]
      );
    }
    
    const totalAmount = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const orderResult = await query(
      `INSERT INTO orders (user_id, total_amount, razorpay_payment_id)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [userId, totalAmount, razorpay_payment_id]
    );
    const newOrderId = orderResult.rows[0].id;

    for (const item of cartItems) {
      await query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
         VALUES ($1, $2, $3, $4)`,
        [newOrderId, item.product_id, item.quantity, item.price]
      );
    }
    
    await query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
    
    await query('COMMIT');
    
    clearProductCache();
    
    res.status(200).json({ 
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id 
    });

  } catch (err) {
    await query('ROLLBACK');
    console.error('Error during payment verification transaction:', err.stack);
    res.status(500).json({ message: 'Error processing order after payment' });
  }
});

module.exports = router;
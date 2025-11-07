const express = require('express');
const router = express.Router();
const { query } = require('../db/pool');
const authMiddleware = require('../middleware/authMiddleware');

// --- GET /api/orders ---
// Get all past orders for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  // This is an advanced SQL query.
  // - It joins orders, order_items, and products.
  // - 'json_agg' groups all matching items into a single JSON array called 'items'.
  // - 'GROUP BY o.id' ensures we get one row per order.
  const sql = `
    SELECT 
      o.id as order_id,
      o.total_amount,
      o.order_date,
      o.razorpay_payment_id,
      COALESCE(
        json_agg(
          json_build_object(
            'id', oi.id,
            'name', p.name,
            'image_url', p.image_url,
            'quantity', oi.quantity,
            'price_at_purchase', oi.price_at_purchase
          )
        ) FILTER (WHERE oi.id IS NOT NULL), '[]'
      ) as items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.user_id = $1
    GROUP BY o.id
    ORDER BY o.order_date DESC;
  `;

  try {
    const { rows } = await query(sql, [userId]);
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error fetching order history:', err.stack);
    res.status(500).json({ message: 'Error fetching order history' });
  }
});

module.exports = router;
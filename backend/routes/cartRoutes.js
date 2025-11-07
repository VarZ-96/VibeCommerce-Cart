const express = require('express');
const router = express.Router();
const { query } = require('../db/pool');
const authMiddleware = require('../middleware/authMiddleware');

// --- GET /api/cart ---
// Get all items in the logged-in user's cart
router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user.id; 

  const sql = `
    SELECT c.id, p.name, p.price, c.quantity, p.image_url, p.stock, p.id as product_id
    FROM cart_items c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = $1
    ORDER BY c.created_at;
  `;

  try {
    const { rows } = await query(sql, [userId]);
    const total = rows.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    res.status(200).json({ items: rows, total: total.toFixed(2) });
  } catch (err) {
    console.error('Error fetching cart:', err.stack);
    res.status(500).json({ message: 'Error fetching cart' });
  }
});

// --- POST /api/cart ---
// Add an item to the cart (or update quantity)
router.post('/', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity <= 0) {
    return res.status(400).json({ message: 'Invalid product or quantity' });
  }

  try {
    const productResult = await query(
      'SELECT stock FROM products WHERE id = $1',
      [productId]
    );
    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const stock = productResult.rows[0].stock;

    const upsertSql = `
      INSERT INTO cart_items (user_id, product_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET
        quantity = cart_items.quantity + $3
      RETURNING *;
    `;

    const cartQtyResult = await query(
      'SELECT quantity FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );
    const currentCartQty = cartQtyResult.rows[0]?.quantity || 0;

    if (stock < currentCartQty + quantity) {
      return res.status(400).json({ message: 'Not enough stock' });
    }

    const { rows } = await query(upsertSql, [userId, productId, quantity]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error adding to cart:', err.stack);
    res.status(500).json({ message: 'Error adding to cart' });
  }
});

// --- NEW POST /api/cart/decrease ---
// Decrease quantity by 1, or remove if quantity is 1
router.post('/decrease', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body;

  try {
    const cartItem = await query(
      'SELECT quantity, id FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );

    if (cartItem.rows.length === 0) {
      return res.status(404).json({ message: 'Item not in cart' });
    }

    const { quantity, id: cartItemId } = cartItem.rows[0];

    if (quantity === 1) {
      await query('DELETE FROM cart_items WHERE id = $1 AND user_id = $2', [
        cartItemId,
        userId,
      ]);
      res.status(200).json({ message: 'Item removed from cart' });
    } else {
      await query(
        'UPDATE cart_items SET quantity = quantity - 1 WHERE id = $1 AND user_id = $2',
        [cartItemId, userId]
      );
      res.status(200).json({ message: 'Quantity decreased' });
    }
  } catch (err) {
    console.error('Error decreasing quantity:', err.stack);
    res.status(500).json({ message: 'Error decreasing quantity' });
  }
});

// --- DELETE /api/cart/:itemId ---
// Remove an item from the cart (by cart_item ID)
router.delete('/:itemId', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { itemId } = req.params; 

  try {
    const result = await query(
      'DELETE FROM cart_items WHERE id = $1 AND user_id = $2',
      [itemId, userId]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: 'Cart item not found or not owned by user' });
    }

    res.status(200).json({ message: 'Item removed from cart' });
  } catch (err) {
    console.error('Error removing from cart:', err.stack);
    res.status(500).json({ message: 'Error removing from cart' });
  }
});

module.exports = router;
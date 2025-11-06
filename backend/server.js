const express = require('express');
const cors = require('cors');
const { db, setupDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors());        // Allow frontend to connect
app.use(express.json()); // Parse JSON bodies

// --- Database Setup ---
setupDatabase();

// --- API Endpoints ---

// GET /api/products: Get all mock products
app.get('/api/products', (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET /api/cart: Get cart contents + total
app.get('/api/cart', (req, res) => {
  const sql = `
    SELECT c.id, p.name, p.price, c.quantity, p.imageUrl
    FROM cart c
    JOIN products p ON c.productId = p.id
  `;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Calculate total in the backend
    const total = rows.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    res.json({ items: rows, total: total.toFixed(2) });
  });
});

// POST /api/cart: Add {productId, qty}
app.post('/api/cart', (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity <= 0) {
    return res.status(400).json({ error: "Product ID and a valid quantity are required." });
  }

  // Check if item is already in cart
  db.get("SELECT * FROM cart WHERE productId = ?", [productId], (err, row) => {
    if (row) {
      // Update quantity
      const newQuantity = row.quantity + quantity;
      db.run("UPDATE cart SET quantity = ? WHERE productId = ?", [newQuantity, productId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ id: this.lastID, message: "Cart updated" });
      });
    } else {
      // Insert new item
      db.run("INSERT INTO cart (productId, quantity) VALUES (?, ?)", [productId, quantity], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, message: "Item added to cart" });
      });
    }
  });
});

// DELETE /api/cart/:id: Remove item by cart ID
app.delete('/api/cart/:id', (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM cart WHERE id = ?", id, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Item not found in cart" });
    }
    res.status(200).json({ message: "Item removed from cart" });
  });
});

// POST /api/checkout: Mock checkout
app.post('/api/checkout', (req, res) => {
  // In a real app, you'd process payment here
  // For this mock, we just clear the cart
  db.run("DELETE FROM cart", [], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Send back a mock receipt
    res.status(200).json({
      success: true,
      message: "Checkout successful!",
      receipt: {
        total: req.body.total || 0, // Get total from the request body
        timestamp: new Date().toISOString(),
        orderId: `VIBE-${Math.floor(Math.random() * 100000)}`
      }
    });
  });
});


// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
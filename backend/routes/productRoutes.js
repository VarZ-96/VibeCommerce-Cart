const express = require('express');
const router = express.Router();
const { query } = require('../db/pool');

// The cache is still here
let productCache = {
  data: null,
  timestamp: 0,
};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

router.get('/', async (req, res) => {
  try {
    const now = Date.now();
    if (productCache.data && now - productCache.timestamp < CACHE_DURATION) {
      console.log('Serving products from cache');
      return res.status(200).json(productCache.data);
    }

    console.log('Serving products from DB');
    const { rows } = await query('SELECT * FROM products WHERE stock > 0');

    productCache = {
      data: rows,
      timestamp: now,
    };

    res.status(200).json(rows);
  } catch (err) {
    console.error('Error fetching products:', err.stack);
    res.status(500).json({ message: 'Error fetching products' });
  }
});


// This function clears the cache
const clearProductCache = () => {
  productCache.data = null;
  productCache.timestamp = 0;
  console.log('Product cache cleared due to sale!');
};


// We now export an object containing the router AND the function
module.exports = {
  router,
  clearProductCache,
};
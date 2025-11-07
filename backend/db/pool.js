const { Pool } = require('pg');
// Path from /backend/db -> /backend -> /VibeCommerce-Cart (root)
require('dotenv').config({ path: '../../.env' }); 

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log('🔗 Database connected successfully!');
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
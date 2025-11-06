const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' }); // Adjust path if .env is in root

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log('🔗 Database connected successfully!');
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
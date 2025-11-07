// Add this line at the very top
require('dotenv').config({ path: '../../.env' }); 

const { query } = require('./pool'); // Import our centralized query function

const createTables = async () => {
  const usersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      google_id VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      display_name VARCHAR(255),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  const productsTable = `
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      price NUMERIC(10, 2) NOT NULL,
      image_url TEXT,
      stock INTEGER NOT NULL DEFAULT 0
    );
  `;

  const cartItemsTable = `
    CREATE TABLE IF NOT EXISTS cart_items (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, product_id)
    );
  `;

  const seedProducts = `
    INSERT INTO products (name, price, image_url, stock) VALUES
    ('Minimalist Tee', 25.00, 'https://example.com/image1.jpg', 25),
    ('Stylish Hoodie', 60.00, 'https://example.com/image2.jpg', 25),
    ('Classic Jeans', 75.00, 'https://example.com/image3.jpg', 25),
    ('Canvas Sneakers', 45.00, 'https://example.com/image4.jpg', 25),
    ('Leather Wallet', 30.00, 'https://example.com/image5.jpg', 25)
    ON CONFLICT (name) DO NOTHING;
  `;

  try {
    console.log('Creating tables...');
    await query(usersTable);
    await query(productsTable);
    await query(cartItemsTable);
    console.log('Tables created successfully!');

    console.log('Seeding products...');
    await query(seedProducts);
    console.log('Products seeded successfully!');
  } catch (err) {
    console.error('Error initializing database:', err); // Log the full error
  }
};

createTables();
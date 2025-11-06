const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./store.db');

const setupDatabase = () => {
  db.serialize(() => {
    console.log("Setting up database...");
    
    // Create Products table
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      imageUrl TEXT
    )`);

    // Create Cart table (for a single mock user)
    db.run(`CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      productId INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      FOREIGN KEY (productId) REFERENCES products(id)
    )`);

    // Seed mock products (Only if table is empty)
    const stmt = db.prepare("INSERT INTO products (id, name, price, imageUrl) VALUES (?, ?, ?, ?)");
    const products = [
      [1, "Minimalist Tee", 25.00, "https://example.com/image1.jpg"],
      [2, "Stylish Hoodie", 60.00, "https://example.com/image2.jpg"],
      [3, "Classic Jeans", 75.00, "https://example.com/image3.jpg"],
      [4, "Canvas Sneakers", 45.00, "https://example.com/image4.jpg"],
      [5, "Leather Wallet", 30.00, "https://example.com/image5.jpg"]
    ];
    
    // Check if products exist before inserting
    db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
      if (row.count === 0) {
        products.forEach(product => stmt.run(product));
        console.log("Mock products seeded.");
      }
    });
    stmt.finalize();
  });
};

module.exports = { db, setupDatabase };
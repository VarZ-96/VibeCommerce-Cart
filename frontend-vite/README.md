Vibe Commerce - Full-Stack E-Commerce Cart

A robust, full-stack shopping cart application designed to demonstrate scalable, real-world e-commerce architecture. This project implements advanced security, transactional integrity, and optimized performance using modern technologies.

Project Status: Feature Complete (MVP)

🏛️ Architecture & Low-Level Design (LLD)

This application was developed using a microservice-inspired monorepo structure, separating the presentation layer from the business logic and leveraging key architectural patterns for scalability:

Layer

Technology

Key LLD Concepts Implemented

Frontend

React (Vite)

Context API for global state, CSS Modules for scoped styling, Glassmorphism UI, framer-motion for scroll animations.

Authentication

Node.js (Passport.js)

OAuth 2.0 (Sign in with Google) for identity, JWT (JSON Web Tokens) for stateless session management.

Backend

Node.js (Express)

RESTful API design, Middleware for protection.

Database

PostgreSQL (NeonDB)

Connection Pooling for high concurrency, Transactional Integrity (BEGIN/COMMIT/ROLLBACK) for stock safety.

Payments

Razorpay

Server-to-Server Signature Verification for fraud prevention, Stock Reduction upon Payment.

Optimization

In-Memory Caching

Cache invalidation strategy (clearProductCache function) used on successful payment to ensure immediate stock updates without unnecessary DB reads.

📦 Project Structure

/VibeCommerce-Cart/
├── /backend/
│   ├── config/             # Passport.js setup
│   ├── db/                 # PostgreSQL Pool connection
│   ├── middleware/         # JWT Auth middleware
│   ├── routes/             # API Endpoints (cart, products, payment)
│   └── server.js           # Express main file
├── /frontend-vite/         # (Frontend code)
│   ├── src/
│   │   ├── api.js          # Centralized Axios with JWT interceptor
│   │   ├── components/     # UI components (Navbar, ProductCard)
│   │   ├── context/        # Auth & Cart state management
│   │   └── pages/          # Page components (Home, Cart, Orders)
│   └── index.html          # Entry point with Razorpay script
└── README.md


⚙️ Setup and Installation

Prerequisites

Node.js (LTS recommended) & npm.

A PostgreSQL database (e.g., NeonDB).

A Google OAuth 2.0 Client ID and Secret.

Razorpay Key ID and Secret (Test Mode).

Step 1: Database Initialization

Create your database (e.g., vibe_commerce) on NeonDB.

Run the schema script manually in your NeonDB SQL Editor to create the tables (users, products, cart_items, orders, order_items) and seed initial products. (This bypasses local Node.js pathing issues for initial setup).

Step

2: Configure Environment Variables

Create a single file named .env in the root directory (/VibeCommerce-Cart/) with the following variables:

# --- DATABASE ---
DATABASE_URL="postgresql://YOUR_NEONDB_CONNECTION_STRING_HERE"

# --- BACKEND KEYS (Server-Side) ---
JWT_SECRET="a_very_strong_and_long_random_secret_key" 

# Razorpay Secret Key is used for Signature Verification (Server-Side Security)
RAZORPAY_KEY_ID="rzp_test_XXXXXXXXXXXXXX"
RAZORPAY_KEY_SECRET="XXXXXXXXXXXXXXXXXXXXXXXXXXXX"

# --- GOOGLE OAUTH ---
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
CALLBACK_URL="http://localhost:3001/api/auth/google/callback"

# --- CLIENT (Frontend) ---
CLIENT_URL="http://localhost:5173" # Must match your Vite port (e.g., 5173)

# Razorpay Public Key is used to launch the modal (Client-Side)
VITE_RAZORPAY_KEY_ID="rzp_test_YOUR_PUBLIC_KEY_ID"


Step 3: Run the Application

Terminal

Path

Command

Description

Terminal 1 (Backend)

cd backend

npm install then npm run dev

Starts the Express API server (Port 3001).

Terminal 2 (Frontend)

cd frontend-vite

npm install then npm run dev

Starts the React app (Port 5173, opens in browser).

📸 Key Features & Screenshots

(NOTE: Replace these image placeholders with actual screenshots of your running application)

1. Product Listing & Real-time Stock

View: Products displayed with minimalist design (Vibe Commerce color palette).

LLD Detail: The system dynamically shows a "Only X left!" warning when product stock falls below 10, demonstrating integrated inventory management.

2. Scalable Cart Management & Quantity Control

View: The cart page features clear quantity controls.

LLD Detail: The POST /api/cart endpoint handles both adding new items and increasing quantity. The new POST /api/cart/decrease endpoint allows for single-unit removal, only deleting the item row when quantity reaches zero, ensuring data integrity.

3. Secure Checkout and Order History

View: The application features a persistent "My Orders" page.

LLD Detail: This feature relies on PostgreSQL Transactions. Upon payment verification, the system executes an atomic operation:

Records the permanent order in the orders table.

Records the product "transcript" (price at time of purchase) in order_items.

Decrements products.stock.

Clears the In-Memory Cache for products, forcing the homepage to display the correct, up-to-date stock immediately.

🔑 Authentication Flow Explained

The application utilizes a secure, hybrid authentication model:

Delegated Identity (OAuth 2.0): The user clicks "Sign in with Google," delegating the identity verification to Google's highly secure infrastructure (Passport.js handles this on the backend).

Stateless Session (JWT): After verification, the backend generates a signed JSON Web Token (JWT) containing the user's ID. This token is sent to the frontend and stored.

Protected Access: For every subsequent request (e.g., adding to cart, viewing orders), the frontend sends the JWT in the Authorization header. The custom authMiddleware verifies the token's signature, confirming the user's identity without requiring any server-side session lookup, which ensures high API scalability.

const express = require('express');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const jwt = require('jsonwebtoken');

require('dotenv').config({ path: '../.env' }); 
require('./config/passport');
const authMiddleware = require('./middleware/authMiddleware');


const { router: productRoutes } = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(
  session({
    secret: 'a_different_session_secret_key',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// --- Authentication Routes ---
app.get(
  '/api/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
app.get(
  '/api/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/login-failed`,
    session: false,
  }),
  (req, res) => {
    const payload = { id: req.user.id, email: req.user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    res.redirect(`${process.env.CLIENT_URL}/auth-callback?token=${token}`);
  }
);

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.status(200).json(req.user);
});

// --- 3. Use ALL Application Routes ---
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/orders', orderRoutes);

// --- Server Startup ---
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
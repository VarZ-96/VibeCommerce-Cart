import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';

const GOOGLE_LOGIN_URL = 'http://localhost:3001/api/auth/google';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useCart();

  const totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        
        <Link to="/" className={styles.logo}>
          Vibe Commerce
        </Link>

        <div className={styles.navLinks}>
          {isAuthenticated ? (
            <>
              {/* === NEW LINK === */}
              <Link to="/orders" className={styles.navLink}>
                My Orders
              </Link>
              {/* === END NEW LINK === */}

              <Link to="/cart" className={styles.cartLink}>
                <svg className={styles.cartIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {totalItems > 0 && (
                  <span className={styles.cartCount}>{totalItems}</span>
                )}
              </Link>
              
              <button 
                onClick={logout}
                className={styles.button}
              >
                Logout
              </button>
            </>
          ) : (
            <a 
              href={GOOGLE_LOGIN_URL}
              className={styles.button}
            >
              Sign in with Google
            </a>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
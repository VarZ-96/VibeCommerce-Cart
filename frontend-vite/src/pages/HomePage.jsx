import React from 'react';
import { useAuth } from '../context/AuthContext';
import ProductList from '../components/ProductList'; // <-- 1. Import

const HomePage = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div style={{ padding: '1rem', maxWidth: '1280px', margin: '0 auto' }}> 
      {isAuthenticated ? (
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
            Welcome, {user?.display_name || user?.email}!
          </h1>
          <ProductList /> {/* <-- 2. Add the component here */}
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '5rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>
            Welcome to Vibe Commerce
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#555' }}>
            Please sign in to start shopping.
          </p>
        </div>
      )}
      
      {/* You can remove the temporary 2000px div now if you want */}
      <div style={{ height: '1000px' }}></div>
    </div>
  );
};

export default HomePage;
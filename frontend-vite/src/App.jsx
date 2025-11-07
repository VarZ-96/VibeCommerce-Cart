import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AuthCallback from './pages/AuthCallback';
import CartPage from './pages/CartPage';
import OrderHistoryPage from './pages/OrderHistoryPage'; // Make sure this is imported
import './index.css';

function App() {
  return (
    <div className="App"> 
      <Navbar /> 
      
      <main className="main-content"> 
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth-callback" element={<AuthCallback />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrderHistoryPage />} /> {/* This is the important line */}
        </Routes>
      </main>
    </div>
  );
}
export default App;
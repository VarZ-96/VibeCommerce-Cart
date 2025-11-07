import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api'; // Our new API service

// 1. Create the context
const AuthContext = createContext(null);

// 2. Create the provider component
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // For initial app load

  useEffect(() => {
    // This effect runs once when the app loads
    // to check if we have a valid token from a previous session
    const validateToken = async () => {
      if (token) {
        try {
          // The token is automatically sent by our api service
          const { data } = await api.get('/auth/me');
          setUser(data); // We are logged in!
        } catch (error) {
          // Token is invalid or expired
          console.error('Invalid token, logging out');
          logout();
        }
      }
      setLoading(false);
    };

    validateToken();
  }, [token]); // Re-run if token changes

  // 3. Login function
  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    // The useEffect will automatically run and fetch the user
  };

  // 4. Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // 5. Value to be passed to all children
  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token, // True if token is not null
  };

  // Show nothing until the token has been validated
  return (
    <AuthContext.Provider value={value}>
      {!loading && children} 
    </AuthContext.Provider>
  );
};

// 3. Create a custom hook for easy access
export const useAuth = () => {
  return useContext(AuthContext);
};
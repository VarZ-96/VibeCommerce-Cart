import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth(); // Get the login function from our context

  useEffect(() => {
    // 1. Get the token from the URL query string
    const token = searchParams.get('token');

    if (token) {
      // 2. If token exists, call our global login function
      login(token);
      
      // 3. Redirect the user to the homepage
      navigate('/');
    } else {
      // Handle error (e.g., redirect to a login-failed page)
      console.error('No token found after auth callback');
      navigate('/'); // Go home anyway
    }
  }, [searchParams, login, navigate]);

  // This page doesn't need to show anything
  // A simple "loading" message is fine
  return (
    <div>
      <p>Loading, please wait...</p>
    </div>
  );
};

export default AuthCallback;
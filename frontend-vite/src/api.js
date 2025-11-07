import axios from 'axios';

// 1. Create a central Axios instance
const api = axios.create({
  baseURL: 'http://localhost:3001/api', // Your backend's URL
});

// 2. Add a Request Interceptor (The "Gatekeeper")
// This function runs BEFORE every API request is sent.
api.interceptors.request.use(
  (config) => {
    // 3. Get the token from local storage
    const token = localStorage.getItem('token');

    // 4. If the token exists, add it to the 'Authorization' header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config; // Continue with the request
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

export default api;
import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

// Create a single instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically attaches the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Handling
api.interceptors.response.use(
  (response) => response, // Return successful responses directly
  (error) => {
    // Global 401 (Unauthorized) handler
    if (error.response && error.response.status === 401) {
      // Token expired or invalid - force logout
      // Avoid redirecting if we are already on login page to prevent loops
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('isLoggedIn');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

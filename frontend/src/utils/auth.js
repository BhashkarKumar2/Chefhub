// JWT utility functions for frontend authentication
import api from './api';

// Check if token exists in localStorage
export const getToken = () => {
  return localStorage.getItem('token');
};

// Set token in localStorage
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Remove token from localStorage
export const removeToken = () => {
  localStorage.removeItem('token');
};

// Check if token is expired (client-side check)
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // Parse JWT payload (base64 decode)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired
    return payload.exp < currentTime;
  } catch (error) {
    // console.error('Error parsing token:', error);
    return true;
  }
};

// Validate token with backend
export const validateToken = async () => {
  const token = getToken();
  
  // console.log('🔍 Validating token:', token ? 'Token exists' : 'No token found');
  
  if (!token) {
    // console.log('❌ No token found');
    return { valid: false, error: 'No token found' };
  }

  // Check if token is expired client-side first
  if (isTokenExpired(token)) {
    // console.log('❌ Token expired (client-side check)');
    removeToken();
    return { valid: false, error: 'Token expired' };
  }

  try {
    // console.log('🔄 Sending validation request to backend...');
    const response = await api.post('/auth/validate-token');

    const data = response.data;
    // console.log('📡 Backend validation response:', { status: response.status, data });

    // console.log('✅ Token validation successful:', data.user);
    return { valid: true, user: data.user };
  } catch (error) {
    // console.error('❌ Token validation error:', error);
    removeToken();
    const errorMessage = error.response?.data?.message || 'Network error';
    return { valid: false, error: errorMessage };
  }
};

// Get current user data (if token is valid)
export const getCurrentUser = async () => {
  const token = getToken();
  
  if (!token || isTokenExpired(token)) {
    return null;
  }

  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    // console.error('Error fetching current user:', error);
    removeToken();
    return null;
  }
};

// Auto logout when token expires
export const setupTokenExpirationCheck = (onExpired) => {
  const checkTokenExpiration = () => {
    const token = getToken();
    
    if (token && isTokenExpired(token)) {
      removeToken();
      if (onExpired) onExpired();
    }
  };

  // Check immediately
  checkTokenExpiration();

  // Check every minute
  const interval = setInterval(checkTokenExpiration, 60000);

  // Return cleanup function
  return () => clearInterval(interval);
};

// Make authenticated API request
// Deprecated: Use api.js instead
// export const authenticatedFetch = async (url, options = {}) => { ... }

// Mobile OTP API functions
export const authAPI = {
  // Verify Firebase OTP token
  verifyFirebaseOTP: async (idToken, name = '') => {
    try {
      const response = await api.post('/auth/verify-firebase-otp', { idToken, name });
      return response.data;
    } catch (error) {
      throw { response: { data: error.response?.data } };
    }
  },

  // Regular email login
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw { response: { data: error.response?.data } };
    }
  },

  // Register
  register: async (email, password) => {
    try {
      const response = await api.post('/auth/register', { email, password });
      return response.data;
    } catch (error) {
      throw { response: { data: error.response?.data } };
    }
  }
};

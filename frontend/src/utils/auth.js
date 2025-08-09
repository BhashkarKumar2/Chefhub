// JWT utility functions for frontend authentication

const API_BASE_URL = 'http://localhost:5000/api';

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
    console.error('Error parsing token:', error);
    return true;
  }
};

// Validate token with backend
export const validateToken = async () => {
  const token = getToken();
  
  console.log('🔍 Validating token:', token ? 'Token exists' : 'No token found');
  
  if (!token) {
    console.log('❌ No token found');
    return { valid: false, error: 'No token found' };
  }

  // Check if token is expired client-side first
  if (isTokenExpired(token)) {
    console.log('❌ Token expired (client-side check)');
    removeToken();
    return { valid: false, error: 'Token expired' };
  }

  try {
    console.log('🔄 Sending validation request to backend...');
    const response = await fetch(`${API_BASE_URL}/auth/validate-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('📡 Backend validation response:', { status: response.status, data });

    if (!response.ok) {
      // Token is invalid, remove it
      console.log('❌ Token validation failed:', data.message);
      removeToken();
      return { valid: false, error: data.message };
    }

    console.log('✅ Token validation successful:', data.user);
    return { valid: true, user: data.user };
  } catch (error) {
    console.error('❌ Token validation error:', error);
    removeToken();
    return { valid: false, error: 'Network error' };
  }
};

// Get current user data (if token is valid)
export const getCurrentUser = async () => {
  const token = getToken();
  
  if (!token || isTokenExpired(token)) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      removeToken();
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching current user:', error);
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
export const authenticatedFetch = async (url, options = {}) => {
  const token = getToken();
  
  if (!token || isTokenExpired(token)) {
    throw new Error('No valid token available');
  }

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

// Mobile OTP API functions
export const authAPI = {
  // Verify Firebase OTP token
  verifyFirebaseOTP: async (idToken, name = '') => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-firebase-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ idToken, name })
    });

    const data = await response.json();

    if (!response.ok) {
      throw { response: { data } };
    }

    return data;
  },

  // Regular email login
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw { response: { data } };
    }

    return data;
  },

  // Register
  register: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw { response: { data } };
    }

    return data;
  }
};

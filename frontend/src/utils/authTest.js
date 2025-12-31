// Test authentication state
import { validateToken, getToken } from './auth.js';

export const testAuthState = async () => {
  
  // Check all localStorage keys
  
  // Check localStorage
  const token = getToken();
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  
  // {
  //   hasToken: !!token,
  //   tokenLength: token?.length,
  //   tokenPreview: token ? token.substring(0, 20) + '...' : 'None',
  //   isLoggedIn
  // });
  
  if (token) {
  }
  
  // Test token validation
  const validation = await validateToken();
  
  return validation;
};

// Clear all auth data
export const clearAllAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
  localStorage.removeItem('isLoggedIn');
  
  // Also clear any session cookies that might exist from Google OAuth
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
  });
  
};

// Test authentication state
import { validateToken, getToken } from './auth.js';

export const testAuthState = async () => {
  console.log('🧪 Testing authentication state...');
  
  // Check all localStorage keys
  console.log('🔍 All localStorage keys:', Object.keys(localStorage));
  
  // Check localStorage
  const token = getToken();
  const userEmail = localStorage.getItem('userEmail');
  const userName = localStorage.getItem('userName');
  const userId = localStorage.getItem('userId');
  
  console.log('📦 LocalStorage state:', {
    hasToken: !!token,
    tokenLength: token?.length,
    tokenPreview: token ? token.substring(0, 20) + '...' : 'None',
    userEmail,
    userName,
    userId
  });
  
  if (token) {
    console.log('🔍 Full token:', token);
  }
  
  // Test token validation
  const validation = await validateToken();
  console.log('✅ Validation result:', validation);
  
  return validation;
};

// Clear all auth data
export const clearAllAuthData = () => {
  console.log('🧹 Clearing all authentication data...');
  localStorage.removeItem('token');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
  localStorage.removeItem('userId');
  localStorage.removeItem('isLoggedIn');
  
  // Also clear any session cookies that might exist from Google OAuth
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
  });
  
  console.log('✅ All auth data and cookies cleared');
};

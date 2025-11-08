import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken, validateToken, removeToken } from '../utils/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      
      if (!token) {
        // console.log('ðŸ” No token found, user not authenticated');
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      // console.log('ðŸ” Token found, validating with backend...');

      // Validate token with backend
      const validation = await validateToken();
      
      if (validation.valid) {
        // console.log('âœ… Token validation successful:', validation.user);
        setIsAuthenticated(true);
        
        // Use validated user data from backend first, then fallback to localStorage
        if (validation.user) {
          // console.log('âœ… Using validated user data from backend:', validation.user);
          setUser(validation.user);
        } else {
          // Fallback to localStorage data, but validate it first
          const userId = localStorage.getItem('userId');
          const userEmail = localStorage.getItem('userEmail');
          const userName = localStorage.getItem('userName');
          
          // Check for invalid stored values
          if (userId && userId !== 'undefined' && userId !== 'null' && 
              userEmail && userEmail !== 'undefined' && userEmail !== 'null') {
            const userData = {
              id: userId,
              email: userEmail,
              name: userName && userName !== 'undefined' && userName !== 'null' ? userName : userEmail
            };
            // console.log('âœ… Using validated localStorage data:', userData);
            setUser(userData);
          } else {
            // console.log('âŒ Invalid user data in localStorage, logging out');
            logout();
            return;
          }
        }
      } else {
        // console.log('âŒ Token validation failed:', validation.error);
        // Token is invalid, clear everything
        logout();
      }
    } catch (error) {
      // console.error('âŒ Auth check failed:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = (token, userData) => {
    // console.log('ðŸ”‘ AuthContext login called with:', { token: !!token, userData });
    
    // Validate input data
    if (!token || !userData || !userData.id || !userData.email) {
      // console.error('âŒ Invalid login data provided:', { token: !!token, userData });
      return;
    }
    
    // Ensure all values are valid (not undefined, null, or string 'undefined')
    const cleanUserData = {
      id: userData.id?.toString(),
      email: userData.email,
      name: userData.name || userData.email
    };
    
    // Double-check that we don't have invalid values
    if (cleanUserData.id === 'undefined' || cleanUserData.id === 'null' || !cleanUserData.id) {
      // console.error('âŒ Invalid user ID detected:', cleanUserData.id);
      return;
    }
    
    // console.log('âœ… Storing clean user data:', cleanUserData);
    
    // Store token and user data
    localStorage.setItem('token', token);
    localStorage.setItem('userId', cleanUserData.id);
    localStorage.setItem('userEmail', cleanUserData.email);
    localStorage.setItem('userName', cleanUserData.name);
    localStorage.setItem('isLoggedIn', 'true');
    
    setIsAuthenticated(true);
    setUser(cleanUserData);
    
    // console.log('âœ… Login successful, user authenticated');
  };

  const logout = () => {
    // Clear all auth data
    removeToken();
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('isLoggedIn');
    
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    loading: isLoading, // Alias for compatibility
    isLoading,
    user,
    token: getToken(), // Expose token
    login,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { validateToken, setupTokenExpirationCheck, removeToken } from '../utils/auth.js';

const Sidebar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true); // Add loading state
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if mobile screen
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Close mobile menu on route change
    setIsMobileOpen(false);
  }, [location]);

  useEffect(() => {
    // Check login status and validate token
    const checkAuthentication = async () => {
      setAuthLoading(true);
      try {
        // Add a small delay if we're on dashboard or after OAuth redirect to allow token storage to complete
        if (location.pathname === '/dashboard' || location.search.includes('token=')) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        // Validate authentication state
        const result = await validateToken();
        
        if (result.valid && result.user) {
          setIsLoggedIn(true);
          setUserData(result.user);
          console.log('✅ User authenticated:', result.user.email);
        } else {
          setIsLoggedIn(false);
          setUserData(null);
          // Clear any remaining localStorage data
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userName');
          localStorage.removeItem('userId');
          localStorage.removeItem('isLoggedIn');
          if (result.error !== 'No token found') {
            console.log('❌ User not authenticated:', result.error);
          }
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsLoggedIn(false);
        setUserData(null);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuthentication();

    // Setup automatic token expiration check
    const cleanup = setupTokenExpirationCheck(() => {
      setIsLoggedIn(false);
      setUserData(null);
      setAuthLoading(false);
      navigate('/');
    });

    return cleanup;
  }, [location, navigate]);

  // Remove the old loadUserData function since we're getting user data from validateToken

  const handleLogout = () => {
    // Remove token and all user data
    removeToken();
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    setUserData(null);
    navigate('/');
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const navigation = [
    {
      name: 'Home',
      href: '/',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      public: true
    },
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      requiresAuth: true
    },
    {
      name: 'Book Chef',
      href: '/book-chef',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      requiresAuth: true
    },
    {
      name: '🤖 AI Book Chef',
      href: '/book-chef-ai',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      requiresAuth: true
    },
    {
      name: '✨ AI Features',
      href: '/ai-features',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      requiresAuth: true
    },
    {
      name: 'Advanced Search',
      href: '/search',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      public: true
    },
    {
      name: 'My Bookings',
      href: '/bookings',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      requiresAuth: true
    },
    {
      name: 'Favorites',
      href: '/favorites',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      requiresAuth: true
    },
    {
      name: 'Chef Onboarding',
      href: '/chef-onboarding',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
      public: true
    },
    {
      name: 'About',
      href: '/about',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      public: true
    },
    {
      name: 'Services',
      href: '/services',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      public: true
    },
    {
      name: 'Contact',
      href: '/contact',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      public: true
    }
  ];

  const filteredNavigation = navigation.filter(item => {
    if (item.public) return true;
    if (item.requiresAuth) return isLoggedIn;
    return false;
  });

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gradient-to-br from-blue-700 to-blue-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all backdrop-blur-md"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-gradient-to-br from-black/90 via-blue-900/90 to-blue-950/90 backdrop-blur-xl shadow-2xl transition-all duration-300 z-40 border-r border-white/10 ${
        isCollapsed ? 'w-20' : 'w-64'
      } ${
        isMobileOpen ? 'translate-x-0' : 'lg:translate-x-0 -translate-x-full'
      }`}>
      <div className="flex flex-col h-full">
        {/* Brand */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <Link 
            to="/" 
            className={`flex items-center gap-2 font-bold text-2xl text-blue-400 hover:text-blue-200 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <span className="text-3xl">🍳</span>
            {!isCollapsed && <span>ChefHub</span>}
          </Link>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:block p-1 rounded-md hover:bg-blue-900/40 transition-colors"
          >
            <svg className={`w-5 h-5 text-blue-400 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {filteredNavigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 font-medium ${
                isActivePath(item.href)
                  ? 'bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-lg border-l-4 border-blue-400'
                  : 'text-white/80 hover:bg-blue-900/60 hover:text-white'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? item.name : ''}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* User Profile Section */}
        {isLoggedIn && userData && (
          <div className="border-t border-white/10 p-4 bg-black/30 backdrop-blur-md">
            <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
              <Link to="/profile" className="flex-shrink-0">
                <img
                  src={userData.profileImage || 'https://i.pravatar.cc/150?img=3'}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-400 hover:border-blue-600 transition-colors shadow"
                />
              </Link>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <Link 
                    to="/profile"
                    className="block text-sm font-semibold text-blue-200 hover:text-blue-100 transition-colors truncate"
                  >
                    {userData.name || 'User'}
                  </Link>
                  <p className="text-xs text-blue-100 truncate">{userData.email}</p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <div className="mt-3 flex gap-2">
                <Link
                  to="/profile"
                  className="flex-1 px-3 py-1 text-xs bg-gradient-to-r from-blue-700 to-blue-400 text-white rounded-md hover:from-blue-400 hover:to-blue-700 transition-colors text-center"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-3 py-1 text-xs bg-gradient-to-r from-blue-900 to-blue-600 text-white rounded-md hover:from-blue-600 hover:to-blue-900 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
            {isCollapsed && (
              <div className="mt-2 flex justify-center">
                <button
                  onClick={handleLogout}
                  className="p-1 text-blue-300 hover:bg-blue-900/30 rounded-md transition-colors"
                  title="Logout"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Login Section for non-authenticated users */}
        {!authLoading && !isLoggedIn && (
          <div className="border-t border-white/10 p-4 bg-black/30 backdrop-blur-md">
            {!isCollapsed ? (
              <div className="space-y-2">
                <Link
                  to="/login"
                  className="block w-full px-4 py-2 text-center bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-lg hover:from-blue-500 hover:to-blue-700 transition-colors font-semibold shadow"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block w-full px-4 py-2 text-center border border-blue-400 text-blue-400 rounded-lg hover:bg-blue-900/30 hover:text-white transition-colors font-semibold"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2 items-center">
                <Link
                  to="/login"
                  className="p-2 bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-lg hover:from-blue-500 hover:to-blue-700 transition-colors shadow"
                  title="Login"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </Link>
                <Link
                  to="/signup"
                  className="p-2 border border-blue-400 text-blue-400 rounded-lg hover:bg-blue-900/30 hover:text-white transition-colors"
                  title="Sign Up"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Loading indicator while checking authentication */}
        {authLoading && (
          <div className="border-t border-white/10 p-4 bg-black/30 backdrop-blur-md">
            <div className={`flex items-center justify-center ${isCollapsed ? 'p-2' : 'p-4'}`}>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
              {!isCollapsed && <span className="ml-2 text-sm text-blue-200">Loading...</span>}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default Sidebar;

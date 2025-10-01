import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  // Use global theme context
  const { theme, setTheme } = useTheme();
  // Collapse sidebar by default on mobile screens
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 1024);
  // Collapse sidebar automatically on mobile resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated: isLoggedIn, user: userData, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  // Navigation items with icons and tooltips
  const navigation = [
    {
      name: 'Home',
      href: '/',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      public: true
    },
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      requiresAuth: true
    },
    {
      name: 'Book Chef',
      href: '/book-chef',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      requiresAuth: true
    },
    {
      name: 'AI Features',
      href: '/ai-features',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      requiresAuth: true
    },
    {
      name: 'My Bookings',
      href: '/bookings',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2" />
        </svg>
      ),
      requiresAuth: true
    },
    {
      name: 'Favorites',
      href: '/favorites',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      requiresAuth: true
    },
    {
      name: 'Chef Onboarding',
      href: '/chef-onboarding',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      requiresAuth: true
    },
    {
      name: 'About',
      href: '/about',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      public: true
    },
    {
      name: 'Services',
      href: '/services',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
        </svg>
      ),
      public: true
    },
    {
      name: 'Contact',
      href: '/contact',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      public: true
    }
  ];

  // Filter navigation based on authentication
  const filteredNavigation = navigation.filter(item => {
    if (item.public) return true;
    if (item.requiresAuth) return isLoggedIn;
    return false;
  });

  // Helper to compute link classes based on theme and active state
  const linkBase = `relative flex items-center transition-all duration-300 w-full px-4 py-3 rounded-2xl ${isCollapsed ? 'justify-center' : ''}`;
  const activeClass = theme === 'dark'
    ? 'bg-gradient-to-r from-orange-700 to-amber-700 text-white shadow-lg'
    : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg';
  const inactiveClass = theme === 'dark'
    ? 'text-gray-200 hover:bg-gray-800/40 hover:text-white'
    : 'text-orange-700 hover:bg-orange-200/40 hover:text-orange-800 hover:scale-105';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
    setIsMobileOpen(false);
  };

  const handleProfileClick = () => {
    if (isLoggedIn && userData) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
    setIsMobileOpen(false);
  };

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-gradient-to-r from-orange-500 to-amber-500 text-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <svg className="w-7 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile overlay */}
      {/* Remove orange overlay for mobile sidebar, just close sidebar on outside click */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-opacity-30 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Dynamic width with collapse toggle */}
      <div className={`
        fixed h-full z-50 
        ${theme === 'dark' ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-gray-700 shadow-black' : 'bg-gradient-to-b from-orange-50/95 via-amber-50/95 to-orange-100/95 border-orange-200/30 shadow-2xl'}
        backdrop-blur-xl border-r 
        transition-all duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'w-32 pt-16 ' : 'w-64'}
        
        overflow-y-auto
        scrollbar-thin ${theme === 'dark' ? 'scrollbar-thumb-gray-700 scrollbar-track-gray-900' : 'scrollbar-thumb-orange-300 scrollbar-track-orange-100'}
      `}>
        {/* Collapse/Expand Toggle Button */}
        <button
          className="fixed top-4 right-4 z-50 bg-orange-200 hover:bg-orange-300 text-orange-800 rounded-full p-2 shadow-md transition-all duration-300"
          onClick={() => setIsCollapsed((prev) => !prev)}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <svg className="w-8 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16m-7-7l7 7-7 7" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4m7-7l-7 7 7 7" />
            </svg>
          )}
        </button>
        
        {/* Logo Section */}
        {/* Logo Section - hidden when collapsed */}
        {!isCollapsed && (
          <div className="p-4 border-b border-orange-200/30">
            <Link 
              to="/" 
              className="flex items-center space-x-3"
              onClick={() => setIsMobileOpen(false)}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex-shrink-0">
                🍳
              </div>
              <span className="text-xl font-bold text-orange-800 whitespace-nowrap">
                ChefHub
              </span>
            </Link>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {filteredNavigation.map((item, index) => {
            const isActive = location.pathname === item.href;
            const itemKey = `nav-${index}`;
            return (
              <div key={item.name} className="relative" onMouseEnter={() => setHoveredItem(itemKey)} onMouseLeave={() => setHoveredItem(null)}>
                <Link
                  to={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`${linkBase} ${isActive ? activeClass : inactiveClass}`}
                >
                  <span className="flex-shrink-0 text-current">
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="ml-3 font-medium whitespace-nowrap">
                      {item.name}
                    </span>
                  )}
                </Link>
              </div>
            );
          })}
          {/* Dark mode toggle placed as a nav item below navigation (aligned with others) */}
        </nav>

        {/* User Section */}
        <div className="border-t border-orange-200/30 p-3 space-y-1">
          {isLoggedIn ? (
            <>
              {/* Profile */}
              <div 
                className="relative"
                onMouseEnter={() => setHoveredItem('profile')}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <button
                  onClick={handleProfileClick}
                  className={`relative flex items-center w-full px-4 py-3 rounded-2xl transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`}
                  style={{
                    background: location.pathname === '/profile' ? 'linear-gradient(to right, #f97316, #fbbf24)' : undefined,
                    color: location.pathname === '/profile' ? '#fff' : undefined,
                    boxShadow: location.pathname === '/profile' ? '0 4px 12px rgba(0,0,0,0.15)' : undefined
                  }}
                >
                  <img
                    src={userData?.profileImage || 'https://i.pravatar.cc/150?img=3'}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-gray-800 flex-shrink-0"
                  />
                  {!isCollapsed && (
                    <span className="ml-3 font-medium whitespace-nowrap">
                      {userData?.name || 'Profile'}
                    </span>
                  )}
                </button>
              </div>
              {/* Logout */}
              <div 
                className="relative"
                onMouseEnter={() => setHoveredItem('logout')}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <button
                  onClick={handleLogout}
                  className={`relative flex items-center w-full px-4 py-3 rounded-2xl transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`}
                  style={{ color: theme === 'dark' ? '#fda4af' : '#e11d48' }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {!isCollapsed && (
                    <span className="ml-3 font-medium whitespace-nowrap">
                      Logout
                    </span>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Login */}
              <div 
                className="relative"
                onMouseEnter={() => setHoveredItem('login')}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {location.pathname === '/login' ? (
                  <Link
                    to="/login"
                    onClick={() => setIsMobileOpen(false)}
                    className="relative flex items-center w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg rounded-2xl transition-all duration-300"
                  >
                    <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span className="ml-3 font-medium whitespace-nowrap">Login</span>
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMobileOpen(false)}
                    className={`relative flex items-center w-full px-4 py-3 rounded-2xl transition-all duration-300 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg hover:shadow-xl hover:scale-105 ${isCollapsed ? 'justify-center w-14 h-14 px-0 py-0' : ''}`}
                  >
                    <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    {!isCollapsed && (
                      <span className="ml-3 font-medium whitespace-nowrap">Login</span>
                    )}
                  </Link>
                )}
                
                {location.pathname !== '/login' && hoveredItem === 'login' && (
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 z-50">
                    <div className="bg-orange-500/95 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-xl border border-gray-700">
                      Login
                      <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-orange-500/95"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Register */}
              <div 
                className="relative"
                onMouseEnter={() => setHoveredItem('register')}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {location.pathname === '/register' ? (
                  <Link
                    to="/register"
                    onClick={() => setIsMobileOpen(false)}
                    className="relative flex items-center w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg rounded-2xl transition-all duration-300"
                  >
                    <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span className="ml-3 font-medium whitespace-nowrap">Sign Up</span>
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    onClick={() => setIsMobileOpen(false)}
                    className={`relative flex items-center w-full px-4 py-3 rounded-2xl transition-all duration-300 border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white hover:scale-105 ${isCollapsed ? 'justify-center w-14 h-14 px-0 py-0' : ''}`}
                  >
                    <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    {!isCollapsed && (
                      <span className="ml-3 font-medium whitespace-nowrap">Sign Up</span>
                    )}
                  </Link>
                )}
                
                {location.pathname !== '/register' && hoveredItem === 'register' && (
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 z-50">
                    <div className="bg-orange-500/95 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-xl border border-gray-700">
                      Sign Up
                      <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-orange-500/95"></div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content spacer - Dynamic based on sidebar width */}
      <div className={`${filteredNavigation.find(item => item.href === location.pathname) ? 'lg:ml-48' : 'lg:ml-20'} transition-all duration-300`}></div>
    </>
  );
};

export default Sidebar;

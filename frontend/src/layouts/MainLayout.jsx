import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  const noSidebarPages = ['/login', '/signup'];
  const showSidebar = !noSidebarPages.includes(location.pathname);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Check for mobile screen with enhanced responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      
      // Handle very small screens (< 360px)
      if (window.innerWidth < 360) {
        document.documentElement.style.setProperty('--mobile-padding', '0.5rem');
      } else {
        document.documentElement.style.setProperty('--mobile-padding', '1rem');
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden max-w-full">
      {/* Sidebar - handles its own responsive behavior */}
      {showSidebar && <Sidebar />}

      {/* Page content */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 overflow-x-hidden max-w-full ${
          showSidebar ? (isMobile ? 'ml-0' : 'ml-64') : ''
        }`}
      >
        {/* Main content with responsive padding and overflow handling */}
        <main className={`flex-grow w-full overflow-x-hidden max-w-full container-responsive ${
          showSidebar && isMobile 
            ? 'pt-20 px-2 sm:px-4 pb-4' // More top padding for mobile menu button, responsive horizontal padding
            : 'p-2 sm:p-4 lg:p-6' // Responsive padding for all screen sizes
        }`}>
          <div className="w-full max-w-full overflow-x-hidden container-responsive">
            {children}
          </div>
        </main>

        {/* Footer with responsive behavior */}
        <div className="w-full max-w-full overflow-x-hidden">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;

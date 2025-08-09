import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const noSidebarPages = ['/login', '/signup'];
  const showSidebar = !noSidebarPages.includes(location.pathname);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Close sidebar on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && isSidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.4 }}
            className="fixed lg:relative z-40"
          >
            <Sidebar />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page content */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          showSidebar ? 'lg:ml-64 ml-0 pt-16 lg:pt-0' : ''
        }`}
      >
        {/* Header bar */}
        {showSidebar && (
          <div className="lg:hidden fixed top-0 left-0 w-full z-50 bg-white shadow-md p-4 flex items-center justify-between">
            <button
              className="text-gray-700"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
            >
              {isSidebarOpen ? '✖' : '☰'}
            </button>
            <h1 className="text-lg font-semibold">Menu</h1>
          </div>
        )}

        {/* Main content */}
        <main className="flex-grow p-4">{children}</main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;

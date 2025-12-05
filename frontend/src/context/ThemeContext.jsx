import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first, but default to 'light' if not found
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      // console.log('Theme initialization - saved theme:', savedTheme);
      return savedTheme === 'dark' ? 'dark' : 'light';
    }
    return 'light';
  });

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
  };

  useEffect(() => {
    const root = document.documentElement;
    
    // Save theme to localStorage
    localStorage.setItem('theme', theme);
    
    // Always clean up existing classes first
    root.classList.remove('dark', 'light');
    
    // Add the current theme class
    root.classList.add(theme);
    
  }, [theme]);

  // Initialize theme on component mount to ensure clean state
  useEffect(() => {
    const root = document.documentElement;
    
    // Clean up any existing theme classes
    root.classList.remove('dark', 'light');
    
    // Apply the initial theme
    root.classList.add(theme);
  }, []); // Run once on mount

  return (
    <ThemeContext.Provider value={{ theme, setTheme: updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first, but default to 'light' if not found
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      // console.log('ðŸŽ¨ Theme initialization - saved theme:', savedTheme);
      return savedTheme === 'dark' ? 'dark' : 'light';
    }
    return 'light';
  });

  const updateTheme = (newTheme) => {
    // console.log('ðŸŽ¨ Theme update requested:', newTheme);
    setTheme(newTheme);
  };

  useEffect(() => {
    // console.log('ðŸŽ¨ Theme effect running - current theme:', theme);
    const root = document.documentElement;
    
    // Save theme to localStorage
    localStorage.setItem('theme', theme);
    // console.log('ðŸŽ¨ Theme saved to localStorage:', theme);
    
    // Always clean up existing classes first
    root.classList.remove('dark', 'light');
    // console.log('ðŸŽ¨ Removed existing theme classes');
    
    // Add the current theme class
    root.classList.add(theme);
    // console.log('ðŸŽ¨ Added theme class:', theme, 'Current classes:', root.className);
    
  }, [theme]);

  // Initialize theme on component mount to ensure clean state
  useEffect(() => {
    // console.log('ðŸŽ¨ Initial theme setup');
    const root = document.documentElement;
    
    // Clean up any existing theme classes
    root.classList.remove('dark', 'light');
    
    // Apply the initial theme
    root.classList.add(theme);
    // console.log('ðŸŽ¨ Initial theme applied:', theme, 'HTML classes:', root.className);
  }, []); // Run once on mount

  return (
    <ThemeContext.Provider value={{ theme, setTheme: updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

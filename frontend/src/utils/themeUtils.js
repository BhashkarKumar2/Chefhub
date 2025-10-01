import { useTheme } from '../context/ThemeContext';

// Theme-aware utility functions
export const useThemeClasses = () => {
  const { theme } = useTheme();
  
  return {
    // Background classes
    bg: {
      primary: theme === 'dark' ? 'bg-gray-900' : 'bg-white',
      secondary: theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50',
      card: theme === 'dark' ? 'bg-gray-800' : 'bg-white',
      page: theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50',
    },
    
    // Text classes  
    text: {
      primary: theme === 'dark' ? 'text-white' : 'text-gray-900',
      secondary: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
      muted: theme === 'dark' ? 'text-gray-400' : 'text-gray-500',
      heading: theme === 'dark' ? 'text-white' : 'text-gray-800',
    },
    
    // Border classes
    border: {
      default: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
      light: theme === 'dark' ? 'border-gray-600' : 'border-gray-300',
    },
    
    // Input classes
    input: {
      bg: theme === 'dark' ? 'bg-gray-800' : 'bg-white',
      border: theme === 'dark' ? 'border-gray-600' : 'border-gray-300',
      text: theme === 'dark' ? 'text-gray-100' : 'text-gray-900',
      placeholder: theme === 'dark' ? 'placeholder-gray-400' : 'placeholder-gray-500',
    },
    
    // Button classes
    button: {
      secondary: theme === 'dark' ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    }
  };
};

// Helper function to get theme-aware classes
export const getThemeClass = (lightClass, darkClass, currentTheme) => {
  return currentTheme === 'dark' ? darkClass : lightClass;
};

// Hook for theme-aware component styling
export const useThemeAwareStyle = () => {
  const { theme } = useTheme();
  const classes = useThemeClasses();
  
  return {
    theme,
    classes,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    getClass: (lightClass, darkClass) => getThemeClass(lightClass, darkClass, theme)
  };
};
import React from 'react';
import { useThemeAwareStyle } from '../../utils/themeUtils';

const Footer = () => {
  const { classes } = useThemeAwareStyle();
  
  return (
    <footer className={`${classes.bg.secondary} text-center py-4 mt-8 border-t ${classes.border.default}`}>
      <p className={`text-sm ${classes.text.muted}`}>&copy; 2025 Chefify. All rights reserved.</p>
    </footer>
  );
};

export default Footer;

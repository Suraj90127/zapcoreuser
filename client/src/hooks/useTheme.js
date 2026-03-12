import { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const useThemeEffects = () => {
  const { theme } = useTheme();

  useEffect(() => {
    // Add theme-specific classes to body
    const body = document.body;
    
    // Remove all theme classes
    body.classList.remove('theme-dark', 'theme-light', 'theme-gray');
    
    // Add current theme class
    body.classList.add(`theme-${theme}`);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      switch(theme) {
        case 'dark':
          metaThemeColor.setAttribute('content', '#111827');
          break;
        case 'light':
          metaThemeColor.setAttribute('content', '#ffffff');
          break;
        case 'gray':
          metaThemeColor.setAttribute('content', '#f3f4f6');
          break;
        default:
          metaThemeColor.setAttribute('content', '#111827');
      }
    }

    // Add CSS variables for theme
    const root = document.documentElement;
    if (theme === 'dark') {
      root.style.setProperty('--primary-bg', '#111827');
      root.style.setProperty('--secondary-bg', '#1f2937');
      root.style.setProperty('--primary-text', '#f9fafb');
      root.style.setProperty('--secondary-text', '#d1d5db');
    } else if (theme === 'light') {
      root.style.setProperty('--primary-bg', '#ffffff');
      root.style.setProperty('--secondary-bg', '#f9fafb');
      root.style.setProperty('--primary-text', '#111827');
      root.style.setProperty('--secondary-text', '#6b7280');
    } else {
      root.style.setProperty('--primary-bg', '#f3f4f6');
      root.style.setProperty('--secondary-bg', '#e5e7eb');
      root.style.setProperty('--primary-text', '#111827');
      root.style.setProperty('--secondary-text', '#4b5563');
    }

  }, [theme]);

  return { theme };
};
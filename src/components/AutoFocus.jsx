import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Auto-focus main heading on route change for accessibility.
 * Usage: Add <AutoFocus /> to RootLayout or main component.
 */
export default function AutoFocus() {
  const location = useLocation();
  const previousPath = useRef(location.pathname);

  useEffect(() => {
    // Only focus if route actually changed
    if (previousPath.current !== location.pathname) {
      previousPath.current = location.pathname;
      
      // Small delay to allow DOM updates
      setTimeout(() => {
        // Try to focus main heading (h1) or main content area
        const h1 = document.querySelector('main h1, #main-content h1, h1');
        if (h1 && typeof h1.focus === 'function') {
          h1.setAttribute('tabindex', '-1');
          h1.focus({ preventScroll: false });
        } else {
          // Fallback to main content area
          const main = document.querySelector('#main-content, main');
          if (main && typeof main.focus === 'function') {
            main.focus({ preventScroll: false });
          }
        }
      }, 100);
    }
  }, [location.pathname]);

  return null;
}

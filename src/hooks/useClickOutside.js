import { useEffect, useRef } from 'react';

/**
 * Hook that alerts clicks outside of the passed ref element
 * @param {Function} handler - Function to call when clicking outside
 * @param {boolean} isOpen - Whether the element is currently open/visible
 * @returns {Object} ref - Ref to attach to the element that should detect outside clicks
 */
export function useClickOutside(handler, isOpen = true) {
  const ref = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        handler();
      }
    };

    // Add event listener with a small delay to avoid immediate closing
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [handler, isOpen]);

  return ref;
}

/**
 * Hook for handling escape key press
 * @param {Function} handler - Function to call when escape is pressed
 * @param {boolean} isOpen - Whether the element is currently open/visible
 */
export function useEscapeKey(handler, isOpen = true) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        handler();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handler, isOpen]);
}

/**
 * Combined hook for click outside and escape key
 * @param {Function} handler - Function to call when clicking outside or pressing escape
 * @param {boolean} isOpen - Whether the element is currently open/visible
 * @returns {Object} ref - Ref to attach to the element
 */
export function useClickOutsideAndEscape(handler, isOpen = true) {
  const ref = useClickOutside(handler, isOpen);
  useEscapeKey(handler, isOpen);
  return ref;
}
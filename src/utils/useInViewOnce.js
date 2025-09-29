import { useEffect, useRef, useState } from 'react';

// Observe an element and return true once it has intersected threshold (default 0.2)
export function useInViewOnce(options = { threshold: 0.2, root: null, rootMargin: '0px' }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current || inView || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      });
    }, options);
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options, inView]);

  return [ref, inView];
}

export default useInViewOnce;

import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

export default function Sidebar() {
  const linkBase =
    "block px-2 py-2 rounded hover:bg-cream-hover hover:text-brand-orange transition-colors text-[12px] leading-tight whitespace-nowrap text-center";
  const linkClass = ({ isActive }) =>
    isActive
  ? `${linkBase} bg-cream-hover text-brand-brown font-semibold`
  : `${linkBase} text-brand-brown`;

  const [open, setOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const asideRef = useRef(null);
  const prevFocusRef = useRef(null);

  // Track responsive breakpoint and default sidebar state
  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 640; // Tailwind 'sm'
      setIsMobile(mobile);
      // Close by default on mobile, open on desktop
      setOpen(prev => (mobile ? false : true));
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Listen for global toggle events from Navbar
  useEffect(() => {
    const handler = () => setOpen(v => !v);
    window.addEventListener('toggle-sidebar', handler);
    return () => window.removeEventListener('toggle-sidebar', handler);
  }, []);

  // Close on route change (mobile) for better UX
  useEffect(() => {
    if (isMobile) setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Close on Escape and lock body scroll when open on mobile
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && isMobile && open) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    if (isMobile && open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        window.removeEventListener('keydown', onKey);
        document.body.style.overflow = prev;
      };
    }
    return () => window.removeEventListener('keydown', onKey);
  }, [isMobile, open]);

  // Focus trap while mobile drawer is open, and restore focus on close
  useEffect(() => {
    if (!(isMobile && open)) {
      // Restore focus to the nav toggle if available, else previous element
      const toggleBtn = document.querySelector('button[aria-label="Toggle Explore Sidebar"]');
      if (toggleBtn && document.contains(toggleBtn)) {
        toggleBtn.focus();
      } else if (prevFocusRef.current && document.contains(prevFocusRef.current)) {
        prevFocusRef.current.focus();
      }
      return;
    }

    // store previous focus
    prevFocusRef.current = document.activeElement;
    const root = asideRef.current;
    if (!root) return;

    const getFocusable = () => Array.from(root.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
    ));

    const focusables = getFocusable();
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (first) first.focus();

    const onKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      const list = getFocusable();
      if (list.length === 0) return;
      const firstEl = list[0];
      const lastEl = list[list.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    root.addEventListener('keydown', onKeyDown);
    return () => root.removeEventListener('keydown', onKeyDown);
  }, [isMobile, open]);

  const containerClass = isMobile
    ? (open
        ? "fixed top-16 left-0 w-64 h-[calc(100vh-64px-56px)] bg-cream-sand text-brand-brown py-4 px-2 z-40 shadow"
        : "hidden")
    : "w-40 bg-cream-sand text-brand-brown py-4 px-2 flex-shrink-0 sticky top-16 self-start overflow-auto";

  const navId = 'explore-nav';

  return (
  <>
    {/* Backdrop for mobile overlay */}
    {isMobile && open && (
      <button
        type="button"
        aria-label="Close Explore"
        onClick={() => setOpen(false)}
        className="fixed top-16 left-0 right-0 bottom-14 bg-black/30 z-30"
      />
    )}
    <aside
      className={`${containerClass} sidebar-scroll`}
      style={!isMobile ? { maxHeight: 'calc(100vh - 64px - 56px)' } : undefined}
      aria-label="Explore sidebar"
      role={isMobile && open ? 'dialog' : undefined}
      aria-modal={isMobile && open ? 'true' : undefined}
      ref={asideRef}
    >
      <div className="group">
        <button
          type="button"
          className="w-full flex items-center justify-center gap-1 text-brand-brown font-semibold select-none text-center"
          aria-expanded={open}
          aria-controls={navId}
          onClick={() => setOpen((v) => !v)}
        >
          <span id="explore-title" className="text-base">Explore</span>
          <span
            className={`transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
            aria-hidden="true"
          >
            ▾
          </span>
        </button>

        {/* Mobile-only close button inside overlay */}
        {isMobile && open && (
          <div className="mt-2 text-center">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-cream-border bg-cream text-brand-brown text-[12px] hover:bg-cream-hover"
            >
              Close
            </button>
          </div>
        )}

  <nav id={navId} role="navigation" aria-label="Explore" aria-labelledby="explore-title" className={`mt-3 space-y-1 text-center ${open ? "block" : "hidden"} group-hover:block focus-within:block`}>
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>
          <NavLink to="/about" className={linkClass}>
            About
          </NavLink>
          <NavLink to="/safety" className={linkClass}>
            Safety Promise
          </NavLink>
          <NavLink to="/contact" className={linkClass}>
            Contacts
          </NavLink>
          <NavLink to="/terms" className={linkClass} title="Terms & Conditions">
            Terms & Conditions
          </NavLink>
        </nav>
      </div>
    </aside>
  </>
  );
}

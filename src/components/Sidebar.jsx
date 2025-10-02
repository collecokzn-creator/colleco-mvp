import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

export default function Sidebar() {
  const linkBase =
    "block px-2 py-2 rounded hover:bg-cream-hover hover:text-brand-orange transition-colors text-[12px] leading-tight text-left";
  const linkClass = ({ isActive }) =>
    isActive
  ? `${linkBase} bg-cream-hover text-brand-orange font-semibold`
  : `${linkBase} text-brand-brown`;

  const [open, setOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const location = useLocation();
  const asideRef = useRef(null);
  const prevFocusRef = useRef(null);

  // Toggle section expansion
  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  // Track responsive breakpoint and default sidebar state
  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 640; // Tailwind 'sm'
      setIsMobile(mobile);
      // Close by default on mobile, open on desktop
  setOpen(_prev => (mobile ? false : true));
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Listen for global toggle events from Navbar
  useEffect(() => {
  const handler = () => setOpen(_v => !_v);
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

  // Handle click outside to close sidebar
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (asideRef.current && !asideRef.current.contains(event.target)) {
        // Don't close if clicking on the hamburger menu button
        const hamburgerBtn = document.querySelector('button[aria-label="Toggle Explore Sidebar"]');
        if (hamburgerBtn && hamburgerBtn.contains(event.target)) return;
        
        setOpen(false);
      }
    };

    // Add click listener to document
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [open]);

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
  const _last = focusables[focusables.length - 1];
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
        ? "fixed top-16 left-0 w-56 h-[calc(100vh-64px-56px)] bg-cream-sand text-brand-brown py-4 px-2 z-40 shadow overflow-y-auto"
        : "hidden")
    : "w-36 bg-cream-sand text-brand-brown py-4 px-2 flex-shrink-0 sticky top-16 self-start overflow-auto";

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



  <nav id={navId} role="navigation" aria-label="Explore" aria-labelledby="explore-title" className={`mt-3 space-y-2 ${open ? "block" : "hidden"} group-hover:block focus-within:block`}>
          
          {/* Home - Quick Access */}
          <div className="border-b border-cream-border/50 pb-2">
            <NavLink to="/" className={linkClass} end>
              🏠 Home
            </NavLink>
          </div>

          {/* Login/Register Section */}
          <div className="border-b border-cream-border/50 pb-2">
            <button
              type="button"
              onClick={() => toggleSection('login')}
              className="w-full flex items-center justify-between px-2 py-2 rounded hover:bg-cream-hover transition-colors text-[13px] font-semibold text-brand-orange"
            >
              <span>Login/Register</span>
              <span className={`transition-transform duration-200 ${expandedSections.login ? "rotate-180" : "rotate-0"}`}>▾</span>
            </button>
            {expandedSections.login && (
              <div className="mt-2 space-y-1 pl-2">
                <NavLink to="/login" className={linkClass}>
                  Login / Register
                </NavLink>
                <NavLink to="/profile" className={linkClass}>
                  Profile
                </NavLink>
              </div>
            )}
          </div>

          {/* Trip Planner Section */}
          <div className="border-b border-cream-border/50 pb-2">
            <button
              type="button"
              onClick={() => toggleSection('tripPlanner')}
              className="w-full flex items-center justify-between px-2 py-2 rounded hover:bg-cream-hover transition-colors text-[13px] font-semibold text-brand-orange"
            >
              <span>Trip Planner</span>
              <span className={`transition-transform duration-200 ${expandedSections.tripPlanner ? "rotate-180" : "rotate-0"}`}>▾</span>
            </button>
            {expandedSections.tripPlanner && (
              <div className="mt-2 space-y-1 pl-2">
                <NavLink to="/plan-trip" className={linkClass}>
                  Trip Planner
                </NavLink>
                <NavLink to="/ai" className={linkClass}>
                  Trip Assist
                </NavLink>
                <NavLink to="/quote/new" className={linkClass}>
                  New Quote
                </NavLink>
                <NavLink to="/quotes" className={linkClass}>
                  Quotes
                </NavLink>
                <NavLink to="/itinerary" className={linkClass}>
                  Itinerary
                </NavLink>
                <NavLink to="/bookings" className={linkClass}>
                  Bookings
                </NavLink>
              </div>
            )}
          </div>

          {/* Partner & Business Section */}
          <div className="border-b border-cream-border/50 pb-2">
            <button
              type="button"
              onClick={() => toggleSection('partnerBusiness')}
              className="w-full flex items-center justify-between px-2 py-2 rounded hover:bg-cream-hover transition-colors text-[13px] font-semibold text-brand-orange"
            >
              <span>Partner & Business</span>
              <span className={`transition-transform duration-200 ${expandedSections.partnerBusiness ? "rotate-180" : "rotate-0"}`}>▾</span>
            </button>
            {expandedSections.partnerBusiness && (
              <div className="mt-2 space-y-1 pl-2">
                <NavLink to="/partner-dashboard" className={linkClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/collaboration" className={linkClass}>
                  Collaboration
                </NavLink>
                <NavLink to="/collab-analytics" className={linkClass}>
                  Collab Analytics
                </NavLink>
                <NavLink to="/admin-console" className={linkClass}>
                  Admin Console
                </NavLink>
              </div>
            )}
          </div>

          {/* Accounts Section */}
          <div className="border-b border-cream-border/50 pb-2">
            <button
              type="button"
              onClick={() => toggleSection('accounts')}
              className="w-full flex items-center justify-between px-2 py-2 rounded hover:bg-cream-hover transition-colors text-[13px] font-semibold text-brand-orange"
            >
              <span>Accounts</span>
              <span className={`transition-transform duration-200 ${expandedSections.accounts ? "rotate-180" : "rotate-0"}`}>▾</span>
            </button>
            {expandedSections.accounts && (
              <div className="mt-2 space-y-1 pl-2">
                <NavLink to="/settings" className={linkClass}>
                  Settings
                </NavLink>
                <NavLink to="/compliance" className={linkClass}>
                  Compliance
                </NavLink>
                <NavLink to="/reports" className={linkClass}>
                  Reports
                </NavLink>
                <NavLink to="/promotions" className={linkClass}>
                  Promotions
                </NavLink>
                <NavLink to="/payouts" className={linkClass}>
                  Payouts
                </NavLink>
              </div>
            )}
          </div>

          {/* Information Section */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection('information')}
              className="w-full flex items-center justify-between px-2 py-2 rounded hover:bg-cream-hover transition-colors text-[13px] font-semibold text-brand-orange"
            >
              <span>Information</span>
              <span className={`transition-transform duration-200 ${expandedSections.information ? "rotate-180" : "rotate-0"}`}>▾</span>
            </button>
            {expandedSections.information && (
              <div className="mt-2 space-y-1 pl-2">
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
              </div>
            )}
          </div>
        </nav>
      </div>
    </aside>
  </>
  );
}

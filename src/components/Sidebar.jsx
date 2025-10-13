// Tool icon imports (replace with actual icon imports as needed)
export const TOOL_CONFIG = {
  admin: [
    { label: '⚙️ Admin Console', to: '/admin-console' },
    { label: '📊 Analytics', to: '/analytics' },
    { label: '🤝 Partner Management', to: '/partners' },
    { label: '📦 Packages', to: '/admin/packages' },
    { label: '📈 Reports', to: '/reports' },
    { label: '🛡️ Compliance', to: '/compliance' },
    { label: '💬 Support', to: '/support' },
  ],
  partner: [
    { label: '📔 My Bookings', to: '/bookings' },
    { label: '💰 Earnings', to: '/payouts' },
    { label: '📦 Packages', to: '/packages' },
    { label: '💬 Support', to: '/support' },
  ],
  client: [
    { label: '🧳 My Trips', to: '/trips' },
    { label: '🧭 Plan Trip', to: '/plan-trip' },
    { label: '📦 Packages', to: '/packages' },
    { label: '💬 Support', to: '/support' },
  ],
};

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";
import { NavLink } from "react-router-dom";
import logoPng from "../assets/colleco-logo.png";


export default function Sidebar() {
  // Mobile sidebar toggle
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => {
    const handler = () => setOpen((v) => !v);
    window.addEventListener('toggle-sidebar', handler);
    return () => window.removeEventListener('toggle-sidebar', handler);
  }, []);
  const { user, setUser, isAdmin, isPartner, isClient } = useUser();
  const [role, setRole] = useState(user?.role || "none");
  const navigate = useNavigate();
  const asideRef = useRef(null);

  // Note: legacy role change handler removed (unused)

  // Dropdown state for role switcher
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const roleMenuRef = React.useRef(null);
  // Direct role setter for modern menu
  const setRoleByValue = (newRole) => {
    setRole(newRole);
    if (user) {
      setUser({ ...user, role: newRole });
    } else {
      setUser({ name: "Dev User", email: "dev@colleco.com", role: newRole });
    }
    setRoleMenuOpen(false); // close after selection
  };
  // Close menu on outside click
  useEffect(() => {
    if (!roleMenuOpen) return;
    const handleClick = (e) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target)) {
        setRoleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [roleMenuOpen]);

  // Responsive sidebar: hidden on mobile unless open
  // Outside-close handled by overlay button to avoid conflicts with hamburger clicks
  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Lock body scroll when sidebar open on mobile
  useEffect(() => {
    const isMobile = window.innerWidth < 640;
    if (isMobile && open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

        {isAdmin && (
          <>
            <div className="mx-3 my-2 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand-russty/70 bg-cream-sand/50 rounded border border-cream-border">Admin Tools</div>
      {open && window.innerWidth < 640 && (
        <button
          type="button"
          className="sidebar-overlay fixed left-0 right-0 bottom-0 z-[40] bg-black/20 sm:hidden"
          aria-label="Close sidebar"
          tabIndex={0}
          onClick={() => setOpen(false)}
        {isPartner && (
          <>
            <div className="mx-3 my-2 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand-russty/70 bg-cream-sand/50 rounded border border-cream-border">Partner Tools</div>
      {(open || window.innerWidth >= 640) && (
        <aside
          ref={asideRef}
          className={`w-64 flex flex-col bg-white text-brand-russty fixed right-0 sm:right-4 z-[70] rounded-2xl shadow-xl overflow-y-auto border border-white transition-transform duration-300 ${open ? 'translate-x-0' : 'sm:translate-x-0 translate-x-[110%]'} sm:block`}
          style={{
            top: 'calc(var(--header-h, 64px) + 1rem)',
            bottom: 'calc(var(--footer-h, 48px) + 1rem)',
        {isClient && (
          <>
            <div className="mx-3 my-2 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand-russty/70 bg-cream-sand/50 rounded border border-cream-border">Client Tools</div>
        >
          {/* Pinned brand header */}
          <div className="sticky top-0 z-10 bg-white p-6 border-b border-cream-border">
            <div className="flex flex-col items-center mb-2">
              <img src={logoPng} alt="CollEco Logo" className="h-10 w-10 mb-1" />
              <span className="text-lg font-bold text-brand-orange tracking-tight" style={{ marginTop: '-2px', letterSpacing: '-0.5px' }}>CollEco Travel</span>
            </div>
          </div>
          <div className="flex-1 p-6 sidebar-scroll divide-y divide-cream-border space-y-4" style={{ overscrollBehavior: 'contain' }}>
            {/* AI-aware Quick Actions Strip */}
            <div className="flex flex-wrap gap-2 justify-center mb-6 pt-4">
              {/* New Quote (visible to admin, partner, client) */}
              {(isAdmin || isPartner || isClient) && (
                <>
                  <button
                    className="px-3 py-1 rounded bg-brand-orange text-white text-xs font-semibold shadow hover:bg-brand-orange/90 transition"
                    title="Create new quote"
                    onClick={() => navigate('/quote/new')}
                  >
                    + New Quote
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-brand-orange text-white text-xs font-semibold shadow hover:bg-brand-orange/90 transition"
                    title="Create new booking"
                    onClick={() => navigate('/direct-booking')}
                  >
                    + Booking
                  </button>
                </>
              )}
              {/* New Partner Lead (visible to admin) */}
              {isAdmin && (
                <button
                  className="px-3 py-1 rounded bg-brand-orange text-white text-xs font-semibold shadow hover:bg-brand-orange/90 transition"
                  title="Add new partner lead"
                  onClick={() => navigate('/partners')}
                >
                  + Partner Lead
                </button>
              )}
              {/* Future: Add more quick actions here, AI-powered suggestions, etc. */}
            </div>
          <div className="mb-4">
            <div className="block text-xs text-brand-russty mb-1">Role Switcher:</div>
            <div className="relative" ref={roleMenuRef}>
              <button
                type="button"
                className="w-full px-3 py-2 rounded border border-cream-border text-brand-russty bg-white flex items-center justify-between hover:bg-cream-sand"
                title="Select a role"
                onClick={() => setRoleMenuOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={roleMenuOpen}
              >
                <span className="font-semibold">Role: {role !== 'none' ? role.charAt(0).toUpperCase() + role.slice(1) : 'None'}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-brand-russty"><path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              {/* Dropdown menu */}
              {roleMenuOpen && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-cream-border rounded-lg shadow z-50 overflow-hidden">
                  <button className="w-full text-left px-3 py-2 text-brand-russty hover:bg-brand-orange/10" onClick={() => setRoleByValue('none')}>None</button>
                  <button className="w-full text-left px-3 py-2 text-brand-russty hover:bg-brand-orange/10" onClick={() => setRoleByValue('admin')}>Admin</button>
                  <button className="w-full text-left px-3 py-2 text-brand-russty hover:bg-brand-orange/10" onClick={() => setRoleByValue('partner')}>Partner</button>
                  <button className="w-full text-left px-3 py-2 text-brand-russty hover:bg-brand-orange/10" onClick={() => setRoleByValue('client')}>Client</button>
                </div>
              )}
            </div>
          </div>
        {user ? (
          <div className="mb-6 border-b border-cream-border pb-3">
            <p className="text-sm text-brand-russty">Welcome back,</p>
            <p className="font-bold text-brand-orange flex items-center gap-2">
              {user.name}
              {/* Role badge */}
              {isAdmin && <span className="text-xs px-2 py-0.5 rounded bg-brand-orange text-white">Admin</span>}
              {isPartner && <span className="text-xs px-2 py-0.5 rounded bg-brand-orange text-white">Partner</span>}
              {isClient && <span className="text-xs px-2 py-0.5 rounded bg-brand-orange text-white">Client</span>}
            </p>
            <p className="text-xs text-brand-russty">{user.email}</p>
          </div>
        ) : (
          <p className="text-sm text-brand-russty mb-4">Not logged in</p>
        )}

      {/* Navigation strictly aligned to role */}
      <nav className="space-y-1">
        {/* Dashboard always first */}
        <NavLink to="/" onClick={() => setOpen(false)} className={({ isActive }) => `block px-3 py-2 rounded font-semibold ${isActive ? 'bg-brand-orange/20 text-brand-orange shadow' : 'hover:bg-brand-orange/10 hover:text-brand-orange'}`}>🏠 Dashboard</NavLink>
        {/* Role-based tools rendered from config */}
        {isAdmin && (
          <>
            <div className="px-3 py-1 text-xs font-semibold text-brand-russty/80 uppercase tracking-wide">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cream-sand/60 text-brand-russty">
                👑 Admin Tools
              </span>
            </div>
            {TOOL_CONFIG.admin.map(tool => (
              <NavLink key={tool.to} to={tool.to} onClick={() => setOpen(false)} className={({ isActive }) => `block px-3 py-2 rounded font-semibold ${isActive ? 'bg-brand-orange/10 text-brand-orange shadow' : 'hover:bg-brand-orange/10 hover:text-brand-orange'}`}>
                {tool.label}
              </NavLink>
            ))}
          </>
        )}
        {isPartner && (
          <>
            <div className="px-3 py-1 text-xs font-semibold text-brand-russty/80 uppercase tracking-wide">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cream-sand/60 text-brand-russty">
                🤝 Partner Tools
              </span>
            </div>
            {TOOL_CONFIG.partner.map(tool => (
              <NavLink key={tool.to} to={tool.to} onClick={() => setOpen(false)} className={({ isActive }) => `block px-3 py-2 rounded font-semibold ${isActive ? 'bg-brand-orange/10 text-brand-orange shadow' : 'hover:bg-brand-orange/10 hover:text-brand-orange'}`}>
                {tool.label}
              </NavLink>
            ))}
          </>
        )}
        {isClient && (
          <>
            <div className="px-3 py-1 text-xs font-semibold text-brand-russty/80 uppercase tracking-wide">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cream-sand/60 text-brand-russty">
                🧳 Client Tools
              </span>
            </div>
            {TOOL_CONFIG.client.map(tool => (
              <NavLink key={tool.to} to={tool.to} onClick={() => setOpen(false)} className={({ isActive }) => `block px-3 py-2 rounded font-semibold ${isActive ? 'bg-brand-orange/10 text-brand-orange shadow' : 'hover:bg-brand-orange/10 hover:text-brand-orange'}`}>
                {tool.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>
        {/* Remove inline Trip Assist from sidebar; floating icon will be global */}
      </div>
    </aside>
      )}
    </>
  );
}

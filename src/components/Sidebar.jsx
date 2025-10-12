
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";
import { NavLink } from "react-router-dom";
import logoPng from "../assets/colleco-logo.png";

const DEV_MODE = !process.env.NODE_ENV || process.env.NODE_ENV === "development";


export default function Sidebar() {
  const { user, setUser, isAdmin, isPartner, isClient } = useUser();
  const [role, setRole] = useState(user?.role || "none");
  const navigate = useNavigate();

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

  return (
  <aside
    className="w-64 flex flex-col bg-white text-brand-russty fixed left-4 z-40 rounded-2xl shadow-xl overflow-hidden border border-white"
    style={{
      top: 'calc(var(--header-h, 64px) + 1rem)',
      bottom: 'calc(var(--footer-h, 48px) + 1rem)'
    }}
  >
        
    <div
      className="flex-1 p-6 overflow-y-auto sidebar-scroll divide-y divide-cream-border space-y-4"
      style={{ maxHeight: 'calc(100vh - var(--header-h, 64px) - var(--footer-h, 48px) - 2rem)' }}
    >
      <div className="flex flex-col items-center mb-4">
        <div className="flex flex-col items-center gap-1">
          <img src={logoPng} alt="CollEco Logo" className="h-10 w-10 mb-1" />
          <span className="text-lg font-bold text-brand-orange tracking-tight" style={{ marginTop: '-2px', letterSpacing: '-0.5px' }}>CollEco Travel</span>
        </div>
      </div>
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
        {DEV_MODE && (
          <div className="mb-4">
            <div className="block text-xs text-brand-russty mb-1">Role Switcher (dev only):</div>
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
        )}
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
        <NavLink to="/" className={({ isActive }) => `block px-3 py-2 rounded font-semibold ${isActive ? 'bg-brand-orange/20 text-brand-orange shadow' : 'hover:bg-brand-orange/10 hover:text-brand-orange'}`}>🏠 Dashboard</NavLink>

        {isAdmin && (
          <>
            <div className="px-3 py-1 text-xs font-semibold text-brand-russty/80">Admin Tools</div>
            <NavLink to="/admin-console" className={({ isActive }) => `block px-3 py-2 rounded font-semibold ${isActive ? 'bg-brand-orange/10 text-brand-orange shadow' : 'hover:bg-brand-orange/10 hover:text-brand-orange'}`}>⚙️ Admin Console</NavLink>
            <NavLink to="/analytics" className={({ isActive }) => `block px-3 py-2 rounded font-semibold ${isActive ? 'bg-brand-orange/10 text-brand-orange shadow' : 'hover:bg-brand-orange/10 hover:text-brand-orange'}`}>📊 Analytics</NavLink>
            <NavLink to="/partners" className={({ isActive }) => `block px-3 py-2 rounded font-semibold ${isActive ? 'bg-brand-orange/10 text-brand-orange shadow' : 'hover:bg-brand-orange/10 hover:text-brand-orange'}`}>🤝 Partner Management</NavLink>
            <NavLink to="/reports" className={({ isActive }) => `block px-3 py-2 rounded font-semibold ${isActive ? 'bg-brand-orange/10 text-brand-orange shadow' : 'hover:bg-brand-orange/10 hover:text-brand-orange'}`}>📈 Reports</NavLink>
            <NavLink to="/compliance" className={({ isActive }) => `block px-3 py-2 rounded font-semibold ${isActive ? 'bg-brand-orange/10 text-brand-orange shadow' : 'hover:bg-brand-orange/10 hover:text-brand-orange'}`}>🛡️ Compliance</NavLink>
          </>
        )}

        {isPartner && (
          <>
            <div className="px-3 py-1 text-xs font-semibold text-brand-russty/80">Partner Tools</div>
            <NavLink to="/bookings" className={({ isActive }) => `block px-3 py-2 rounded font-semibold ${isActive ? 'bg-brand-orange/10 text-brand-orange shadow' : 'hover:bg-brand-orange/10 hover:text-brand-orange'}`}>📔 My Bookings</NavLink>
            <NavLink to="/payouts" className={({ isActive }) => `block px-3 py-2 rounded font-semibold ${isActive ? 'bg-brand-orange/10 text-brand-orange shadow' : 'hover:bg-brand-orange/10 hover:text-brand-orange'}`}>💰 Earnings</NavLink>
            <NavLink to="/support" className={({ isActive }) => `block px-3 py-2 rounded font-semibold ${isActive ? 'bg-brand-orange/10 text-brand-orange shadow' : 'hover:bg-brand-orange/10 hover:text-brand-orange'}`}>💬 Support</NavLink>
          </>
        )}

        {isClient && (
          <>
            <div className="px-3 py-1 text-xs font-semibold text-brand-russty/80">Client Tools</div>
            <NavLink to="/trips" className={({ isActive }) => `block px-3 py-2 rounded font-semibold ${isActive ? 'bg-brand-orange/10 text-brand-orange shadow' : 'hover:bg-brand-orange/10 hover:text-brand-orange'}`}>🧳 My Trips</NavLink>
            <NavLink to="/plan-trip" className={({ isActive }) => `block px-3 py-2 rounded font-semibold ${isActive ? 'bg-brand-orange/10 text-brand-orange shadow' : 'hover:bg-brand-orange/10 hover:text-brand-orange'}`}>🧭 Plan Trip</NavLink>
            <NavLink to="/support" className={({ isActive }) => `block px-3 py-2 rounded font-semibold ${isActive ? 'bg-brand-orange/10 text-brand-orange shadow' : 'hover:bg-brand-orange/10 hover:text-brand-orange'}`}>💬 Support</NavLink>
          </>
        )}
      </nav>
        {/* Remove inline Trip Assist from sidebar; floating icon will be global */}
      </div>
    </aside>
  );
}

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function MobileNav() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: '🏠', label: 'Home', iconColor: null },
    { path: '/packages', icon: '🎒', label: 'Packages', iconColor: 'text-brand-orange' },
    { path: '/bookings', icon: '📋', label: 'Bookings', iconColor: null },
    { path: '/notifications', icon: '🔔', label: 'Alerts', iconColor: 'text-brand-gold' },
    { path: '/account', icon: '👤', label: 'Account', iconColor: 'text-brand-orange' }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-cream-border shadow-lg z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all rounded-lg relative ${
                isActive 
                  ? 'text-brand-orange bg-cream-sand/40 shadow-inner after:absolute after:bottom-1 after:h-1 after:left-2 after:right-2 after:rounded-full after:bg-brand-orange/70' 
                  : 'text-brand-brown hover:text-brand-orange hover:bg-cream-hover/30'
              }`}
            >
              <span className={`text-2xl mb-0.5 ${item.iconColor || ''}`}>{item.icon}</span>
              <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

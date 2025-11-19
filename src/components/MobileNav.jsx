import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function MobileNav() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/packages', icon: '🎒', label: 'Packages' },
    { path: '/bookings', icon: '📋', label: 'Bookings' },
    { path: '/notifications', icon: '🔔', label: 'Alerts' },
    { path: '/account', icon: '👤', label: 'Account' }
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
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all rounded-lg ${
                isActive 
                  ? 'text-brand-orange bg-cream-sand/30' 
                  : 'text-brand-brown hover:text-brand-orange hover:bg-cream-hover/20'
              }`}
            >
              <span className="text-2xl mb-0.5">{item.icon}</span>
              <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

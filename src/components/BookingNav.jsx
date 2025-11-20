import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home as HomeIcon, BedDouble, Car, Bus, Plane } from 'lucide-react';

/**
 * BookingNav - Consistent navigation for all Book Now pages
 * Shows: Home / Accommodation / Car Hire / Shuttle / Flight Booking
 * Plus "Back to booking options" link below
 */
export default function BookingNav() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Home', icon: HomeIcon },
    { path: '/book/accommodation', label: 'Accommodation', icon: BedDouble },
    { path: '/book/car', label: 'Car Hire', icon: Car },
    { path: '/transfers', label: 'Shuttle', icon: Bus },
    { path: '/book/flight', label: 'Flight Booking', icon: Plane }
  ];
  
  return (
    <div className="mb-6">
      {/* Top Navigation - Horizontal breadcrumb style */}
      <nav className="flex flex-wrap items-center gap-2 pb-3 border-b border-cream-border">
        {navItems.map((item, idx) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <React.Fragment key={item.path}>
              {idx > 0 && <span className="text-brand-brown/30 mx-1">/</span>}
              <Link
                to={item.path}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition ${
                  isActive
                    ? 'bg-brand-orange text-white font-semibold'
                    : 'text-brand-brown hover:bg-cream-sand'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            </React.Fragment>
          );
        })}
      </nav>
      
      {/* Back to Booking Options - Below navigation */}
      {location.pathname !== '/book' && (
        <div className="mt-4">
          <Link
            to="/book"
            className="inline-flex items-center gap-2 text-sm text-brand-brown/70 hover:text-brand-orange transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to booking options</span>
          </Link>
        </div>
      )}
    </div>
  );
}

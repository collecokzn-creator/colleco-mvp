import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const routeLabels = {
  '/': 'Home',
  '/plan-trip': 'Plan Trip',
  '/itinerary': 'Itinerary',
  '/ai': 'Trip Assist',
  '/bookings': 'Bookings',
  '/packages': 'Packages',
  '/transfers': 'Transfers',
  '/collaboration': 'Collaboration',
  '/partner': 'Partner Dashboard',
  '/settings': 'Settings',
  '/profile': 'Profile',
  '/account': 'Account',
  '/notifications': 'Notifications',
  '/contact': 'Contact',
  '/about': 'About',
  '/quotes': 'Quotes',
  '/compliance': 'Compliance',
  '/admin': 'Admin',
};

export default function Breadcrumbs() {
  const location = useLocation();
  const paths = location.pathname.split('/').filter(Boolean);
  
  if (paths.length === 0) return null; // Don't show on home

  const crumbs = [{ path: '/', label: 'Home' }];
  let currentPath = '';
  
  paths.forEach((segment) => {
    currentPath += `/${segment}`;
    const label = routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    crumbs.push({ path: currentPath, label });
  });

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-2 text-sm text-brand-brown/70">
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1;
          return (
            <li key={crumb.path} className="flex items-center gap-2">
              {idx > 0 && <span aria-hidden="true">/</span>}
              {isLast ? (
                <span className="font-semibold text-brand-brown" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link 
                  to={crumb.path} 
                  className="hover:text-brand-orange hover:underline transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

import React from 'react';
import { NavLink } from 'react-router-dom';

const AdminSidebar = () => {
  const getLinkClass = ({ isActive }) =>
    `block py-2 px-4 rounded transition-colors ${
      isActive
        ? 'bg-yellow-500 text-white'
        : 'text-gray-700 hover:bg-gray-200'
    }`;

  return (
    <aside className="w-64 flex-shrink-0 bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-6 text-gray-800">Admin Menu</h2>
      <nav className="space-y-2">
        <NavLink to="/admin" end className={getLinkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/admin/packages" className={getLinkClass}>
          Packages
        </NavLink>
        <NavLink to="/admin/bookings" className={getLinkClass}>
          Bookings
        </NavLink>
        <NavLink to="/admin/finance" className={getLinkClass}>
          Finance
        </NavLink>
        <NavLink to="/admin/compliance" className={getLinkClass}>
          Compliance
        </NavLink>
        <NavLink to="/admin/reports" className={getLinkClass}>
          Reports
        </NavLink>
      </nav>
    </aside>
  );
};

export default AdminSidebar;

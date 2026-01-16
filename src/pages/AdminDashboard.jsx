import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Users, Package, DollarSign, TrendingUp, Shield, Settings } from "lucide-react";
import GamificationWidget from "../components/GamificationWidget";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activePackages: 0,
    monthRevenue: 0,
    totalBookings: 0
  });

  useEffect(() => {
    // Load stats from localStorage
    const bookings = JSON.parse(localStorage.getItem('colleco.bookings') || '[]');
    const users = JSON.parse(localStorage.getItem('colleco.users') || '[]');
    const listings = JSON.parse(localStorage.getItem('colleco.listings') || '[]');
    
    // Calculate current month revenue
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthBookings = bookings.filter(b => {
      if (!b.date) return false;
      const bookingDate = new Date(b.date);
      return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
    });
    
    const monthRevenue = monthBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
    
    // If no data, use demo values
    if (bookings.length === 0 && users.length === 0) {
      setStats({
        totalUsers: 1234,
        activePackages: 56,
        monthRevenue: 45678,
        totalBookings: 234
      });
    } else {
      setStats({
        totalUsers: users.length || 12,
        activePackages: listings.filter(l => l.status === 'active').length || listings.length || 8,
        monthRevenue,
        totalBookings: bookings.length
      });
    }
  }, []);

  return (
    <div className="space-y-10 px-4 pb-32 pt-6 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="space-y-3">
        <span className="inline-flex items-center rounded-full border border-brand-orange/30 bg-brand-orange/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-orange/90">
          Admin workspace
        </span>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold leading-snug text-brand-brown sm:text-3xl">Admin Dashboard</h1>
          <p className="max-w-3xl text-base text-brand-brown/75">
            CollEco Travel Platform Administration
          </p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Users}
            label="Total Users"
            value={stats.totalUsers.toLocaleString()}
            change="+12%"
            positive
          />
          <StatCard
            icon={Package}
            label="Active Packages"
            value={stats.activePackages.toString()}
            change="+8%"
            positive
          />
          <StatCard
            icon={DollarSign}
            label="Revenue (Month)"
            value={`R ${stats.monthRevenue.toLocaleString()}`}
            change="+15%"
            positive
          />
          <StatCard
            icon={TrendingUp}
            label="Bookings"
            value={stats.totalBookings.toString()}
            change="+23%"
            positive
          />
        </div>

        {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Quick Actions */}
          <div className="rounded-xl border border-cream-border bg-white/80 p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-brand-brown">
                Quick Actions
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <ActionButton
                  icon={Users}
                  label="Manage Users"
                  to="/admin/users"
                />
                <ActionButton
                  icon={Package}
                  label="Manage Packages"
                  to="/admin/listings"
                />
                <ActionButton
                  icon={Shield}
                  label="Security Settings"
                  to="/admin/compliance"
                />
                <ActionButton
                  icon={Settings}
                  label="Platform Settings"
                  to="/admin/settings"
                />
              </div>
            </div>

          {/* Recent Activity */}
          <div className="rounded-xl border border-cream-border bg-white/80 p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-brand-brown">
                Recent Activity
              </h2>
              <div className="space-y-3">
                <ActivityItem
                  title="New user registration"
                  time="2 minutes ago"
                  type="user"
                />
                <ActivityItem
                  title="Package created: Cape Town Adventure"
                  time="15 minutes ago"
                  type="package"
                />
                <ActivityItem
                  title="Booking completed: Safari Experience"
                  time="1 hour ago"
                  type="booking"
                />
                <ActivityItem
                  title="Partner verified: Luxury Lodges SA"
                  time="2 hours ago"
                  type="partner"
                />
              </div>
            </div>
          </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Gamification Widget */}
          <GamificationWidget />

          {/* System Status */}
          <div className="rounded-xl border border-cream-border bg-white/80 p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-brand-brown">
                System Status
              </h2>
              <div className="space-y-3">
                <StatusItem label="API Status" status="operational" />
                <StatusItem label="Payment Gateway" status="operational" />
                <StatusItem label="Email Service" status="operational" />
                <StatusItem label="Database" status="operational" />
              </div>
            </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-cream-border pt-6 text-sm text-brand-brown/70">
        <p>© CollEco Travel – The Odyssey of Adventure</p>
        <div className="mt-2 flex flex-wrap gap-3 text-xs">
          <NavLink to="/legal/privacy" className="hover:text-brand-brown">Privacy Policy</NavLink>
          <NavLink to="/legal/terms" className="hover:text-brand-brown">Terms</NavLink>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, change, positive: _positive }) {
  return (
    <div className="rounded-2xl border border-cream-border bg-white/85 p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-orange/10">
          <Icon className="h-6 w-6 text-brand-orange" />
        </div>
        {change && (
          <span className="text-sm font-medium text-brand-brown/60">
            {change}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-brand-brown">{value}</p>
        <p className="text-sm text-brand-brown/70">{label}</p>
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, to }) {
  return (
    <NavLink
      to={to}
      className="flex items-center gap-3 rounded-lg border border-cream-border bg-white p-4 text-left transition-all hover:border-brand-orange hover:bg-brand-orange/5"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-orange/10">
        <Icon className="h-5 w-5 text-brand-orange" />
      </div>
      <span className="font-medium text-brand-brown">{label}</span>
    </NavLink>
  );
}

function ActivityItem({ title, time, type: _type }) {
  return (
    <div className="flex items-start gap-3 border-b border-cream-border pb-3 last:border-0 last:pb-0">
      <div className="mt-1 h-2 w-2 rounded-full bg-brand-orange"></div>
      <div className="flex-1">
        <p className="text-sm font-medium text-brand-brown">{title}</p>
        <p className="text-xs text-brand-brown/60">{time}</p>
      </div>
    </div>
  );
}

function StatusItem({ label, status }) {
  const isOperational = status === 'operational';
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-brand-brown">{label}</span>
      <span
        className={`rounded-full px-2 py-1 text-xs font-medium ${
          isOperational
            ? 'bg-cream-sand text-brand-brown'
            : 'bg-brand-orange/10 text-brand-orange'
        }`}
      >
        {isOperational ? 'Operational' : 'Down'}
      </span>
    </div>
  );
}
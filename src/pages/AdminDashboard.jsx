import React from "react";
import { BarChart3, Users, Package, DollarSign, TrendingUp, Shield, Settings } from "lucide-react";
import GamificationWidget from "../components/GamificationWidget";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-brown">Admin Dashboard</h1>
          <p className="mt-2 text-brand-brown/70">
            CollEco Travel Platform Administration
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Users}
            label="Total Users"
            value="1,234"
            change="+12%"
            positive
          />
          <StatCard
            icon={Package}
            label="Active Packages"
            value="56"
            change="+8%"
            positive
          />
          <StatCard
            icon={DollarSign}
            label="Revenue (Month)"
            value="$45,678"
            change="+15%"
            positive
          />
          <StatCard
            icon={TrendingUp}
            label="Bookings"
            value="234"
            change="+23%"
            positive
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Quick Actions */}
            <div className="rounded-xl border border-cream-border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-brand-brown">
                Quick Actions
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <ActionButton
                  icon={Users}
                  label="Manage Users"
                  onClick={() => console.log('Manage Users')}
                />
                <ActionButton
                  icon={Package}
                  label="Manage Packages"
                  onClick={() => console.log('Manage Packages')}
                />
                <ActionButton
                  icon={Shield}
                  label="Security Settings"
                  onClick={() => console.log('Security')}
                />
                <ActionButton
                  icon={Settings}
                  label="Platform Settings"
                  onClick={() => console.log('Settings')}
                />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-xl border border-cream-border bg-white p-6 shadow-sm">
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
            <div className="rounded-xl border border-cream-border bg-white p-6 shadow-sm">
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
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, change, positive }) {
  return (
    <div className="rounded-xl border border-cream-border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-orange/10">
          <Icon className="h-6 w-6 text-brand-orange" />
        </div>
        {change && (
          <span
            className={`text-sm font-medium ${
              positive ? 'text-green-600' : 'text-red-600'
            }`}
          >
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

function ActionButton({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg border border-cream-border bg-white p-4 text-left transition-all hover:border-brand-orange hover:bg-brand-orange/5"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-orange/10">
        <Icon className="h-5 w-5 text-brand-orange" />
      </div>
      <span className="font-medium text-brand-brown">{label}</span>
    </button>
  );
}

function ActivityItem({ title, time, type }) {
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
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        }`}
      >
        {isOperational ? 'Operational' : 'Down'}
      </span>
    </div>
  );
}
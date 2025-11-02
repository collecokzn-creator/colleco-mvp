// --- COMPLIANCE & DATA HANDLING STUBS ---
// --- API-FIRST DESIGN ---
// Example: import { getAuditLogs, approvePartner } from '../api/admin'
// Use modular API calls for admin console features (audit logs, partner approval, analytics).
// Admin Console: Monitor compliance, approve/flag partners, manage payouts, view audit logs.
// Audit Logging: All admin actions should be logged for transparency.
// GDPR/POPI: Ensure all partner/client data is handled securely and with consent.
// Future: Add analytics for compliance status and audit log export.

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Users, FileText, Settings, ShieldCheck, MessageSquare } from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: BarChart3 },
  { name: "Partners", icon: Users },
  { name: "Bookings", icon: FileText },
  { name: "Compliance", icon: ShieldCheck },
  { name: "AI Assistant", icon: MessageSquare },
  { name: "Settings", icon: Settings },
];

// ---------------- Trip Assist Pro Component ----------------
const TripAssistPro = () => (
  <div className="bg-white border rounded-lg shadow p-4 h-full flex flex-col">
    <h2 className="text-xl font-semibold text-brand-brown mb-3">Trip Assist Pro</h2>
    <iframe
      src="/trip-assist-widget"
      className="flex-grow rounded border"
      title="AI Admin Assistant"
    />
  </div>
);

// ---------------- Admin Console Page ----------------
const AdminConsole = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 80 }}
        className="bg-cream-sand text-brand-brown flex flex-col transition-all duration-300 shadow-xl border-r border-cream-border"
      >
        <div className="flex items-center justify-between p-4">
          <h1 className={`text-lg font-bold transition-all ${!sidebarOpen && "hidden"}`}>
            CollEco Admin
          </h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-brand-brown hover:text-yellow-600"
          >
            {sidebarOpen ? "←" : "→"}
          </button>
        </div>
        <nav className="mt-6 flex-1 space-y-1">
          {menuItems.map(({ name, icon: Icon }) => (
            <button
              key={name}
              onClick={() => setActiveTab(name)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition font-semibold ${
                activeTab === name
                  ? "bg-brand-orange text-white shadow-md ring-2 ring-brand-orange"
                  : "hover:bg-cream-hover text-brand-brown"
              }`}
            >
              <Icon size={20} />
              {sidebarOpen && <span>{name}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 text-xs text-brand-brown/70">
          © {new Date().getFullYear()} CollEco Travel
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6">
        <AnimatePresence mode="wait">
          {activeTab === "Dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-semibold text-brand-brown">Dashboard Overview</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <StatCard label="Total Bookings" value="1,248" />
                <StatCard label="Active Partners" value="128" />
                <StatCard label="Pending Approvals" value="6" />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <ChartPlaceholder title="Revenue Overview" />
                <ChartPlaceholder title="Booking Trends" />
              </div>
            </motion.div>
          )}

          {activeTab === "Partners" && (
            <motion.div key="partners" {...fadeMotion}>
              <h2 className="text-2xl font-semibold text-brand-brown mb-4">Partners</h2>
              <div className="bg-white rounded-lg shadow p-4">
                <p>View and manage partner listings, tiers, and performance here.</p>
              </div>
            </motion.div>
          )}

          {activeTab === "Bookings" && (
            <motion.div key="bookings" {...fadeMotion}>
              <h2 className="text-2xl font-semibold text-brand-brown mb-4">Bookings</h2>
              <div className="bg-white rounded-lg shadow p-4">
                <p>All active, pending, and completed bookings appear here.</p>
              </div>
            </motion.div>
          )}

          {activeTab === "Compliance" && (
            <motion.div key="compliance" {...fadeMotion}>
              <h2 className="text-2xl font-semibold text-brand-brown mb-4">Compliance Monitor</h2>
              <div className="bg-white rounded-lg shadow p-4">
                <p>Monitor partner documentation, expiry dates, and safety status.</p>
              </div>
            </motion.div>
          )}

          {activeTab === "AI Assistant" && (
            <motion.div key="ai" {...fadeMotion}>
              <TripAssistPro />
            </motion.div>
          )}

          {activeTab === "Settings" && (
            <motion.div key="settings" {...fadeMotion}>
              <h2 className="text-2xl font-semibold text-brand-brown mb-4">System Settings</h2>
              <div className="bg-white rounded-lg shadow p-4">
                <p>Configure app preferences, access levels, and brand settings.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

// ---------------- Helper Components ----------------
const fadeMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const StatCard = ({ label, value }) => (
  <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
    <p className="text-gray-500 text-sm">{label}</p>
    <p className="text-3xl font-bold text-brand-brown mt-1">{value}</p>
  </div>
);

const ChartPlaceholder = ({ title }) => (
  <div className="bg-white rounded-lg shadow p-6 text-center text-gray-400 border-dashed border-2 border-gray-200">
    <p className="text-gray-700 font-medium mb-2">{title}</p>
    <p>Chart Placeholder — connect analytics later</p>
  </div>
);

export default AdminConsole;

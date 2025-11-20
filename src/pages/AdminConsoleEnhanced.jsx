import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ActivityFeed from "../components/ActivityFeed";
import InsightsPanel from "../components/InsightsPanel";
import { FileText, UserCheck, CheckCircle, DollarSign } from "lucide-react";
import { useAnimation } from "framer-motion";

const MENU = [
  { key: "dashboard", roles: ["admin", "manager"] },
  { key: "partners", roles: ["admin"] },
  { key: "bookings", roles: ["admin", "agent"] },
  { key: "compliance", roles: ["admin", "compliance"] },
  { key: "ai", roles: ["admin"] },
  { key: "settings", roles: ["admin"] },
];

export default function AdminConsoleEnhanced({ user, stats, bookings, partners }) {
  const [active] = useState("dashboard");
  const [alerts, setAlerts] = useState([]);
  const [loading] = useState(false);

  const confirmBooking = (_id) => {
    // Confirm booking logic
  };

  const approvePartner = (_id) => {
    // Approve partner logic
  };

  return (
    <div className="min-h-screen bg-cream p-4">
      <main className="flex-1 bg-cream-sand rounded-2xl shadow-md p-6 border border-cream-border">
        <div className="flex items-center gap-4 mb-6">
          <div className="text-right">
            <div className="text-sm font-medium text-brand-russty">{user.name}</div>
            <div className="text-xs text-brand-russty/60">{user.email}</div>
          </div>
        </div>
        {/* Main panel content, AnimatePresence, etc. goes here... */}
      </main>

      <AnimatePresence mode="wait">
        {/* Only render allowed modules for user.role */}
        {active === "dashboard" && MENU.find(m => m.key === "dashboard" && m.roles.includes(user.role)) && (
          <motion.section key="dashboard" {...pageAnim}>
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <StatCard label="Total Bookings" value={loading ? "..." : stats.bookings} />
              <StatCard label="Active Partners" value={loading ? "..." : stats.partners} />
              <StatCard label="Pending Approvals" value={loading ? "..." : stats.pendingApprovals} />
              <StatCard label="Revenue (est.)" value={loading ? "..." : stats.revenue} />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Panel title="Recent Bookings">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500">
                      <th className="py-2">ID</th>
                      <th>Guest</th>
                      <th>Property</th>
                      <th>Status</th>
                      <th>Total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(bookings || []).slice(0, 6).map((b) => (
                      <tr key={b.id} className="border-t">
                        <td className="py-2">{b.id}</td>
                        <td>{b.guest}</td>
                        <td>{b.property}</td>
                        <td>
                          <span className={`text-xs px-2 py-1 rounded ${b.status === "confirmed" ? "bg-cream-sand text-brand-brown" : "bg-amber-100 text-brand-russty"}`}>
                            {b.status}
                          </span>
                        </td>
                        <td>{b.total}</td>
                        <td className="text-right">
                          {b.status !== "confirmed" && (
                            <button onClick={() => confirmBooking(b.id)} className="text-xs px-2 py-1 rounded bg-brand-orange text-white hover:bg-brand-orange/90">Confirm</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Panel>

              <Panel title="Compliance Alerts">
                <div className="text-xs text-gray-400">No compliance alerts.</div>
              </Panel>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <ActivityFeed />
              <InsightsPanel />
            </div>
          </motion.section>
        )}

        {active === "partners" && MENU.find(m => m.key === "partners" && m.roles.includes(user.role)) && (
          <motion.section key="partners" {...pageAnim}>
            <h2 className="text-lg font-semibold text-brand-russty mb-3">Partners</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {partners.map((p) => (
                <div key={p.id} className="bg-white p-4 rounded shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-gray-500">Tier: {p.tier}</div>
                      <div className="text-xs text-gray-500">Last Verified: {p.lastVerified ?? "—"}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm px-2 py-1 rounded ${p.status === "active" ? "bg-cream-sand text-brand-brown" : "bg-amber-100 text-brand-russty"}`}>
                        {p.status}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    {p.status !== "active" && (
                      <button onClick={() => approvePartner(p.id)} className="px-3 py-1 rounded bg-brand-orange text-white text-sm hover:bg-brand-orange/90">Approve</button>
                    )}
                    <button onClick={() => setAlerts((a) => [...a, { id: Date.now(), text: `Requested details for ${p.name}` }])} className="px-3 py-1 rounded border text-sm">Request Info</button>
                    <button onClick={() => setAlerts((a) => [...a, { id: Date.now(), text: `Opened partner profile ${p.name}` }])} className="px-3 py-1 rounded bg-white text-sm">Open</button>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {active === "bookings" && MENU.find(m => m.key === "bookings" && m.roles.includes(user.role)) && (
          <motion.section key="bookings" {...pageAnim}>
            <h2 className="text-lg font-semibold text-brand-russty mb-3">Bookings</h2>

            <div className="bg-white rounded shadow p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500">
                    <th className="py-2">Booking</th>
                    <th>Guest</th>
                    <th>Property</th>
                    <th>Check-in</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-t">
                      <td className="py-2">{b.id}</td>
                      <td>{b.guest}</td>
                      <td>{b.property}</td>
                      <td>{b.checkin}</td>
                      <td>
                        <span className={`text-xs px-2 py-1 rounded ${b.status === "confirmed" ? "bg-cream-sand text-brand-brown" : "bg-amber-100 text-brand-russty"}`}>
                          {b.status}
                        </span>
                      </td>
                      <td>{b.total}</td>
                      <td className="text-right">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => confirmBooking(b.id)} className="text-xs px-2 py-1 rounded bg-brand-orange text-white hover:bg-brand-orange/90">Confirm</button>
                          <button onClick={() => setAlerts((a) => [...a, { id: Date.now(), text: `Viewing booking ${b.id}` }])} className="text-xs px-2 py-1 rounded border">View</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.section>
        )}

        {active === "compliance" && MENU.find(m => m.key === "compliance" && m.roles.includes(user.role)) && (
          <motion.section key="compliance" {...pageAnim}>
            <h2 className="text-lg font-semibold text-brand-russty mb-3">Compliance Monitor</h2>
            <div className="bg-white rounded shadow p-4">
              <div className="text-xs text-gray-400">No compliance data available.</div>
            </div>
          </motion.section>
        )}

        {active === "ai" && MENU.find(m => m.key === "ai" && m.roles.includes(user.role)) && (
          <motion.section key="ai" {...pageAnim}>
            <h2 className="text-lg font-semibold text-brand-russty mb-3">Trip Assist Pro (Admin)</h2>
            <div className="bg-white rounded shadow p-4 h-96">
              <iframe src="/trip-assist-widget" title="Trip Assist Pro" className="w-full h-full border rounded" />
            </div>
          </motion.section>
        )}

        {active === "settings" && MENU.find(m => m.key === "settings" && m.roles.includes(user.role)) && (
          <motion.section key="settings" {...pageAnim}>
            <h2 className="text-lg font-semibold text-brand-russty mb-3">Settings</h2>
            <div className="bg-white rounded shadow p-4">
              <p className="text-sm text-gray-600">System settings, integrations, and access control will live here.</p>
              <div className="mt-4 grid md:grid-cols-2 gap-3">
                <div className="border rounded p-3">
                  <div className="text-xs text-gray-500">API Keys</div>
                  <div className="mt-2 text-sm">Manage partner API credentials</div>
                </div>
                <div className="border rounded p-3">
                  <div className="text-xs text-gray-500">Roles & Access</div>
                  <div className="mt-2 text-sm">Create roles (admin, partner, agent, client)</div>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Alerts area */}
      <div className="fixed right-6 bottom-6 space-y-2 w-80 z-50">
        {alerts.map((a) => (
          <div key={a.id} className="bg-white rounded shadow p-3 text-sm">
            {a.text}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- small helper components & styles ---------- */

const pageAnim = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const statIcons = {
  "Total Bookings": <FileText className="text-blue-400" size={28} />,
  "Active Partners": <UserCheck className="text-green-400" size={28} />,
  "Pending Approvals": <CheckCircle className="text-yellow-400" size={28} />,
  "Revenue (est.)": <DollarSign className="text-emerald-400" size={28} />,
};

function StatCard({ label, value }) {
  const controls = useAnimation();
  const prevValue = useRef(value);
  useEffect(() => {
    if (typeof value === "number" && prevValue.current !== value) {
      controls.start({
        number: value,
        transition: { duration: 1, ease: "easeOut" },
      });
      prevValue.current = value;
    }
  }, [value, controls]);

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center gap-2 border-t-4" style={{ borderTopColor: label === "Total Bookings" ? '#60a5fa' : label === "Active Partners" ? '#34d399' : label === "Pending Approvals" ? '#fbbf24' : '#10b981' }}>
      <div>{statIcons[label]}</div>
      <motion.div
  className="text-2xl font-bold text-brand-russty"
        animate={controls}
        initial={{ number: typeof value === "number" ? value : 0 }}
      >
        {typeof value === "number" ? Math.round(value) : value}
      </motion.div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="bg-white rounded shadow p-4">
      <div className="flex items-center justify-between mb-3">
  <h3 className="font-medium text-sm text-brand-russty">{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );
}

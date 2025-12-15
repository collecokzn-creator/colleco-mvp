import { j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { G as GamificationWidget } from "./GamificationWidget-C6rM1rFK.js";
import { U as Users, P as Package, a as DollarSign, T as TrendingUp, S as Shield, c as Settings } from "./icons-C4AMPM7L.js";
import "./react-4gMnsuNC.js";
import "./gamificationEngine-BquAD8q6.js";
import "./index-DlOecmR0.js";
import "./pdf-DKpnIAzb.js";
function AdminDashboard() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-brand-brown", children: "Admin Dashboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-brand-brown/70", children: "CollEco Travel Platform Administration" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        StatCard,
        {
          icon: Users,
          label: "Total Users",
          value: "1,234",
          change: "+12%",
          positive: true
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        StatCard,
        {
          icon: Package,
          label: "Active Packages",
          value: "56",
          change: "+8%",
          positive: true
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        StatCard,
        {
          icon: DollarSign,
          label: "Revenue (Month)",
          value: "$45,678",
          change: "+15%",
          positive: true
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        StatCard,
        {
          icon: TrendingUp,
          label: "Bookings",
          value: "234",
          change: "+23%",
          positive: true
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 lg:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-cream-border bg-white p-6 shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-4 text-xl font-semibold text-brand-brown", children: "Quick Actions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ActionButton,
              {
                icon: Users,
                label: "Manage Users",
                onClick: () => console.log("Manage Users")
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ActionButton,
              {
                icon: Package,
                label: "Manage Packages",
                onClick: () => console.log("Manage Packages")
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ActionButton,
              {
                icon: Shield,
                label: "Security Settings",
                onClick: () => console.log("Security")
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ActionButton,
              {
                icon: Settings,
                label: "Platform Settings",
                onClick: () => console.log("Settings")
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-cream-border bg-white p-6 shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-4 text-xl font-semibold text-brand-brown", children: "Recent Activity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ActivityItem,
              {
                title: "New user registration",
                time: "2 minutes ago",
                type: "user"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ActivityItem,
              {
                title: "Package created: Cape Town Adventure",
                time: "15 minutes ago",
                type: "package"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ActivityItem,
              {
                title: "Booking completed: Safari Experience",
                time: "1 hour ago",
                type: "booking"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ActivityItem,
              {
                title: "Partner verified: Luxury Lodges SA",
                time: "2 hours ago",
                type: "partner"
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(GamificationWidget, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-cream-border bg-white p-6 shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-4 text-xl font-semibold text-brand-brown", children: "System Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusItem, { label: "API Status", status: "operational" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusItem, { label: "Payment Gateway", status: "operational" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusItem, { label: "Email Service", status: "operational" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusItem, { label: "Database", status: "operational" })
          ] })
        ] })
      ] })
    ] })
  ] }) });
}
function StatCard({ icon: Icon, label, value, change, positive }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-cream-border bg-white p-6 shadow-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-lg bg-brand-orange/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-6 w-6 text-brand-orange" }) }),
      change && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          className: `text-sm font-medium ${positive ? "text-green-600" : "text-red-600"}`,
          children: change
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-brand-brown", children: value }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown/70", children: label })
    ] })
  ] });
}
function ActionButton({ icon: Icon, label, onClick }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      onClick,
      className: "flex items-center gap-3 rounded-lg border border-cream-border bg-white p-4 text-left transition-all hover:border-brand-orange hover:bg-brand-orange/5",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-brand-orange/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5 text-brand-orange" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-brand-brown", children: label })
      ]
    }
  );
}
function ActivityItem({ title, time, type }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 border-b border-cream-border pb-3 last:border-0 last:pb-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 h-2 w-2 rounded-full bg-brand-orange" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-brand-brown", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-brand-brown/60", children: time })
    ] })
  ] });
}
function StatusItem({ label, status }) {
  const isOperational = status === "operational";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-brand-brown", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        className: `rounded-full px-2 py-1 text-xs font-medium ${isOperational ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`,
        children: isOperational ? "Operational" : "Down"
      }
    )
  ] });
}
export {
  AdminDashboard as default
};
//# sourceMappingURL=AdminDashboard-1Z2eU-yc.js.map

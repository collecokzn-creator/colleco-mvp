import { j as jsxRuntimeExports, r as reactExports, A as AnimatePresence, m as motion, u as useAnimation } from "./motion-D9fZRtSt.js";
import { a as DollarSign, a4 as CheckCircle, ax as UserCheck, b as FileText } from "./icons-C4AMPM7L.js";
import "./react-4gMnsuNC.js";
const mockFeed = [
  { id: 1, type: "Partner", message: "Beekman Holiday added 3 new units.", time: "2m ago" },
  { id: 2, type: "Booking", message: "Nomsa Dlamini confirmed booking for Umhlanga Sands.", time: "10m ago" },
  { id: 3, type: "Compliance", message: "Margate Retreats missing COI document.", time: "1h ago" }
];
const typeColors = {
  Partner: "bg-brand-gold text-brand-russty",
  Booking: "bg-brand-orange text-white",
  Compliance: "bg-cream-hover text-brand-russty"
};
const ActivityFeed = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl shadow-md p-4", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-lg text-brand-russty mb-3", children: "Activity Feed" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-3", children: mockFeed.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-3 py-1 rounded-xl text-xs font-bold ${typeColors[item.type]}`, children: item.type }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-brand-russty flex-1", children: item.message }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-brand-russty opacity-50", children: item.time })
  ] }, item.id)) })
] });
const mockInsights = [
  {
    id: 1,
    title: "Top-Selling Destination",
    detail: "Durban Beach Resort (+12% growth)",
    highlight: true
  },
  {
    id: 2,
    title: "Smart Alert",
    detail: "3 partner listings need compliance updates.",
    highlight: false
  }
];
const InsightsPanel = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl shadow-md p-4", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-lg text-brand-orange mb-3", children: "AI Insights" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-3", children: mockInsights.map((insight) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: `p-3 rounded-xl ${insight.highlight ? "bg-brand-gold text-brand-orange font-bold" : "bg-brand-gold/10 text-brand-gold"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm", children: insight.title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs opacity-80", children: insight.detail })
  ] }, insight.id)) })
] });
const MENU = [
  { key: "dashboard", roles: ["admin", "manager"] },
  { key: "partners", roles: ["admin"] },
  { key: "bookings", roles: ["admin", "agent"] },
  { key: "compliance", roles: ["admin", "compliance"] },
  { key: "ai", roles: ["admin"] },
  { key: "settings", roles: ["admin"] }
];
function AdminConsoleEnhanced({ user, stats, bookings, partners }) {
  const [active] = reactExports.useState("dashboard");
  const [alerts, setAlerts] = reactExports.useState([]);
  const [loading] = reactExports.useState(false);
  const confirmBooking = (_id) => {
  };
  const approvePartner = (_id) => {
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-cream p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 bg-cream-sand rounded-2xl shadow-md p-6 border border-cream-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-4 mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium text-brand-russty", children: user.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-brand-russty/60", children: user.email })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(AnimatePresence, { mode: "wait", children: [
      active === "dashboard" && MENU.find((m) => m.key === "dashboard" && m.roles.includes(user.role)) && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.section, { ...pageAnim, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-4 gap-4 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Total Bookings", value: loading ? "..." : stats.bookings }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Active Partners", value: loading ? "..." : stats.partners }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Pending Approvals", value: loading ? "..." : stats.pendingApprovals }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Revenue (est.)", value: loading ? "..." : stats.revenue })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Recent Bookings", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-left text-xs text-gray-500", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2", children: "ID" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Guest" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Property" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Total" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", {})
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: (bookings || []).slice(0, 6).map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2", children: b.id }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: b.guest }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: b.property }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-2 py-1 rounded ${b.status === "confirmed" ? "bg-cream-sand text-brand-brown" : "bg-amber-100 text-brand-russty"}`, children: b.status }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: b.total }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-right", children: b.status !== "confirmed" && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => confirmBooking(b.id), className: "text-xs px-2 py-1 rounded bg-brand-orange text-white hover:bg-brand-highlight", children: "Confirm" }) })
            ] }, b.id)) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Compliance Alerts", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-400", children: "No compliance alerts." }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-4 mt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ActivityFeed, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(InsightsPanel, {})
        ] })
      ] }, "dashboard"),
      active === "partners" && MENU.find((m) => m.key === "partners" && m.roles.includes(user.role)) && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.section, { ...pageAnim, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-brand-russty mb-3", children: "Partners" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid md:grid-cols-2 gap-4", children: partners.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded shadow", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: p.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gray-500", children: [
                "Tier: ",
                p.tier
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gray-500", children: [
                "Last Verified: ",
                p.lastVerified ?? "—"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-sm px-2 py-1 rounded ${p.status === "active" ? "bg-cream-sand text-brand-brown" : "bg-amber-100 text-brand-russty"}`, children: p.status }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex gap-2", children: [
            p.status !== "active" && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => approvePartner(p.id), className: "px-3 py-1 rounded bg-brand-orange text-white text-sm hover:bg-brand-highlight", children: "Approve" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setAlerts((a) => [...a, { id: Date.now(), text: `Requested details for ${p.name}` }]), className: "px-3 py-1 rounded border text-sm", children: "Request Info" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setAlerts((a) => [...a, { id: Date.now(), text: `Opened partner profile ${p.name}` }]), className: "px-3 py-1 rounded bg-white text-sm", children: "Open" })
          ] })
        ] }, p.id)) })
      ] }, "partners"),
      active === "bookings" && MENU.find((m) => m.key === "bookings" && m.roles.includes(user.role)) && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.section, { ...pageAnim, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-brand-russty mb-3", children: "Bookings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded shadow p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-left text-xs text-gray-500", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2", children: "Booking" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Guest" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Property" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Check-in" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", {})
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: bookings.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2", children: b.id }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: b.guest }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: b.property }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: b.checkin }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-2 py-1 rounded ${b.status === "confirmed" ? "bg-cream-sand text-brand-brown" : "bg-amber-100 text-brand-russty"}`, children: b.status }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: b.total }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 justify-end", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => confirmBooking(b.id), className: "text-xs px-2 py-1 rounded bg-brand-orange text-white hover:bg-brand-highlight", children: "Confirm" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setAlerts((a) => [...a, { id: Date.now(), text: `Viewing booking ${b.id}` }]), className: "text-xs px-2 py-1 rounded border", children: "View" })
            ] }) })
          ] }, b.id)) })
        ] }) })
      ] }, "bookings"),
      active === "compliance" && MENU.find((m) => m.key === "compliance" && m.roles.includes(user.role)) && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.section, { ...pageAnim, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-brand-russty mb-3", children: "Compliance Monitor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded shadow p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-400", children: "No compliance data available." }) })
      ] }, "compliance"),
      active === "ai" && MENU.find((m) => m.key === "ai" && m.roles.includes(user.role)) && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.section, { ...pageAnim, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-brand-russty mb-3", children: "Trip Assist Pro (Admin)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded shadow p-4 h-96", children: /* @__PURE__ */ jsxRuntimeExports.jsx("iframe", { src: "/trip-assist-widget", title: "Trip Assist Pro", className: "w-full h-full border rounded" }) })
      ] }, "ai"),
      active === "settings" && MENU.find((m) => m.key === "settings" && m.roles.includes(user.role)) && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.section, { ...pageAnim, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-brand-russty mb-3", children: "Settings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded shadow p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "System settings, integrations, and access control will live here." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid md:grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-500", children: "API Keys" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-sm", children: "Manage partner API credentials" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-500", children: "Roles & Access" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-sm", children: "Create roles (admin, partner, agent, client)" })
            ] })
          ] })
        ] })
      ] }, "settings")
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed right-6 bottom-6 space-y-2 w-80 z-50", children: alerts.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded shadow p-3 text-sm", children: a.text }, a.id)) })
  ] });
}
const pageAnim = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 }
};
const statIcons = {
  "Total Bookings": /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "text-blue-400", size: 28 }),
  "Active Partners": /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "text-green-400", size: 28 }),
  "Pending Approvals": /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "text-yellow-400", size: 28 }),
  "Revenue (est.)": /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "text-emerald-400", size: 28 })
};
function StatCard({ label, value }) {
  const controls = useAnimation();
  const prevValue = reactExports.useRef(value);
  reactExports.useEffect(() => {
    if (typeof value === "number" && prevValue.current !== value) {
      controls.start({
        number: value,
        transition: { duration: 1, ease: "easeOut" }
      });
      prevValue.current = value;
    }
  }, [value, controls]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow p-4 flex flex-col items-center gap-2 border-t-4", style: { borderTopColor: label === "Total Bookings" ? "#60a5fa" : label === "Active Partners" ? "#34d399" : label === "Pending Approvals" ? "#fbbf24" : "#10b981" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: statIcons[label] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        className: "text-2xl font-bold text-brand-russty",
        animate: controls,
        initial: { number: typeof value === "number" ? value : 0 },
        children: typeof value === "number" ? Math.round(value) : value
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-500 mt-1", children: label })
  ] });
}
function Panel({ title, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded shadow p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-sm text-brand-russty", children: title }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children })
  ] });
}
export {
  AdminConsoleEnhanced as default
};
//# sourceMappingURL=AdminConsoleEnhanced-DH_Y6AJ7.js.map

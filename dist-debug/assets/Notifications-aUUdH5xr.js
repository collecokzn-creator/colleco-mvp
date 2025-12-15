import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import "./react-4gMnsuNC.js";
function Notifications() {
  const [alerts, setAlerts] = reactExports.useState([]);
  reactExports.useEffect(() => {
    const savedAlerts = localStorage.getItem("colleco.alerts");
    if (savedAlerts) {
      setAlerts(JSON.parse(savedAlerts));
    } else {
      setAlerts([
        {
          id: 1,
          type: "success",
          title: "Booking Confirmed",
          message: "Your flight to Johannesburg has been confirmed!",
          timestamp: Date.now() - 72e5,
          read: false
        },
        {
          id: 2,
          type: "warning",
          title: "Price Drop Alert",
          message: "The package you viewed dropped by 15%!",
          timestamp: Date.now() - 36e5,
          read: false
        },
        {
          id: 3,
          type: "info",
          title: "Booking Reminder",
          message: "Your trip to Cape Town is in 3 days.",
          timestamp: Date.now() - 18e5,
          read: true
        }
      ]);
    }
  }, []);
  function markAsRead(id) {
    setAlerts((prev) => {
      const updated = prev.map(
        (alert) => alert.id === id ? { ...alert, read: true } : alert
      );
      localStorage.setItem("colleco.alerts", JSON.stringify(updated));
      return updated;
    });
  }
  function clearAll() {
    setAlerts([]);
    localStorage.removeItem("colleco.alerts");
  }
  const unreadCount = alerts.filter((a) => !a.read).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto max-w-4xl mx-auto p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold", children: "Notifications" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 items-center", children: [
        unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "bg-brand-russty text-white text-xs font-bold px-2 py-1 rounded-full", children: [
          unreadCount,
          " new"
        ] }),
        alerts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: clearAll,
            className: "text-sm text-brand-russty hover:underline",
            children: "Clear All"
          }
        )
      ] })
    ] }),
    alerts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl border shadow-sm p-8 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500", children: "No notifications yet. We'll notify you about important updates!" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: alerts.map((alert) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `bg-white rounded-xl border shadow-sm p-4 transition ${alert.read ? "opacity-60" : ""}`,
        onClick: () => !alert.read && markAsRead(alert.id),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-2 h-2 rounded-full ${alert.type === "success" ? "bg-cream-sand" : alert.type === "warning" ? "bg-amber-100" : alert.type === "error" ? "bg-brand-russty" : "bg-brand-orange"}` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: alert.title })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 text-sm mb-2", children: alert.message }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: new Date(alert.timestamp).toLocaleString() })
          ] }),
          !alert.read && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => markAsRead(alert.id),
              className: "text-xs text-brand-orange hover:underline ml-4",
              children: "Mark as read"
            }
          )
        ] })
      },
      alert.id
    )) })
  ] }) });
}
export {
  Notifications as default
};
//# sourceMappingURL=Notifications-aUUdH5xr.js.map

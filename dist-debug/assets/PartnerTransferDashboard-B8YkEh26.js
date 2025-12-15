import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { F as Footer } from "./Footer-ByqUfdvj.js";
import "./react-4gMnsuNC.js";
function PartnerTransferDashboard() {
  const [requests, setRequests] = reactExports.useState([]);
  const [activeRequest, setActiveRequest] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(false);
  reactExports.useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 5e3);
    return () => clearInterval(interval);
  }, []);
  async function loadRequests() {
    try {
      const res = await fetch("/api/transfers/requests");
      const data = await res.json();
      if (data.ok) {
        setRequests(data.requests || []);
      }
    } catch (e) {
      console.error("[partner] load requests failed", e);
    }
  }
  async function acceptRequest(requestId) {
    setLoading(true);
    try {
      const res = await fetch(`/api/transfers/request/${requestId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driver: {
            name: "Your Name",
            // Would come from partner profile
            vehicle: "Toyota Quantum",
            plate: "ABC 123 GP",
            eta: "10 min"
          }
        })
      });
      const data = await res.json();
      if (data.ok) {
        setActiveRequest(data.request);
        loadRequests();
      }
    } catch (e) {
      console.error("[partner] accept failed", e);
    } finally {
      setLoading(false);
    }
  }
  async function updateStatus(requestId, status) {
    try {
      const res = await fetch(`/api/transfers/request/${requestId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.ok) {
        setActiveRequest(data.request);
        if (status === "completed") {
          setActiveRequest(null);
        }
        loadRequests();
      }
    } catch (e) {
      console.error("[partner] status update failed", e);
    }
  }
  const pendingRequests = requests.filter((r) => r.status === "searching" || r.status === "matched");
  const myActiveRequests = requests.filter(
    (r) => r.status === "accepted" || r.status === "en-route" || r.status === "arrived"
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold mb-6 text-brand-brown", children: "Partner Transfer Dashboard" }),
    activeRequest && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 p-6 bg-cream-sand border-2 border-brand-orange rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold mb-4 text-brand-brown", children: "🚗 Active Trip" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Pickup" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: activeRequest.pickup })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Dropoff" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: activeRequest.dropoff })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Passengers" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: activeRequest.pax })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Price" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold", children: [
            "R",
            activeRequest.price
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 mt-4", children: [
        activeRequest.status === "accepted" && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => updateStatus(activeRequest.id, "en-route"),
            className: "px-4 py-2 bg-brand-orange text-white rounded font-semibold hover:bg-brand-gold",
            children: "Start Journey"
          }
        ),
        activeRequest.status === "en-route" && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => updateStatus(activeRequest.id, "arrived"),
            className: "px-4 py-2 bg-brand-orange text-white rounded font-semibold hover:bg-brand-gold",
            children: "Mark as Arrived"
          }
        ),
        activeRequest.status === "arrived" && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => updateStatus(activeRequest.id, "completed"),
            className: "px-4 py-2 bg-gray-600 text-white rounded font-semibold hover:bg-gray-700",
            children: "Complete Trip"
          }
        )
      ] })
    ] }),
    myActiveRequests.length > 0 && !activeRequest && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold mb-4 text-brand-brown", children: "My Active Requests" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: myActiveRequests.map((req) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 bg-white border rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold", children: [
            req.pickup,
            " → ",
            req.dropoff
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
            req.pax,
            " passengers • R",
            req.price
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
            "Status: ",
            req.status
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setActiveRequest(req),
            className: "px-3 py-1 bg-brand-orange text-white text-sm rounded hover:bg-brand-gold transition",
            children: "View"
          }
        )
      ] }) }, req.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-bold mb-4 text-brand-brown", children: [
        "Incoming Requests ",
        pendingRequests.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 px-2 py-1 bg-brand-russty text-white text-sm rounded-full", children: [
          pendingRequests.length,
          " new"
        ] })
      ] }),
      pendingRequests.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 bg-gray-50 rounded-lg text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500", children: "No pending requests. We'll notify you when a customer needs a transfer." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: pendingRequests.map((req) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-white border-2 border-brand-orange rounded-lg shadow-sm hover:shadow-md transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-lg", children: req.pickup }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "↓" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-lg", children: req.dropoff })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-brand-orange", children: [
            "R",
            req.price
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 mb-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Passengers" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: req.pax })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold capitalize", children: req.bookingType })
          ] }),
          req.bookingType === "prearranged" && /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Pickup Time" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: new Date(req.date).toLocaleString() })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => acceptRequest(req.id),
              disabled: loading,
              className: "flex-1 px-4 py-2 bg-brand-orange text-white rounded font-semibold hover:bg-brand-gold disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed",
              children: "Accept"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "px-4 py-2 bg-gray-300 text-gray-700 rounded font-semibold hover:bg-gray-400",
              children: "Decline"
            }
          )
        ] }),
        req.bookingType === "instant" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-brand-russty mt-2", children: "⚡ Instant request - respond quickly!" })
      ] }, req.id)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
    ] })
  ] });
}
export {
  PartnerTransferDashboard as default
};
//# sourceMappingURL=PartnerTransferDashboard-B8YkEh26.js.map

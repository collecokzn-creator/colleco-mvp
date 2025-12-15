import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { L as Link } from "./index-DlOecmR0.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
import "./icons-C4AMPM7L.js";
function TransferHistory() {
  const [transfers, setTransfers] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [filter, setFilter] = reactExports.useState("all");
  reactExports.useEffect(() => {
    loadTransfers();
  }, []);
  async function loadTransfers() {
    try {
      const res = await fetch("/api/transfers/history");
      const data = await res.json();
      if (data.ok) {
        setTransfers(data.transfers || []);
      }
    } catch (e) {
      console.error("[history] load failed", e);
    } finally {
      setLoading(false);
    }
  }
  async function downloadReceipt(transferId) {
    try {
      const res = await fetch(`/api/transfers/request/${transferId}/receipt`);
      const data = await res.json();
      if (data.ok && data.receiptUrl) {
        window.open(data.receiptUrl, "_blank");
      }
    } catch (e) {
      console.error("[receipt] download failed", e);
    }
  }
  const filteredTransfers = filter === "all" ? transfers : transfers.filter((t) => t.status === filter);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold mb-6 text-brand-brown", children: "Transfer History" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 flex gap-2 border-b", children: ["all", "completed", "cancelled"].map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => setFilter(f),
        className: `px-4 py-2 font-semibold capitalize transition ${filter === f ? "text-brand-orange border-b-2 border-brand-orange" : "text-gray-600 hover:text-brand-brown"}`,
        children: f
      },
      f
    )) }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500", children: "Loading your transfer history..." }) }) : filteredTransfers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 bg-gray-50 rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 mb-4", children: "No transfers found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/transfers", className: "text-brand-orange hover:underline", children: "Book your first transfer →" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: filteredTransfers.map((transfer) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-white border rounded-lg hover:shadow-md transition", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-lg", children: transfer.pickup }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "↓" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-lg", children: transfer.dropoff })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-brand-brown", children: [
            "R",
            transfer.price
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block px-2 py-1 text-xs font-semibold rounded mt-1 ${transfer.status === "completed" ? "bg-cream-sand text-brand-brown" : transfer.status === "cancelled" ? "bg-amber-100 text-brand-russty" : "bg-gray-100 text-gray-800"}`, children: transfer.status })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: new Date(transfer.createdAt).toLocaleDateString() })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Time" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: new Date(transfer.createdAt).toLocaleTimeString() })
        ] }),
        transfer.driver && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Driver" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: transfer.driver.name })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Vehicle" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: transfer.driver.vehicle })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-3 border-t", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => downloadReceipt(transfer.id),
            className: "px-4 py-2 bg-gray-100 text-gray-700 rounded font-semibold hover:bg-gray-200 transition text-sm",
            children: "📄 Receipt"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: `/transfers?rebook=${transfer.id}`,
            className: "px-4 py-2 bg-brand-orange text-white rounded font-semibold hover:bg-brand-gold transition text-sm",
            children: "🔄 Book Again"
          }
        ),
        transfer.status === "completed" && !transfer.rated && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "px-4 py-2 bg-brand-orange text-white rounded font-semibold hover:bg-brand-gold transition text-sm", children: "⭐ Rate Driver" })
      ] })
    ] }, transfer.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 grid grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-blue-50 rounded-lg text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-blue-600", children: transfers.length }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Total Trips" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-green-50 rounded-lg text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-green-600", children: transfers.filter((t) => t.status === "completed").length }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Completed" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-purple-50 rounded-lg text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-3xl font-bold text-purple-600", children: [
          "R",
          transfers.reduce((sum, t) => sum + (t.price || 0), 0)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Total Spent" })
      ] })
    ] })
  ] });
}
export {
  TransferHistory as default
};
//# sourceMappingURL=TransferHistory-CODrUibK.js.map

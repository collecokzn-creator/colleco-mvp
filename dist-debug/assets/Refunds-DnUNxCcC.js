import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { R as RefundStatus } from "./EnhancementStubs-DhElvIJq.js";
import "./react-4gMnsuNC.js";
function Refunds() {
  const [refunds] = reactExports.useState([
    { id: "REF001", bookingId: "BK123", amount: 350, status: "In Review", requestedAt: Date.now() - 864e5 },
    { id: "REF002", bookingId: "BK124", amount: 1200, status: "Approved", requestedAt: Date.now() - 1728e5 }
  ]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold mb-6", children: "Refund Tracking" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: refunds.map((refund) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-xl p-4 bg-white shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold", children: [
            "Refund ",
            refund.id
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
            "Booking: ",
            refund.bookingId
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-lg font-bold text-brand-orange", children: [
          "R ",
          refund.amount
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(RefundStatus, { status: refund.status }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-2", children: [
        "Requested: ",
        new Date(refund.requestedAt).toLocaleDateString()
      ] })
    ] }, refund.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 p-4 bg-cream-sand rounded-xl border border-cream-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold mb-2", children: "Refund Process" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "text-sm space-y-1 list-decimal list-inside", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Requested - Your refund request has been submitted" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "In Review - Our team is reviewing your request" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Approved - Refund has been approved" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Paid - Refund has been processed to your account" })
      ] })
    ] })
  ] });
}
export {
  Refunds as default
};
//# sourceMappingURL=Refunds-DnUNxCcC.js.map

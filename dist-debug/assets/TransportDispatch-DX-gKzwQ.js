import { R as React, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import "./react-4gMnsuNC.js";
function TransportDispatch() {
  React.useEffect(() => {
    if (typeof window !== "undefined" && typeof window.scrollTo === "function") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold mb-4 text-brand-orange", children: "Transport Dispatch" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-cream-sand border rounded p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2", children: "No active requests yet." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown/70", children: "Requests will appear here for assignment and status updates." })
    ] })
  ] });
}
export {
  TransportDispatch as default
};
//# sourceMappingURL=TransportDispatch-DX-gKzwQ.js.map

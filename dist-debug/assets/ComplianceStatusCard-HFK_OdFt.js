import { j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { y as ShieldCheck } from "./icons-C4AMPM7L.js";
import { L as Link } from "./index-DlOecmR0.js";
function ComplianceStatusCard({ valid = 0, expiring = 0, missing = 0, to = "/compliance" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to, className: "block rounded border border-cream-border bg-cream p-3 hover:border-brand-orange transition text-brand-brown", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-5 w-5 text-brand-orange" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Compliance Status" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm flex gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-emerald-700", children: [
        valid,
        " valid"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-yellow-700", children: [
        expiring,
        " expiring"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-red-700", children: [
        missing,
        " missing"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-brand-brown/60 mt-2", children: "Documents are checked automatically and reminders are sent before expiry." })
  ] });
}
export {
  ComplianceStatusCard as C
};
//# sourceMappingURL=ComplianceStatusCard-HFK_OdFt.js.map

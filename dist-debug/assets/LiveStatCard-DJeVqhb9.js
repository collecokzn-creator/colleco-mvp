import { j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { L as Link } from "./index-DlOecmR0.js";
function LiveStatCard({ title, value = "—", subtext, to, icon: Icon, highlight }) {
  const Wrapper = to ? Link : "div";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Wrapper, { to, className: "rounded border border-cream-border bg-cream p-3 hover:border-brand-orange transition block text-brand-brown", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown/70", children: title }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xl font-bold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: value }),
          highlight ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block h-2.5 w-2.5 rounded-full ${highlight}` }) : null
        ] }),
        subtext ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-brand-brown/70 mt-0.5", children: subtext }) : null
      ] }),
      Icon ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5 text-brand-orange" }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-brand-brown/60 mt-2", children: "Live data placeholder — this will auto-refresh via API." })
  ] });
}
export {
  LiveStatCard as L
};
//# sourceMappingURL=LiveStatCard-DJeVqhb9.js.map

import { j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { a0 as Megaphone, l as CreditCard } from "./icons-C4AMPM7L.js";
import { L as Link } from "./index-DlOecmR0.js";
function PromotionsBalanceCard({ balance = 0, currency = "R", to = "/promotions" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to, className: "block rounded border border-brand-gold bg-white p-3 hover:border-brand-orange transition text-brand-orange", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Megaphone, { className: "h-5 w-5 text-brand-orange" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-brand-orange", children: "Promotions Balance" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xl font-bold text-brand-gold", children: [
      currency,
      " ",
      balance.toLocaleString()
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-sm mt-1 text-brand-gold", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-4 w-4 text-brand-gold" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Top-up credits or set monthly budget" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-brand-gold mt-2", children: "Self-serve ad placements and featured listings are managed here." })
  ] });
}
export {
  PromotionsBalanceCard as P
};
//# sourceMappingURL=PromotionsBalanceCard-C3qqkMzk.js.map

import { j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { B as BookingNav } from "./BookingNav-B1OTCtxJ.js";
import { B as BedDouble, d as Plane, e as Car, f as Bus } from "./icons-C4AMPM7L.js";
import { L as Link } from "./index-DlOecmR0.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
function Book() {
  const tiles = [
    { title: "Accommodation", desc: "Hotels, lodges and places to stay", to: "/book/accommodation", icon: BedDouble },
    { title: "Flights", desc: "Search and book flights quickly", to: "/book/flight", icon: Plane },
    { title: "Car Hire", desc: "Self drive or chauffeured vehicle hire", to: "/book/car", icon: Car },
    { title: "Shuttle & Transfers", desc: "Airport shuttles and local transfer services", to: "/transfers", icon: Bus }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto px-6 py-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(BookingNav, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold mb-4", children: "Book Now" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown/70 mb-6", children: "Choose what you want to book — we’ll walk you through the details and pricing." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: tiles.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("article", { className: "border rounded-lg p-6 bg-white shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 rounded bg-cream-border/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(t.icon, { className: "w-6 h-6 text-brand-orange" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-lg", children: t.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown/70 mt-1", children: t.desc }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: t.to, className: "inline-flex items-center gap-2 px-3 py-2 rounded bg-brand-orange text-white text-sm", children: [
          "Choose ",
          t.title
        ] }) })
      ] })
    ] }) }, t.to)) })
  ] });
}
export {
  Book as default
};
//# sourceMappingURL=Book-DJgWRp8R.js.map

import { j as jsxRuntimeExports, R as React } from "./motion-D9fZRtSt.js";
import { t as Home, B as BedDouble, e as Car, f as Bus, d as Plane } from "./icons-C4AMPM7L.js";
import { b as useLocation, L as Link } from "./index-DlOecmR0.js";
function BookingNav() {
  const location = useLocation();
  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/book/accommodation", label: "Accommodation", icon: BedDouble },
    { path: "/book/car", label: "Car Hire", icon: Car },
    { path: "/transfers", label: "Shuttle", icon: Bus },
    { path: "/book/flight", label: "Flight Booking", icon: Plane }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex flex-wrap items-center gap-2 pb-3 border-b border-cream-border", children: navItems.map((item, idx) => {
      const isActive = location.pathname === item.path;
      const Icon = item.icon;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
        idx > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-brand-brown/30 mx-1", children: "/" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: item.path,
            className: `inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition ${isActive ? "bg-brand-orange text-white font-semibold" : "text-brand-brown hover:bg-cream-sand"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.label })
            ]
          }
        )
      ] }, item.path);
    }) }),
    location.pathname !== "/book" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Link,
      {
        to: "/book",
        className: "inline-flex items-center gap-2 text-sm text-brand-brown/70 hover:text-brand-orange transition",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Back to booking options" })
        ]
      }
    ) })
  ] });
}
export {
  BookingNav as B
};
//# sourceMappingURL=BookingNav-B1OTCtxJ.js.map

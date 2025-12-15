import { j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { f as useLocalStorageState } from "./index-DlOecmR0.js";
function LiveTripProgress({ steps = [] }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded border border-cream-border bg-cream p-3 text-brand-brown", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold mb-2", children: "Trip Progress" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1 text-sm", children: steps.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block h-2.5 w-2.5 rounded-full ${s.done ? "bg-emerald-500" : "bg-brand-orange"}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: s.done ? "text-brand-brown" : "text-brand-brown/80", children: s.label })
    ] }, i)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-brand-brown/60 mt-2", children: "Auto-updates as you add quotes, plan days, and confirm bookings." })
  ] });
}
function useTripState() {
  return useLocalStorageState("trip", { days: {}, memories: {} });
}
function setMemory(trip, day, text) {
  const d = String(day);
  return { ...trip, memories: { ...trip.memories, [d]: text } };
}
function computeProgress(trip, selectionCount = 0) {
  const hasItineraryItems = Object.values(trip?.days || {}).some((arr) => arr && arr.length > 0);
  return [
    { label: "Select products (Basket)", done: selectionCount > 0 },
    { label: "Draft itinerary", done: hasItineraryItems },
    { label: "Confirm bookings & pay", done: false }
  ];
}
export {
  LiveTripProgress as L,
  computeProgress as c,
  setMemory as s,
  useTripState as u
};
//# sourceMappingURL=useTripState-BYDoCob1.js.map

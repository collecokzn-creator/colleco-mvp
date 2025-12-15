import { j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
function ItineraryDay({ day, date, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-brand-brown", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", role: "list", "aria-label": `Itinerary items for day ${day}`, children }) });
}
function ExperienceCard({ title, subtitle, time, notes, onAdd, onRemove }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-cream-sand/30 p-3 w-full overflow-hidden hover:bg-cream-sand/50 transition-colors", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start sm:items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-brand-brown break-words", children: title }),
        subtitle ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-brand-brown/70 break-words", children: subtitle }) : null,
        time ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-brand-brown/60 mt-0.5", children: time }) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-shrink-0", children: [
        onAdd ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "px-3 py-1.5 text-sm rounded-lg bg-brand-orange/10 text-brand-orange hover:bg-brand-orange/20 font-medium transition-colors", onClick: onAdd, children: "Add" }) : null,
        onRemove ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "px-3 py-1.5 text-sm rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium transition-colors", onClick: onRemove, children: "Remove" }) : null
      ] })
    ] }),
    notes ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown/80 mt-2", children: notes }) : null
  ] });
}
function MemoryNote({ value, onChange, placeholder = "Capture a memory… (this saves automatically)", rows = 2 }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded border border-cream-border bg-cream p-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "textarea",
      {
        className: "w-full resize-none bg-transparent outline-none text-sm text-brand-brown placeholder:text-brand-brown/50",
        rows,
        value,
        onChange: (e) => onChange?.(e.target.value),
        placeholder
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-brand-brown/60", children: "Memories sync to your itinerary and can be exported to PDF later." })
  ] });
}
export {
  ExperienceCard as E,
  ItineraryDay as I,
  MemoryNote as M
};
//# sourceMappingURL=MemoryNote-CP9Z0UOD.js.map

import { _ as __vitePreload } from "./pdf-DKpnIAzb.js";
import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { I as ItineraryDay, E as ExperienceCard, M as MemoryNote } from "./MemoryNote-CP9Z0UOD.js";
import { u as useTripState, L as LiveTripProgress, c as computeProgress, s as setMemory } from "./useTripState-BYDoCob1.js";
import { u as useBasketState } from "./useBasketState-DcL2gvap.js";
import { f as useLocalStorageState } from "./index-DlOecmR0.js";
import { W as WorkflowPanel } from "./WorkflowPanel-DczOhPSj.js";
import { B as Button } from "./Button-BvBK5int.js";
import "./react-4gMnsuNC.js";
import "./icons-C4AMPM7L.js";
function Itinerary() {
  const [trip, setTrip] = useTripState();
  const [linkQuotes] = useLocalStorageState("basketAutoSync:v1", true);
  const { basket, removeFromBasket } = useBasketState();
  const [search, setSearch] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (!linkQuotes) return;
    setTrip((t) => {
      let next = { ...t, days: { ...t.days } };
      let mutated = false;
      const basketIds = new Set(basket.map((b) => b.id));
      Object.keys(next.days).forEach((d) => {
        const filtered = (next.days[d] || []).filter((it) => !(it._basketSource && !basketIds.has(it.id)));
        if (filtered.length !== (next.days[d] || []).length) {
          next.days[d] = filtered;
          mutated = true;
        }
      });
      basket.forEach((bItem) => {
        const targetDay = String(bItem.day || 1);
        const existingInTarget = (next.days[targetDay] || []).find((it) => it.id === bItem.id);
        Object.keys(next.days).forEach((d) => {
          if (d !== targetDay) {
            if ((next.days[d] || []).some((it) => it.id === bItem.id && it._basketSource)) {
              next.days[d] = next.days[d].filter((it) => it.id !== bItem.id);
              mutated = true;
            }
          }
        });
        if (!existingInTarget) {
          const arr = next.days[targetDay] || [];
          next.days[targetDay] = [...arr, { ...bItem, time: bItem.time || "Flexible", _basketSource: true }];
          mutated = true;
        }
      });
      return mutated ? next : t;
    });
  }, [basket, linkQuotes, setTrip]);
  const filteredDays = reactExports.useMemo(() => {
    if (!search.trim()) return trip.days;
    const q = search.trim().toLowerCase();
    const filtered = {};
    Object.keys(trip.days).forEach((day) => {
      const items = (trip.days[day] || []).filter(
        (it) => (it.title || "").toLowerCase().includes(q) || (it.subtitle || "").toLowerCase().includes(q)
      );
      if (items.length > 0) {
        filtered[day] = items;
      }
    });
    return filtered;
  }, [trip.days, search]);
  function removeItem(day, itemId) {
    setTrip((prev) => {
      const dayItems = (prev.days[day] || []).filter((it) => it.id !== itemId);
      const item = (prev.days[day] || []).find((it) => it.id === itemId);
      if (item?._basketSource) {
        removeFromBasket(itemId);
      }
      return { ...prev, days: { ...prev.days, [day]: dayItems } };
    });
  }
  function addDay() {
    const existing = Object.keys(trip.days || {}).map((n) => Number(n)).filter((n) => Number.isFinite(n) && n > 0);
    const next = existing.length ? Math.max(...existing) + 1 : 1;
    setTrip((prev) => ({ ...prev, days: { ...prev.days, [String(next)]: [] } }));
  }
  async function handleExport() {
    const { default: jsPDF } = await __vitePreload(async () => {
      const { default: jsPDF2 } = await import("./pdf-DKpnIAzb.js").then((n) => n.j);
      return { default: jsPDF2 };
    }, true ? [] : void 0);
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Your CollEco Itinerary", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`, 14, 28);
    let y = 40;
    const days = Object.keys(trip.days).sort((a, b) => Number(a) - Number(b));
    days.forEach((d) => {
      doc.setFontSize(14);
      doc.setFont(void 0, "bold");
      doc.text(`Day ${d}`, 14, y);
      y += 8;
      doc.setFontSize(10);
      doc.setFont(void 0, "normal");
      (trip.days[d] || []).forEach((item) => {
        const text = `• ${item.title}${item.subtitle ? " — " + item.subtitle : ""}`;
        const lines = doc.splitTextToSize(text, 180);
        lines.forEach((line) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, 18, y);
          y += 6;
        });
      });
      const mem = trip.memories?.[d];
      if (mem) {
        doc.setFont(void 0, "italic");
        const memLines = doc.splitTextToSize(`Notes: ${mem}`, 180);
        memLines.forEach((line) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, 18, y);
          y += 6;
        });
        doc.setFont(void 0, "normal");
      }
      y += 6;
    });
    doc.save("itinerary.pdf");
  }
  const dayKeys = Object.keys(filteredDays).sort((a, b) => Number(a) - Number(b));
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full min-h-screen bg-cream overflow-x-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl sm:text-4xl font-bold text-brand-brown mb-2", children: "✈️ Trip Itinerary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-russty text-sm sm:text-base", children: "Plan each day and capture memories" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: handleExport, children: "📄 Export PDF" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", onClick: addDay, children: "Add Day" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          value: search,
          onChange: (e) => setSearch(e.target.value),
          placeholder: "🔍 Search itinerary...",
          className: "w-full sm:w-96 px-4 py-2 border-2 border-cream-border rounded-lg focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
        }
      ),
      search && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-brand-russty", children: [
        'Showing results for "',
        search,
        '" · ',
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSearch(""), className: "underline hover:no-underline text-brand-orange", children: "Clear" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      WorkflowPanel,
      {
        currentPage: "itinerary",
        basketCount: basket.length,
        hasItinerary: Object.keys(trip.days).length > 0
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LiveTripProgress, { steps: computeProgress(trip, linkQuotes ? basket.length : 0) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl border border-cream-border shadow-sm p-6", children: dayKeys.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 px-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 text-6xl opacity-20", children: "📅" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-brown font-semibold mb-2", children: "No itinerary items yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-russty mb-4", children: linkQuotes ? "Add products to your basket on Trip Planner to get started." : 'Click "Add Day" to create your first day.' }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "lg", onClick: addDay, children: "Create First Day" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: dayKeys.map((day) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-2 border-cream-border rounded-xl p-5 bg-gradient-to-br from-white to-cream/10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ItineraryDay, { day, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-xl font-bold text-brand-brown", children: [
            "Day ",
            day
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-brand-russty bg-cream-sand px-3 py-1 rounded-full font-semibold", children: [
            (filteredDays[day] || []).length,
            " ",
            (filteredDays[day] || []).length === 1 ? "item" : "items"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: (filteredDays[day] || []).map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ExperienceCard,
            {
              title: item.title,
              subtitle: item.subtitle,
              time: item.time
            }
          ),
          item._basketSource && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-2 top-2 text-[10px] px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold", children: "From Basket" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: () => removeItem(day, item.id),
              variant: "danger",
              size: "xs",
              className: "absolute right-2 top-2 w-6 h-6 !p-0",
              title: "Remove item",
              children: "✕"
            }
          )
        ] }, item.id || idx)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          MemoryNote,
          {
            day,
            value: trip.memories?.[day] || "",
            onChange: (val) => setMemory(trip, setTrip, day),
            placeholder: "Add notes or memories for this day..."
          }
        ) })
      ] }) }, day)) }) }) })
    ] })
  ] }) });
}
export {
  Itinerary as default
};
//# sourceMappingURL=ItinerarySimple-DlxCSQuV.js.map

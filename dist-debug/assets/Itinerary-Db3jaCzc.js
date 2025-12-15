import { _ as __vitePreload } from "./pdf-DKpnIAzb.js";
import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { I as ItineraryDay, E as ExperienceCard, M as MemoryNote } from "./MemoryNote-CP9Z0UOD.js";
import { u as useTripState, L as LiveTripProgress, c as computeProgress, s as setMemory } from "./useTripState-BYDoCob1.js";
import { W as WeatherWidget } from "./WeatherWidget-BlfuEc2C.js";
import { u as useBasketState } from "./useBasketState-DcL2gvap.js";
import { f as useLocalStorageState } from "./index-DlOecmR0.js";
import { W as WorkflowPanel } from "./WorkflowPanel-DczOhPSj.js";
import "./react-4gMnsuNC.js";
import "./icons-C4AMPM7L.js";
function Itinerary() {
  const [trip, setTrip] = useTripState();
  const [linkQuotes] = useLocalStorageState("basketAutoSync:v1", true);
  const { basket, removeFromBasket } = useBasketState();
  const [search, setSearch] = reactExports.useState("");
  const [showSettings, setShowSettings] = reactExports.useState(false);
  const [tripLocation, setTripLocation] = useLocalStorageState("trip_location", {
    city: "Durban",
    country: "South Africa"
  });
  const [itinerarySettings, setItinerarySettings] = useLocalStorageState("itinerary_settings", {
    companyName: "CollEco Travel",
    tagline: "The Odyssey of Adventure",
    website: "www.travelcolleco.com",
    logo: null
  });
  const undoStackRef = reactExports.useRef([]);
  const lastSavedRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const current = JSON.stringify(trip);
    if (lastSavedRef.current && lastSavedRef.current !== current) {
      try {
        const snapshot = JSON.parse(lastSavedRef.current);
        undoStackRef.current.push(snapshot);
        if (undoStackRef.current.length > 20) undoStackRef.current.shift();
      } catch (e) {
      }
    }
    lastSavedRef.current = current;
  }, [trip]);
  reactExports.useEffect(() => {
    const handleUndo = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        if (undoStackRef.current.length > 0) {
          const previous = undoStackRef.current.pop();
          setTrip(previous);
        }
      }
    };
    window.addEventListener("keydown", handleUndo);
    return () => window.removeEventListener("keydown", handleUndo);
  }, [setTrip]);
  reactExports.useEffect(() => {
    try {
      const raw = localStorage.getItem("aiItineraryDraft:v1");
      if (raw && Object.keys(trip.days || {}).length === 0) {
        const draft = JSON.parse(raw);
        const draftDays = {};
        (draft.itinerary || []).forEach((d) => {
          const key = String(d.day || d.dayNumber || 1);
          if (!draftDays[key]) draftDays[key] = [];
          draftDays[key].push({
            id: "ai-" + d.day + "-" + Math.random().toString(36).slice(2),
            title: d.title || `Day ${d.day}`,
            time: "Flexible",
            subtitle: (d.activities || []).join(", "),
            _aiSource: true
          });
        });
        setTrip((prev) => ({ ...prev, days: draftDays }));
        localStorage.removeItem("aiItineraryDraft:v1");
      }
    } catch (e) {
    }
  }, [trip.days, setTrip]);
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
      Object.keys(next.days).forEach((d) => {
        const items = next.days[d] || [];
        if (items.length > 1) {
          const sorted = [...items].sort((a, b) => {
            const timeOrder = { "Morning": 0, "Afternoon": 1, "Evening": 2, "Flexible": 3 };
            const aTime = timeOrder[a.time] ?? 99;
            const bTime = timeOrder[b.time] ?? 99;
            if (aTime !== bTime) return aTime - bTime;
            if (a._basketSource && !b._basketSource) return -1;
            if (!a._basketSource && b._basketSource) return 1;
            return 0;
          });
          const orderChanged = sorted.some((item, idx) => items[idx]?.id !== item.id);
          if (orderChanged) {
            next.days[d] = sorted;
            mutated = true;
          }
        }
      });
      Object.keys(next.days).forEach((d) => {
        if (d !== "1" && (!next.days[d] || next.days[d].length === 0)) {
          delete next.days[d];
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
      const newDays = { ...prev.days, [day]: dayItems };
      if (day !== "1" && dayItems.length === 0) {
        delete newDays[day];
      }
      return { ...prev, days: newDays };
    });
  }
  function addDay() {
    const existing = Object.keys(trip.days || {}).map((n) => Number(n)).filter((n) => Number.isFinite(n) && n > 0);
    const next = existing.length ? Math.max(...existing) + 1 : 1;
    const lastDay = String(Math.max(...existing, 0));
    if (lastDay && (!trip.days[lastDay] || trip.days[lastDay].length === 0)) {
      return;
    }
    setTrip((prev) => ({ ...prev, days: { ...prev.days, [String(next)]: [] } }));
  }
  async function handleExport() {
    const { default: jsPDF } = await __vitePreload(async () => {
      const { default: jsPDF2 } = await import("./pdf-DKpnIAzb.js").then((n) => n.j);
      return { default: jsPDF2 };
    }, true ? [] : void 0);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const addHeader = () => {
      if (itinerarySettings.logo) {
        try {
          const logoW = 45;
          const logoH = 20;
          const logoX = pageWidth - 14 - logoW;
          doc.addImage(itinerarySettings.logo, "PNG", logoX, 8, logoW, logoH);
        } catch (e) {
          console.warn("Logo add failed:", e);
        }
      }
      doc.setFontSize(16);
      doc.setFont(void 0, "bold");
      const companyName = itinerarySettings.companyName || "CollEco Travel";
      const companyWidth = doc.getTextWidth(companyName);
      doc.text(companyName, (pageWidth - companyWidth) / 2, 16);
      doc.setFontSize(24);
      const bird = "🦜";
      doc.setFontSize(11);
      doc.setFont(void 0, "italic");
      const payoffLine = itinerarySettings.tagline || "The Odyssey of Adventure";
      const payoffWidth = doc.getTextWidth(payoffLine);
      doc.setFontSize(14);
      const globe = "🌍";
      doc.setFontSize(24);
      const birdWidth = doc.getTextWidth(bird);
      doc.setFontSize(14);
      const globeWidth = doc.getTextWidth(globe);
      const spacing = 2;
      const totalWidth = birdWidth + spacing + payoffWidth + spacing + globeWidth;
      const startX = (pageWidth - totalWidth) / 2;
      doc.setFontSize(24);
      doc.text(bird, startX, 26);
      doc.setFontSize(11);
      doc.setFont(void 0, "italic");
      doc.text(payoffLine, startX + birdWidth + spacing, 26);
      doc.setFontSize(14);
      doc.text(globe, startX + birdWidth + spacing + payoffWidth + spacing, 26);
      doc.setDrawColor(255, 140, 0);
      doc.setLineWidth(0.5);
      doc.line(14, 36, pageWidth - 14, 36);
      doc.setTextColor(0, 0, 0);
    };
    const addFooter = () => {
      doc.setFontSize(10);
      doc.setFont(void 0, "bold");
      doc.setTextColor(255, 140, 0);
      const websiteText = itinerarySettings.website || "www.travelcolleco.com";
      const websiteWidth = doc.getTextWidth(websiteText);
      const websiteX = (pageWidth - websiteWidth) / 2;
      doc.text(websiteText, websiteX, pageHeight - 10);
      doc.setDrawColor(255, 140, 0);
      doc.setLineWidth(0.5);
      doc.line(websiteX, pageHeight - 9, websiteX + websiteWidth, pageHeight - 9);
      doc.setTextColor(0, 0, 0);
    };
    addHeader();
    doc.setFontSize(9);
    doc.setFont(void 0, "normal");
    doc.setTextColor(100, 100, 100);
    const dateText = `Itinerary for the Mkhize family generated on ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}`;
    doc.text(dateText, 14, 32);
    doc.setTextColor(0, 0, 0);
    let y = 46;
    const days = Object.keys(trip.days).sort((a, b) => Number(a) - Number(b));
    const startDate = /* @__PURE__ */ new Date();
    days.forEach((d, dayIndex) => {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + dayIndex);
      const formattedDate = currentDate.toLocaleDateString("en-GB");
      doc.setFontSize(14);
      doc.setFont(void 0, "bold");
      doc.text(`Day ${d} - ${formattedDate}`, 14, y);
      y += 8;
      doc.setFontSize(10);
      doc.setFont(void 0, "normal");
      (trip.days[d] || []).forEach((item) => {
        const timeInfo = item.time ? `[${item.time}] ` : "";
        const text = `• ${timeInfo}${item.title}${item.subtitle ? " — " + item.subtitle : ""}`;
        const lines = doc.splitTextToSize(text, 180);
        lines.forEach((line) => {
          if (y > 270) {
            doc.addPage();
            addHeader();
            y = 46;
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
            addHeader();
            y = 46;
          }
          doc.text(line, 18, y);
          y += 6;
        });
        doc.setFont(void 0, "normal");
      }
      y += 6;
    });
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      addFooter();
    }
    doc.save("itinerary.pdf");
  }
  const dayKeys = Object.keys(filteredDays).sort((a, b) => Number(a) - Number(b));
  const totalItems = Object.values(filteredDays).reduce((sum, items) => sum + items.length, 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full min-h-screen bg-gradient-to-br from-cream to-cream-sand", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl shadow-sm border border-cream-border p-6 mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl sm:text-4xl font-bold text-brand-brown", children: "Trip Itinerary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold", title: "Auto-save, smart ordering, and AI draft detection enabled", children: "Smart Mode" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-brand-russty text-sm sm:text-base", children: [
          dayKeys.length,
          " day",
          dayKeys.length > 1 ? "s" : "",
          " • ",
          totalItems,
          " activit",
          totalItems === 1 ? "y" : "ies",
          " planned"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setShowSettings(!showSettings),
            className: "px-4 py-2 rounded-lg border-2 border-cream-border text-brand-brown hover:border-brand-orange hover:bg-cream font-semibold transition-all shadow-sm",
            children: "Settings"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleExport,
            className: "px-4 py-2 rounded-lg border-2 border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white font-semibold transition-all shadow-sm hover:shadow-md",
            children: "Export PDF"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: addDay,
            className: "px-4 py-2 rounded-lg bg-brand-orange text-white hover:bg-brand-highlight font-semibold transition-all shadow-sm hover:shadow-md",
            children: "Add Day"
          }
        )
      ] })
    ] }) }),
    showSettings && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-cream-border p-6 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-bold text-brand-brown mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "⚙️" }),
        "Itinerary Settings"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-1", children: "Company Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: itinerarySettings.companyName,
                onChange: (e) => setItinerarySettings({ ...itinerarySettings, companyName: e.target.value }),
                className: "w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none",
                placeholder: "CollEco Travel"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-1", children: "Tagline" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: itinerarySettings.tagline,
                onChange: (e) => setItinerarySettings({ ...itinerarySettings, tagline: e.target.value }),
                className: "w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none",
                placeholder: "The Odyssey of Adventure"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-1", children: "Website" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: itinerarySettings.website,
                onChange: (e) => setItinerarySettings({ ...itinerarySettings, website: e.target.value }),
                className: "w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none",
                placeholder: "www.travelcolleco.com"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-cream-border pt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-brand-brown mb-3", children: "Trip Location (for weather)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-brand-brown/70 mb-1", children: "City" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: tripLocation.city,
                    onChange: (e) => setTripLocation({ ...tripLocation, city: e.target.value }),
                    className: "w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none",
                    placeholder: "Durban"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-brand-brown/70 mb-1", children: "Country" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: tripLocation.country,
                    onChange: (e) => setTripLocation({ ...tripLocation, country: e.target.value }),
                    className: "w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none",
                    placeholder: "South Africa"
                  }
                )
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-1", children: "Company Logo" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-2 border-dashed border-cream-border rounded-lg p-4 text-center", children: itinerarySettings.logo ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: itinerarySettings.logo,
                alt: "Company logo",
                className: "h-24 w-auto mx-auto object-contain"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setItinerarySettings({ ...itinerarySettings, logo: null }),
                className: "px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors",
                children: "Remove Logo"
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-4xl opacity-30", children: "🖼️" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "file",
                id: "itineraryLogoUpload",
                accept: "image/*",
                onChange: (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (!file.type.startsWith("image/")) {
                    alert("Please upload an image file");
                    return;
                  }
                  if (file.size > 2 * 1024 * 1024) {
                    alert("Image must be less than 2MB");
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = (evt) => {
                    const dataUrl = evt.target?.result;
                    if (dataUrl && typeof dataUrl === "string") {
                      setItinerarySettings({ ...itinerarySettings, logo: dataUrl });
                    }
                  };
                  reader.readAsDataURL(file);
                },
                className: "hidden"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "label",
              {
                htmlFor: "itineraryLogoUpload",
                className: "inline-block px-4 py-2 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-highlight transition-colors cursor-pointer",
                children: "📤 Upload Logo"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-brand-russty", children: "Max 2MB • PNG, JPG, SVG" })
          ] }) })
        ] })
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
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-2xl shadow-md p-4 sm:p-6", children: dayKeys.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 px-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 text-6xl opacity-20", children: "📅" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-brown font-semibold mb-2", children: "No itinerary items yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-russty mb-4", children: linkQuotes ? "Add products to your basket on Trip Planner to get started." : 'Click "Add Day" to create your first day.' }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: addDay,
            className: "px-6 py-3 bg-brand-orange text-white rounded-xl font-semibold hover:bg-brand-highlight transition-all shadow-sm hover:shadow-md",
            children: "Create First Day"
          }
        )
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: dayKeys.map((day) => {
        const startDate = /* @__PURE__ */ new Date();
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + (Number(day) - 1));
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gradient-to-br from-white to-cream-sand/20 rounded-2xl shadow-md p-4 sm:p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ItineraryDay, { day, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-2xl sm:text-3xl font-bold text-brand-brown", children: [
              "Day ",
              day
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs sm:text-sm text-brand-russty bg-cream-sand px-2 sm:px-3 py-1 rounded-full font-semibold", children: [
              (filteredDays[day] || []).length,
              " ",
              (filteredDays[day] || []).length === 1 ? "item" : "items"
            ] })
          ] }),
          tripLocation.city && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            WeatherWidget,
            {
              city: tripLocation.city,
              country: tripLocation.country
            }
          ) }),
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
              "button",
              {
                onClick: () => removeItem(day, item.id),
                className: "absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm",
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
        ] }) }, day);
      }) }) }) })
    ] })
  ] }) });
}
export {
  Itinerary as default
};
//# sourceMappingURL=Itinerary-Db3jaCzc.js.map

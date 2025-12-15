import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { B as Button } from "./Button-BvBK5int.js";
import { A as AutoSyncBanner } from "./AutoSyncBanner-CKsB_6Rd.js";
import { u as useTripState, L as LiveTripProgress, c as computeProgress } from "./useTripState-BYDoCob1.js";
import { u as useBasketState } from "./useBasketState-DcL2gvap.js";
import { f as formatCurrency } from "./currency-J2bxD4Bj.js";
import { b as useLocation, u as useNavigate, I as PRODUCTS, J as searchEvents, K as buildLocationMaps, M as loadMyLocation, O as loadSmartSettings, Q as getSuggestion, L as Link, S as persistMyLocation, T as detectCategory, V as resolveLocationToken, W as longestLocationMatch } from "./index-DlOecmR0.js";
import { W as WeatherWidget } from "./WeatherWidget-BlfuEc2C.js";
import { W as WorkflowPanel } from "./WorkflowPanel-DczOhPSj.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
import "./icons-C4AMPM7L.js";
function sortEvents(list = [], order = "dateAsc") {
  const items = Array.isArray(list) ? list.slice() : [];
  const parseTs = (d) => {
    const t = Date.parse(d);
    return Number.isFinite(t) ? t : NaN;
  };
  const asc = order !== "dateDesc";
  return items.map((e) => ({ e, t: parseTs(e?.date) })).sort((a, b) => {
    const at = a.t, bt = b.t;
    const aNaN = Number.isNaN(at), bNaN = Number.isNaN(bt);
    if (aNaN && bNaN) return 0;
    if (aNaN) return 1;
    if (bNaN) return -1;
    return asc ? at - bt : bt - at;
  }).map((x) => x.e);
}
function mergeAndSort(prev = [], more = [], order = "dateAsc") {
  return sortEvents([...prev || [], ...more || []], order);
}
function MyLocationModal({ open, onClose, onSave, initial = {} }) {
  const [city, setCity] = reactExports.useState(initial.city || "");
  const [province, setProvince] = reactExports.useState(initial.province || "");
  const [country, setCountry] = reactExports.useState(initial.country || "");
  if (!open) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded shadow-lg border border-cream-border w-[min(28rem,92vw)] p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Set My Location" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, "aria-label": "Close", className: "text-brand-brown/70 hover:text-brand-brown", children: "✕" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown/70 mb-3", children: "This helps us apply “Near me” filters quickly." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: city, onChange: (e) => setCity(e.target.value), placeholder: "City", className: "px-2 py-1 border border-cream-border rounded" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: province, onChange: (e) => setProvince(e.target.value), placeholder: "Province/State", className: "px-2 py-1 border border-cream-border rounded" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: country, onChange: (e) => setCountry(e.target.value), placeholder: "Country", className: "px-2 py-1 border border-cream-border rounded" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "text-sm px-3 py-1 rounded border border-cream-border bg-white hover:bg-cream-hover", children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onSave({ city: city.trim(), province: province.trim(), country: country.trim() }), className: "text-sm px-3 py-1 rounded border border-brand-brown bg-brand-brown text-cream hover:bg-brand-brown/90", children: "Save" })
    ] })
  ] }) });
}
function useClickOutside(handler, isOpen = true) {
  const ref = reactExports.useRef(null);
  const handlerRef = reactExports.useRef(handler);
  reactExports.useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);
  reactExports.useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        handlerRef.current();
      }
    };
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);
  return ref;
}
function useEscapeKey(handler, isOpen = true) {
  const handlerRef = reactExports.useRef(handler);
  reactExports.useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);
  reactExports.useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        handlerRef.current();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);
}
function useClickOutsideAndEscape(handler, isOpen = true) {
  const ref = useClickOutside(handler, isOpen);
  useEscapeKey(handler, isOpen);
  return ref;
}
function MiniItineraryPreview({ basket }) {
  const days = reactExports.useMemo(() => {
    const grouped = {};
    basket.forEach((item) => {
      const day = item.day || 1;
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(item);
    });
    Object.keys(grouped).forEach((day) => {
      grouped[day].sort((a, b) => {
        const timeOrder = { "Morning": 0, "Afternoon": 1, "Evening": 2, "Flexible": 3 };
        return (timeOrder[a.time] || 99) - (timeOrder[b.time] || 99);
      });
    });
    return grouped;
  }, [basket]);
  const sortedDays = reactExports.useMemo(
    () => Object.keys(days).sort((a, b) => Number(a) - Number(b)),
    [days]
  );
  if (basket.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-brand-russty/60 italic p-3 bg-cream-sand/50 rounded border border-dashed border-cream-border", children: "Add items to see your itinerary preview" });
  }
  const timeIcon = {
    "Morning": "🌅",
    "Afternoon": "☀️",
    "Evening": "🌙",
    "Flexible": "⏰"
  };
  const categoryIcon = {
    "Lodging": "🏨",
    "Accommodation": "🏨",
    "Activity": "🎯",
    "Tour": "🗺️",
    "Experience": "✨",
    "Dining": "🍽️",
    "Transport": "🚗",
    "Flight": "✈️",
    "Default": "📌"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded border border-cream-border bg-white/50 overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-r from-brand-orange to-brand-gold text-white px-3 py-2 text-xs font-semibold flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "📅" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Itinerary Preview" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-96 overflow-y-auto custom-scrollbar p-3 space-y-3", children: sortedDays.map((day) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-cream-sand/30 rounded-lg p-2 border border-cream-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-bold text-brand-brown mb-2 flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-brand-orange text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]", children: day }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Day ",
          day
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-brand-russty/60 font-normal", children: [
          "(",
          days[day].length,
          " item",
          days[day].length > 1 ? "s" : "",
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: days[day].map((item, _idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded border border-cream-border p-2 text-[11px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm flex-shrink-0", children: categoryIcon[item.category] || categoryIcon.Default }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-brand-brown truncate", title: item.title, children: item.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[10px] text-brand-russty/70 mt-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-0.5", children: [
              timeIcon[item.time] || timeIcon.Flexible,
              item.time || "Flexible"
            ] }),
            item.quantity > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "• x",
              item.quantity
            ] }),
            item.price > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "• R",
              item.price
            ] })
          ] })
        ] })
      ] }) }, item.id)) })
    ] }, day)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-cream-sand/50 px-3 py-2 text-[10px] text-brand-russty/70 border-t border-cream-border flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        basket.length,
        " item",
        basket.length > 1 ? "s" : "",
        " across ",
        sortedDays.length,
        " day",
        sortedDays.length > 1 ? "s" : ""
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/itinerary", className: "text-brand-orange hover:underline font-semibold", children: "View Full →" })
    ] })
  ] });
}
function PlanTrip() {
  reactExports.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  const location = useLocation();
  const navigate = useNavigate();
  const [directBookingOpen, setDirectBookingOpen] = reactExports.useState(false);
  reactExports.useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      if (params.get("direct") === "1") {
        setDirectBookingOpen(true);
      }
    } catch {
    }
  }, [location.search]);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [selectedProduct, setSelectedProduct] = reactExports.useState(null);
  const [bookingDate, setBookingDate] = reactExports.useState(() => {
    try {
      return localStorage.getItem("directBooking:lastDate") || "";
    } catch {
      return "";
    }
  });
  const [trip] = useTripState();
  const [query, setQuery] = reactExports.useState("");
  const [searchEl, setSearchEl] = reactExports.useState(null);
  const { basket, addToBasket, removeFromBasket, updateQuantity, updateDay, paidItems, clearBasket } = useBasketState();
  const [copyLinkStatus, setCopyLinkStatus] = reactExports.useState("");
  const DirectBookingModal = () => {
    const modalRef = reactExports.useRef(null);
    const searchRef = reactExports.useRef(null);
    useClickOutsideAndEscape(modalRef, () => setDirectBookingOpen(false));
    reactExports.useEffect(() => {
      const t = setTimeout(() => {
        try {
          if (!selectedProduct) searchRef.current?.focus();
        } catch {
        }
      }, 0);
      return () => clearTimeout(t);
    }, []);
    reactExports.useEffect(() => {
      function handleTrap(e) {
        if (e.key === "Tab" && modalRef.current) {
          const focusables = modalRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
          if (focusables.length) {
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      }
      document.addEventListener("keydown", handleTrap);
      return () => document.removeEventListener("keydown", handleTrap);
    }, []);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        ref: modalRef,
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "direct-booking-title",
        className: "bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative",
        tabIndex: -1,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "absolute top-2 right-2 text-brand-russty hover:text-brand-orange transition", onClick: () => setDirectBookingOpen(false), "aria-label": "Close", children: "×" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { id: "direct-booking-title", className: "text-xl font-bold text-brand-rusty mb-3", children: "Direct Booking" }),
          !selectedProduct ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: searchTerm,
                onChange: (e) => setSearchTerm(e.target.value),
                placeholder: "Search products (e.g. flights, hotels...)",
                ref: searchRef,
                className: "w-full border rounded px-3 py-2 mb-3"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-40 overflow-y-auto mb-3", children: PRODUCTS.filter(
              (p) => p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase())
            ).slice(0, 10).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                className: "block w-full text-left px-3 py-2 rounded hover:bg-cream-hover",
                onClick: () => setSelectedProduct(p),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-brand-russty", children: p.title }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-xs text-brand-russty/70", children: p.category })
                ]
              },
              p.title
            )) })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 font-semibold text-brand-russty", children: selectedProduct.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-sm text-brand-russty/80", children: selectedProduct.category }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "date",
                value: bookingDate,
                onChange: (e) => {
                  const v = e.target.value;
                  setBookingDate(v);
                  try {
                    localStorage.setItem("directBooking:lastDate", v);
                  } catch {
                  }
                },
                className: "w-full border rounded px-3 py-2 mb-3"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                fullWidth: true,
                variant: "primary",
                size: "md",
                onClick: () => {
                  try {
                    showToast("Payment initiated", "success");
                  } catch {
                  }
                  const params = new URLSearchParams({ item: selectedProduct.title, date: bookingDate });
                  navigate(`/payment-success?${params.toString()}`);
                },
                disabled: !bookingDate || !selectedProduct,
                children: "Proceed to Payment"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "w-full text-xs text-brand-russty underline", onClick: () => setSelectedProduct(null), children: "← Back to search" })
          ] })
        ]
      }
    );
  };
  const [copySummaryStatus, setCopySummaryStatus] = reactExports.useState("");
  const [confirmClear, setConfirmClear] = reactExports.useState(false);
  const [lastCleared, setLastCleared] = reactExports.useState([]);
  const undoTimerRef = reactExports.useRef(null);
  const [undoMsg, setUndoMsg] = reactExports.useState("");
  const [presetStatus, setPresetStatus] = reactExports.useState("");
  const [selectedPreset, setSelectedPreset] = reactExports.useState("");
  const [presets, setPresets] = reactExports.useState(() => {
    try {
      return JSON.parse(localStorage.getItem("planTripPresets:v1") || "[]");
    } catch {
      return [];
    }
  });
  const [presetName, setPresetName] = reactExports.useState("");
  const [recentFilters, setRecentFilters] = reactExports.useState(() => {
    try {
      return JSON.parse(localStorage.getItem("planTripRecentFilters:v1") || "[]");
    } catch {
      return [];
    }
  });
  const [toasts, setToasts] = reactExports.useState([]);
  const [simpleMode, setSimpleMode] = reactExports.useState(() => {
    try {
      return localStorage.getItem("tripSimpleMode") === "1";
    } catch {
      return false;
    }
  });
  const [catalogSort, setCatalogSort] = reactExports.useState(() => {
    try {
      return localStorage.getItem("catalogSort:v1") || "relevance";
    } catch {
      return "relevance";
    }
  });
  reactExports.useEffect(() => {
    try {
      localStorage.setItem("catalogSort:v1", catalogSort);
    } catch {
    }
  }, [catalogSort]);
  const [showWeather, setShowWeather] = reactExports.useState(() => {
    try {
      return localStorage.getItem("showWeather") !== "0";
    } catch {
      return true;
    }
  });
  const [weatherCollapsed, setWeatherCollapsed] = reactExports.useState(() => {
    try {
      return localStorage.getItem("weatherCollapsed") === "1";
    } catch {
      return false;
    }
  });
  const [showAdvanced, setShowAdvanced] = reactExports.useState(() => {
    try {
      return localStorage.getItem("planTrip:showAdvanced:v2") === "1";
    } catch {
      return false;
    }
  });
  const advancedFiltersRef = useClickOutsideAndEscape(() => {
    if (showAdvanced) {
      setShowAdvanced(false);
      try {
        localStorage.setItem("planTrip:showAdvanced:v2", "0");
      } catch {
      }
    }
  }, showAdvanced);
  reactExports.useEffect(() => {
    function onStorage(e) {
      if (!e) return;
      if (e.key === "showWeather") {
        setShowWeather(e.newValue !== "0");
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  function toggleSimpleMode() {
    const next = !simpleMode;
    setSimpleMode(next);
    try {
      localStorage.setItem("tripSimpleMode", next ? "1" : "0");
    } catch {
    }
  }
  function showToast(text, type = "info", ttl = 2e3) {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), ttl);
  }
  reactExports.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qParam = params.get("q");
    if (qParam) setQuery(qParam);
  }, [location.search]);
  const locFilters = reactExports.useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      continent: params.get("continent") || "",
      country: params.get("country") || "",
      province: params.get("province") || "",
      city: params.get("city") || "",
      area: params.get("area") || "",
      category: params.get("category") || "",
      priceMin: params.get("priceMin") || "",
      priceMax: params.get("priceMax") || "",
      paidOnly: params.get("paidOnly") === "1",
      freeOnly: params.get("freeOnly") === "1"
    };
  }, [location.search]);
  reactExports.useEffect(() => {
    try {
      localStorage.setItem("lastLocFilters", JSON.stringify(locFilters));
    } catch {
    }
  }, [locFilters]);
  reactExports.useEffect(() => {
    const { continent, country, province, city, area, category, priceMin, priceMax, paidOnly, freeOnly } = locFilters;
    const keys = ["continent", "country", "province", "city", "area", "category", "priceMin", "priceMax", "paidOnly", "freeOnly"];
    const vals = { continent, country, province, city, area, category, priceMin, priceMax, paidOnly, freeOnly };
    const hasAny = keys.some((k) => {
      const v = vals[k];
      const s = typeof v === "boolean" ? v ? "1" : "" : String(v || "").trim();
      return s !== "";
    });
    if (!hasAny) return;
    const signature = keys.map((k) => {
      const v = vals[k];
      const s = typeof v === "boolean" ? v ? "1" : "" : String(v || "").trim().toLowerCase();
      return `${k}=${encodeURIComponent(s)}`;
    }).join("&");
    setRecentFilters((prev) => {
      const next = [signature, ...prev.map((r) => r.signature)].filter((s, i, arr) => arr.indexOf(s) === i).slice(0, 6);
      const detailed = next.map((sig) => ({
        signature: sig,
        filters: Object.fromEntries(sig.split("&").map((pair) => {
          const [k, v] = pair.split("=");
          return [k, v ? decodeURIComponent(v) : ""];
        }))
      }));
      try {
        localStorage.setItem("planTripRecentFilters:v1", JSON.stringify(detailed));
      } catch {
      }
      return detailed;
    });
  }, [
    locFilters.continent,
    locFilters.country,
    locFilters.province,
    locFilters.city,
    locFilters.area,
    locFilters.category,
    locFilters.priceMin,
    locFilters.priceMax,
    locFilters.paidOnly,
    locFilters.freeOnly,
    locFilters
  ]);
  function applyFilters(nextFilters) {
    const keys = ["continent", "country", "province", "city", "area", "category", "priceMin", "priceMax", "paidOnly", "freeOnly"];
    const params = new URLSearchParams(location.search);
    keys.forEach((k) => {
      let val = nextFilters?.[k];
      if (k === "paidOnly") {
        val = nextFilters?.paidOnly ? "1" : "";
      } else if (k === "freeOnly") {
        val = nextFilters?.freeOnly ? "1" : "";
      } else {
        val = (val || "").trim();
      }
      if (val) params.set(k, val);
      else params.delete(k);
    });
    navigate({ search: params.toString() ? `?${params.toString()}` : "" }, { replace: true });
  }
  function savePreset() {
    const name = (presetName || "").trim();
    if (!name) {
      showToast("Enter a preset name", "warn");
      return;
    }
    const record = { name, filters: locFilters };
    setPresets((prev) => {
      const filtered2 = prev.filter((p) => p.name !== name);
      const next = [...filtered2, record].sort((a, b) => a.name.localeCompare(b.name));
      try {
        localStorage.setItem("planTripPresets:v1", JSON.stringify(next));
      } catch {
      }
      setPresetStatus("saved");
      setTimeout(() => setPresetStatus(""), 1500);
      setSelectedPreset(name);
      showToast(`Preset "${name}" saved`, "success");
      return next;
    });
  }
  function deletePreset(name) {
    setPresets((prev) => {
      const next = prev.filter((p) => p.name !== name);
      try {
        localStorage.setItem("planTripPresets:v1", JSON.stringify(next));
      } catch {
      }
      setPresetStatus("deleted");
      setTimeout(() => setPresetStatus(""), 1500);
      if (selectedPreset === name) setSelectedPreset("");
      showToast(`Preset "${name}" deleted`, "info");
      return next;
    });
  }
  function applyPreset(name) {
    const p = presets.find((x) => x.name === name);
    if (!p) return;
    applyFilters(p.filters);
    setPresetStatus("applied");
    setTimeout(() => setPresetStatus(""), 1200);
    showToast(`Applied preset "${name}"`, "success");
  }
  reactExports.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const hasAny = ["continent", "country", "province", "city", "area", "category", "priceMin", "priceMax", "paidOnly", "freeOnly"].some((k) => params.get(k));
    if (hasAny) return;
    try {
      const raw = localStorage.getItem("lastLocFilters");
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (!saved || typeof saved !== "object") return;
      const next = new URLSearchParams();
      ["continent", "country", "province", "city", "area", "category", "priceMin", "priceMax"].forEach((k) => {
        if (saved[k]) next.set(k, saved[k]);
      });
      if (saved.paidOnly) next.set("paidOnly", "1");
      if (saved.freeOnly) next.set("freeOnly", "1");
      if ([...next.keys()].length) {
        navigate({ search: `?${next.toString()}` }, { replace: true });
      }
    } catch {
    }
  }, [location.search, navigate]);
  reactExports.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const hasDeepLink = ["continent", "country", "province", "city", "area", "category", "priceMin", "priceMax", "paidOnly", "freeOnly"].some((k) => params.get(k));
    const tabParam = params.get("tab");
    if (tabParam === "events") setActiveTab("events");
    else if (hasDeepLink) setActiveTab("catalog");
  }, [location.search]);
  reactExports.useEffect(() => {
    function onKeyDown(e) {
      if (e.key !== "/") return;
      const tag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : "";
      if (tag === "input" || tag === "textarea" || e.metaKey || e.ctrlKey || e.altKey) return;
      e.preventDefault();
      if (searchEl && typeof searchEl.focus === "function") {
        searchEl.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [searchEl]);
  const uniq = (arr) => Array.from(new Set(arr.filter(Boolean)));
  const sortAlpha = (arr) => [...arr].sort((a, b) => String(a).localeCompare(String(b), void 0, { sensitivity: "base" }));
  const continents = reactExports.useMemo(() => sortAlpha(uniq(PRODUCTS.map((p) => p.continent))), []);
  const countries = reactExports.useMemo(() => sortAlpha(uniq(
    PRODUCTS.filter((p) => !locFilters.continent || (p.continent || "").toLowerCase() === locFilters.continent.toLowerCase()).map((p) => p.country)
  )), [locFilters.continent]);
  const provinces = reactExports.useMemo(() => sortAlpha(uniq(
    PRODUCTS.filter(
      (p) => (!locFilters.continent || (p.continent || "").toLowerCase() === locFilters.continent.toLowerCase()) && (!locFilters.country || (p.country || "").toLowerCase() === locFilters.country.toLowerCase())
    ).map((p) => p.province)
  )), [locFilters.continent, locFilters.country]);
  const cities = reactExports.useMemo(() => sortAlpha(uniq(
    PRODUCTS.filter(
      (p) => (!locFilters.continent || (p.continent || "").toLowerCase() === locFilters.continent.toLowerCase()) && (!locFilters.country || (p.country || "").toLowerCase() === locFilters.country.toLowerCase()) && (!locFilters.province || (p.province || "").toLowerCase() === locFilters.province.toLowerCase())
    ).map((p) => p.city)
  )), [locFilters.continent, locFilters.country, locFilters.province]);
  const areas = reactExports.useMemo(() => sortAlpha(uniq(
    PRODUCTS.filter(
      (p) => (!locFilters.continent || (p.continent || "").toLowerCase() === locFilters.continent.toLowerCase()) && (!locFilters.country || (p.country || "").toLowerCase() === locFilters.country.toLowerCase()) && (!locFilters.province || (p.province || "").toLowerCase() === locFilters.province.toLowerCase()) && (!locFilters.city || (p.city || "").toLowerCase() === locFilters.city.toLowerCase())
    ).map((p) => p.area)
  )), [locFilters.continent, locFilters.country, locFilters.province, locFilters.city]);
  const categories = reactExports.useMemo(() => sortAlpha(uniq(
    PRODUCTS.filter(
      (p) => (!locFilters.continent || (p.continent || "").toLowerCase() === locFilters.continent.toLowerCase()) && (!locFilters.country || (p.country || "").toLowerCase() === locFilters.country.toLowerCase()) && (!locFilters.province || (p.province || "").toLowerCase() === locFilters.province.toLowerCase()) && (!locFilters.city || (p.city || "").toLowerCase() === locFilters.city.toLowerCase()) && (!locFilters.area || (p.area || "").toLowerCase() === locFilters.area.toLowerCase())
    ).map((p) => p.category)
  )), [locFilters.continent, locFilters.country, locFilters.province, locFilters.city, locFilters.area]);
  const counts = reactExports.useMemo(() => {
    const eq = (a, b) => String(a || "").toLowerCase() === String(b || "").toLowerCase();
    const base = PRODUCTS;
    const by = {
      continent: {},
      country: {},
      province: {},
      city: {},
      area: {},
      category: {}
    };
    for (const p of base) {
      if (p.continent) by.continent[p.continent] = (by.continent[p.continent] || 0) + 1;
    }
    const scopedCountries = base.filter((p) => !locFilters.continent || eq(p.continent, locFilters.continent));
    for (const p of scopedCountries) {
      if (p.country) by.country[p.country] = (by.country[p.country] || 0) + 1;
    }
    const scopedProvinces = scopedCountries.filter((p) => !locFilters.country || eq(p.country, locFilters.country));
    for (const p of scopedProvinces) {
      if (p.province) by.province[p.province] = (by.province[p.province] || 0) + 1;
    }
    const scopedCities = scopedProvinces.filter((p) => !locFilters.province || eq(p.province, locFilters.province));
    for (const p of scopedCities) {
      if (p.city) by.city[p.city] = (by.city[p.city] || 0) + 1;
    }
    const scopedAreas = scopedCities.filter((p) => !locFilters.city || eq(p.city, locFilters.city));
    for (const p of scopedAreas) {
      if (p.area) by.area[p.area] = (by.area[p.area] || 0) + 1;
    }
    const scopedForCategories = scopedAreas.filter((p) => !locFilters.area || eq(p.area, locFilters.area));
    for (const p of scopedForCategories) {
      if (p.category) by.category[p.category] = (by.category[p.category] || 0) + 1;
    }
    return by;
  }, [locFilters.continent, locFilters.country, locFilters.province, locFilters.city, locFilters.area]);
  const [events, setEvents] = reactExports.useState([]);
  const [eventsLoading, setEventsLoading] = reactExports.useState(false);
  const [eventsError, setEventsError] = reactExports.useState("");
  const [eventsPage, setEventsPage] = reactExports.useState(1);
  const [eventsHasMore, setEventsHasMore] = reactExports.useState(false);
  const [eventsSourceCounts, setEventsSourceCounts] = reactExports.useState({});
  const [includePast, setIncludePast] = reactExports.useState(() => {
    try {
      return localStorage.getItem("includePastEvents") === "1";
    } catch {
      return false;
    }
  });
  const [eventsSort, setEventsSort] = reactExports.useState(() => {
    try {
      return localStorage.getItem("eventsSort") || "dateAsc";
    } catch {
      return "dateAsc";
    }
  });
  function toggleIncludePast() {
    const next = !includePast;
    setIncludePast(next);
    try {
      localStorage.setItem("includePastEvents", next ? "1" : "0");
    } catch {
    }
  }
  const [groupByMonth, setGroupByMonth] = reactExports.useState(() => {
    try {
      return localStorage.getItem("eventsGroupByMonth") === "1";
    } catch {
      return false;
    }
  });
  function onChangeSort(val) {
    setEventsSort(val);
    try {
      localStorage.setItem("eventsSort", val);
    } catch {
    }
    setEvents((prev) => sortEvents(prev, val));
  }
  function toggleGroup() {
    const next = !groupByMonth;
    setGroupByMonth(next);
    try {
      localStorage.setItem("eventsGroupByMonth", next ? "1" : "0");
    } catch {
    }
  }
  const [activeTab, setActiveTab] = reactExports.useState(() => {
    try {
      return localStorage.getItem("planTripTab") || "catalog";
    } catch {
      return "catalog";
    }
  });
  reactExports.useEffect(() => {
    try {
      localStorage.setItem("planTripTab", activeTab);
    } catch {
    }
  }, [activeTab]);
  reactExports.useEffect(() => {
    if (simpleMode && activeTab !== "catalog") setActiveTab("catalog");
  }, [simpleMode, activeTab]);
  reactExports.useEffect(() => {
    const term = query.trim();
    const city = locFilters.city.trim();
    const country = locFilters.country.trim();
    if (simpleMode) {
      setEvents([]);
      setEventsError("");
      setEventsPage(1);
      setEventsHasMore(false);
      return;
    }
    if (!country && !city && term.length < 3) {
      setEvents([]);
      setEventsError("");
      setEventsPage(1);
      setEventsHasMore(false);
      return;
    }
    let alive = true;
    setEventsLoading(true);
    setEventsError("");
    const t = setTimeout(async () => {
      try {
        const { events: list, page, hasMore, countsBySource } = await searchEvents({ q: term || "", city, country, page: 1, limit: 8, includePast });
        if (!alive) return;
        setEvents(sortEvents(Array.isArray(list) ? list : [], eventsSort));
        setEventsPage(page || 1);
        setEventsHasMore(!!hasMore);
        setEventsSourceCounts(countsBySource || {});
      } catch (e) {
        if (!alive) return;
        setEvents([]);
        setEventsError("Could not load events right now.");
        setEventsPage(1);
        setEventsHasMore(false);
      } finally {
        if (alive) setEventsLoading(false);
      }
    }, 350);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [locFilters.city, locFilters.country, query, includePast, simpleMode, eventsSort]);
  function updateLocationParam(level, value) {
    const order = ["continent", "country", "province", "city", "area"];
    const params = new URLSearchParams(location.search);
    if (value) {
      params.set(level, value);
    } else {
      params.delete(level);
    }
    const idx = order.indexOf(level);
    for (let i = idx + 1; i < order.length; i++) params.delete(order[i]);
    navigate({ search: params.toString() ? `?${params.toString()}` : "" }, { replace: true });
  }
  function updateParam(key, value) {
    const params = new URLSearchParams(location.search);
    if (value) params.set(key, value);
    else params.delete(key);
    navigate({ search: params.toString() ? `?${params.toString()}` : "" }, { replace: true });
  }
  function clearLocationFilters() {
    const params = new URLSearchParams(location.search);
    ["continent", "country", "province", "city", "area"].forEach((k) => params.delete(k));
    navigate({ search: params.toString() ? `?${params.toString()}` : "" }, { replace: true });
  }
  const filtered = reactExports.useMemo(() => {
    const q = query.trim().toLowerCase();
    let base = PRODUCTS;
    const { continent, country, province, city, area, category: _category } = locFilters;
    if (continent || country || province || city || area) {
      base = base.filter(
        (p) => (!continent || (p.continent || "").toLowerCase() === continent.toLowerCase()) && (!country || (p.country || "").toLowerCase() === country.toLowerCase()) && (!province || (p.province || "").toLowerCase() === province.toLowerCase()) && (!city || (p.city || "").toLowerCase() === city.toLowerCase()) && (!area || (p.area || "").toLowerCase() === area.toLowerCase())
      );
    }
    if (_category) {
      base = base.filter((p) => (p.category || "").toLowerCase() === _category.toLowerCase());
    }
    const min = Number(locFilters.priceMin || "");
    const max = Number(locFilters.priceMax || "");
    const hasMin = !Number.isNaN(min) && locFilters.priceMin !== "";
    const hasMax = !Number.isNaN(max) && locFilters.priceMax !== "";
    if (hasMin) {
      base = base.filter((p) => (Number(p.price) || 0) >= min);
    }
    if (hasMax) {
      base = base.filter((p) => (Number(p.price) || 0) <= max);
    }
    if (locFilters.freeOnly) {
      base = base.filter((p) => (Number(p.price) || 0) === 0);
    } else if (locFilters.paidOnly) {
      base = base.filter((p) => (Number(p.price) || 0) > 0);
    }
    if (!q) return base;
    return base.filter(
      (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || (p.continent || "").toLowerCase().includes(q) || (p.country || "").toLowerCase().includes(q) || (p.province || "").toLowerCase().includes(q) || (p.city || "").toLowerCase().includes(q) || (p.area || "").toLowerCase().includes(q)
    );
  }, [query, locFilters]);
  const sortedFiltered = reactExports.useMemo(() => {
    const arr = [...filtered];
    const q = query.trim().toLowerCase();
    if (catalogSort === "alpha") {
      return arr.sort((a, b) => String(a.title).localeCompare(String(b.title)));
    }
    if (catalogSort === "priceAsc") {
      return arr.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    }
    if (catalogSort === "priceDesc") {
      return arr.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    }
    if (!q) return arr;
    const score = (p) => {
      let s = 0;
      const t = String(p.title || "").toLowerCase();
      const d = String(p.description || "").toLowerCase();
      const c = String(p.category || "").toLowerCase();
      if (t.includes(q)) s += 5 + Math.max(0, 20 - t.indexOf(q));
      if (d.includes(q)) s += 2 + Math.max(0, 10 - d.indexOf(q));
      if (c.includes(q)) s += 3;
      return s;
    };
    return arr.sort((a, b) => score(b) - score(a));
  }, [filtered, catalogSort, query]);
  function highlight(text) {
    const term = query.trim();
    if (!term) return text;
    const safe = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(${safe})`, "ig");
    const parts = String(text).split(re);
    return parts.map(
      (part, i) => re.test(part) ? /* @__PURE__ */ jsxRuntimeExports.jsx("mark", { className: "bg-yellow-100 text-inherit p-0 rounded", children: part }, i) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: part }, i)
    );
  }
  const buildLocMaps = reactExports.useMemo(() => buildLocationMaps(PRODUCTS), []);
  const myLocation = reactExports.useMemo(() => loadMyLocation(), []);
  const [locModalOpen, setLocModalOpen] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("setLocation") === "1") {
      setLocModalOpen(true);
      params.delete("setLocation");
      navigate({ search: params.toString() ? `?${params.toString()}` : "" }, { replace: true });
    }
  }, [location.search, navigate]);
  function applySmartSearch() {
    const raw = query.trim();
    if (!raw) return;
    const lower = raw.toLowerCase();
    const connectors = [" in ", " near ", " around ", " at "];
    let pos = -1, conn = "";
    for (const c of connectors) {
      const i = lower.lastIndexOf(c);
      if (i > pos) {
        pos = i;
        conn = c;
      }
    }
    let left = raw, right = "";
    if (pos > 0) {
      left = raw.slice(0, pos).trim();
      right = raw.slice(pos + conn.length).trim();
    }
    const cat = detectCategory(left || raw);
    const { smartAliases } = loadSmartSettings();
    let loc = resolveLocationToken(right, buildLocMaps, smartAliases);
    if (Object.keys(loc).length === 0) {
      loc = longestLocationMatch(raw, buildLocMaps, smartAliases);
    }
    if (!cat && Object.keys(loc).length === 0) {
      return;
    }
    const keys = ["continent", "country", "province", "city", "area", "category", "q"];
    const params = new URLSearchParams(location.search);
    keys.forEach((k) => params.delete(k));
    if (cat) params.set("category", cat);
    Object.entries(loc).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setQuery("");
    navigate({ search: `?${params.toString()}` }, { replace: false });
    try {
      showToast && showToast(`Applied smart filters${cat ? ` • ${cat}` : ""}${Object.values(loc).length ? ` • ${Object.values(loc)[0]}` : ""}`, "success");
    } catch {
    }
  }
  const smartSuggestion = reactExports.useMemo(() => {
    const raw = (query || "").trim();
    if (!raw) return null;
    const { smartAliases } = loadSmartSettings();
    const s = getSuggestion(raw, { products: PRODUCTS, myLocation, enableAliases: smartAliases });
    if (!s) return null;
    const rest = { ...s.params };
    delete rest.category;
    return { text: s.label, count: s.count, cat: s.params.category, loc: rest };
  }, [query, myLocation]);
  const quickActions = reactExports.useMemo(() => {
    if (!Array.isArray(PRODUCTS) || PRODUCTS.length === 0) return [];
    const byCity = /* @__PURE__ */ new Map();
    for (const p of PRODUCTS) {
      const c = (p.city || "").trim();
      if (!c) continue;
      byCity.set(c, (byCity.get(c) || 0) + 1);
    }
    const topCities = Array.from(byCity.entries()).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([city, count]) => ({ city, count }));
    const makeCount = (params) => PRODUCTS.filter((pr) => {
      if (params.category && String(pr.category || "") !== params.category) return false;
      if (params.city && String(pr.city || "") !== params.city) return false;
      if (params.province && String(pr.province || "") !== params.province) return false;
      if (params.country && String(pr.country || "") !== params.country) return false;
      if (params.continent && String(pr.continent || "") !== params.continent) return false;
      if (params.area && String(pr.area || "") !== params.area) return false;
      return true;
    }).length;
    const actions = topCities.map(({ city }) => {
      const params = { category: "Lodging", city };
      return {
        label: `Hotels in ${city} (${makeCount(params)})`,
        params
      };
    });
    return actions;
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto px-2 sm:px-4 md:px-6 py-8 text-brand-russty", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-bold mb-1", children: "Trip Planner" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-4 text-brand-russty/80", children: "Plan your trip with simple, powerful filters." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "inline-flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: simpleMode, onChange: toggleSimpleMode }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Simple mode" })
      ] }) })
    ] }),
    !simpleMode && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AutoSyncBanner, { message: "Your quotes, itinerary, and bookings stay in sync in real time." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LiveTripProgress, { steps: computeProgress(trip, basket.length) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/quotes", className: "p-4 bg-cream-sand border border-cream-border rounded-md hover:bg-cream-hover transition", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Quotes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown/80", children: "Generate a proposal from paid basket items." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/itinerary", className: "p-4 bg-cream-sand border border-cream-border rounded-md hover:bg-cream-hover transition", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Itinerary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown/80", children: "All basket items populate your day plan." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative p-4 bg-cream-sand border border-cream-border rounded-md hover:shadow-lg transition flex flex-col items-center text-center space-y-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full h-full flex flex-col justify-between text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-base text-brand-brown", children: "Book Direct" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown/80 mt-2 mb-4", children: "Book and pay instantly for any product." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative z-10 self-start", style: { marginTop: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { as: Link, to: "/book", variant: "primary", size: "sm", "aria-label": "Open Direct Booking", children: "Book Now" }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-live": "polite", "aria-atomic": "true", className: "sr-only", children: toasts.map((t) => t.text).join(" ") }),
        directBookingOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/30 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DirectBookingModal, {}) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2", children: [
        showWeather && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-brand-russty/80", children: "Weather" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                className: "text-[11px] px-2 py-0.5 rounded border border-cream-border bg-white hover:bg-cream-hover",
                onClick: () => {
                  const next = !weatherCollapsed;
                  setWeatherCollapsed(next);
                  try {
                    localStorage.setItem("weatherCollapsed", next ? "1" : "0");
                  } catch {
                  }
                },
                "aria-expanded": !weatherCollapsed,
                children: weatherCollapsed ? "Expand" : "Collapse"
              }
            )
          ] }),
          !weatherCollapsed && /* @__PURE__ */ jsxRuntimeExports.jsx(WeatherWidget, { city: locFilters.city, country: locFilters.country })
        ] }),
        !simpleMode && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "tablist", "aria-label": "Plan Trip sections", className: "mb-3 flex border-b border-cream-border gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { role: "tab", "aria-selected": activeTab === "catalog", onClick: () => setActiveTab("catalog"), className: `px-3 py-2 text-sm -mb-px border-b-2 ${activeTab === "catalog" ? "border-brand-brown text-brand-brown" : "border-transparent text-brand-brown/60 hover:text-brand-brown"}`, children: "Catalog" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { role: "tab", "aria-selected": activeTab === "events", onClick: () => setActiveTab("events"), className: `px-3 py-2 text-sm -mb-px border-b-2 ${activeTab === "events" ? "border-brand-brown text-brand-brown" : "border-transparent text-brand-brown/60 hover:text-brand-brown"}`, children: "Events" })
        ] }),
        (simpleMode || activeTab === "catalog") && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 mb-3 sticky [top:calc(var(--header-h)+var(--banner-h))] z-[45] bg-cream/80 backdrop-blur supports-[backdrop-filter]:bg-cream/60 px-3 py-3 rounded border border-cream-border shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-xl text-brand-russty", children: "Product Catalog" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-brand-russty/60", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  sortedFiltered.length,
                  " results"
                ] }),
                showAdvanced && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "select",
                  {
                    "aria-label": "Sort catalog",
                    className: "text-xs px-2 py-1 border border-cream-border rounded bg-white",
                    value: catalogSort,
                    onChange: (e) => setCatalogSort(e.target.value),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "relevance", children: "Relevance" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "alpha", children: "A → Z" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "priceAsc", children: "Price: Low to High" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "priceDesc", children: "Price: High to Low" })
                    ]
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    ref: setSearchEl,
                    value: query,
                    onChange: (e) => {
                      setQuery(e.target.value);
                      const params = new URLSearchParams(location.search);
                      if (e.target.value) params.set("q", e.target.value);
                      else params.delete("q");
                      navigate({ search: params.toString() ? `?${params.toString()}` : "" }, { replace: true });
                    },
                    placeholder: "Search products, destinations, activities…",
                    title: "Press / to focus",
                    className: "w-full text-sm pl-3 pr-24 py-2.5 border border-cream-border rounded-md bg-white focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange outline-none",
                    "aria-label": "Search product catalog",
                    onKeyDown: (e) => {
                      if (e.key === "Escape") {
                        e.preventDefault();
                        const params = new URLSearchParams(location.search);
                        params.delete("q");
                        setQuery("");
                        navigate({ search: params.toString() ? `?${params.toString()}` : "" }, { replace: true });
                      } else if (e.key === "Enter") {
                        e.preventDefault();
                        applySmartSearch();
                      }
                    }
                  }
                ),
                smartSuggestion && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-2 top-1/2 -translate-y-1/2 text-xs inline-flex items-center gap-1", "aria-label": "Apply smart filters suggestion", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "primary", size: "xs", onClick: applySmartSearch, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "🔎" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline truncate max-w-[6rem]", children: smartSuggestion.text })
                ] }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      className: "text-xs px-3 py-2 rounded-md border border-cream-border bg-white hover:bg-cream-hover flex items-center gap-1 whitespace-nowrap",
                      title: "Use my location",
                      onClick: () => {
                        const loc = loadMyLocation();
                        if (!loc || !loc.city && !loc.province && !loc.country) {
                          showToast("Set your location first", "warn");
                          return;
                        }
                        const params = new URLSearchParams(location.search);
                        ["continent", "country", "province", "city", "area", "category", "q"].forEach((k) => params.delete(k));
                        if (loc.city) params.set("city", loc.city);
                        else if (loc.province) params.set("province", loc.province);
                        else if (loc.country) params.set("country", loc.country);
                        navigate({ search: `?${params.toString()}` }, { replace: false });
                        showToast("Applied filters near your location", "success");
                      },
                      children: "📍 Near me"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      className: "text-xs px-3 py-2 rounded-md border border-cream-border bg-white hover:bg-cream-hover flex items-center gap-1 whitespace-nowrap",
                      title: "More filters and tools",
                      "aria-expanded": showAdvanced,
                      onClick: () => {
                        const next = !showAdvanced;
                        setShowAdvanced(next);
                        try {
                          localStorage.setItem("planTrip:showAdvanced:v2", next ? "1" : "0");
                        } catch {
                        }
                      },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: showAdvanced ? "🔼" : "🔽" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: showAdvanced ? "Hide" : "More" })
                      ]
                    }
                  )
                ] }),
                !simpleMode && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-brand-russty/60 italic", children: '💡 Try "Hotels in Durban" or "Safari in Kruger"' })
              ] })
            ] }),
            !simpleMode && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden md:block text-[11px] text-brand-russty/60", children: "Tip: try “Hotels in Durban”, then press Enter" }),
            showAdvanced && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-cream-border pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2", children: [
              quickActions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", role: "group", "aria-label": "Quick actions", children: quickActions.map((qa, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  className: "text-xs px-2 py-1 rounded border border-cream-border hover:bg-cream-muted focus:outline-none focus:ring-2 focus:ring-brand-russty/30",
                  onClick: () => {
                    const params = new URLSearchParams(location.search);
                    ["continent", "country", "province", "city", "area", "category", "q"].forEach((k) => params.delete(k));
                    Object.entries(qa.params).forEach(([k, v]) => v && params.set(k, v));
                    navigate({ search: `?${params.toString()}` }, { replace: false });
                    try {
                      showToast && showToast(`Applied ${qa.label.replace(/ \(.*\)$/, "")}`, "success");
                    } catch {
                    }
                  },
                  children: qa.label
                },
                idx
              )) }),
              !simpleMode && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "select",
                  {
                    value: selectedPreset,
                    onChange: (e) => {
                      setSelectedPreset(e.target.value);
                      if (e.target.value) applyPreset(e.target.value);
                    },
                    className: "text-xs px-2 py-1 border border-cream-border rounded bg-white",
                    "aria-label": "Apply preset",
                    title: "Apply preset",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Presets…" }),
                      presets.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: p.name, children: p.name }, p.name))
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    value: presetName,
                    onChange: (e) => setPresetName(e.target.value),
                    placeholder: "Preset name",
                    className: "text-xs px-2 py-1 border border-cream-border rounded bg-white",
                    "aria-label": "Preset name"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: savePreset, className: "text-xs px-2 py-1 rounded border border-cream-border bg-white hover:bg-cream-hover", title: "Save current filters as preset", children: "Save" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: !selectedPreset, onClick: () => deletePreset(selectedPreset), className: "text-xs px-2 py-1 rounded border border-cream-border bg-white hover:bg-cream-hover disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed", title: "Delete selected preset", children: "Delete" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-[11px] text-brand-brown/70 inline-flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Min" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "number",
                      inputMode: "numeric",
                      min: "0",
                      value: locFilters.priceMin,
                      onChange: (e) => updateParam("priceMin", e.target.value),
                      className: `w-20 text-[11px] px-2 py-1 border rounded bg-white ${(() => {
                        const min = Number(locFilters.priceMin || "");
                        const max = Number(locFilters.priceMax || "");
                        const hasMin = !Number.isNaN(min) && locFilters.priceMin !== "";
                        const hasMax = !Number.isNaN(max) && locFilters.priceMax !== "";
                        return hasMin && hasMax && min > max ? "border-red-400" : "border-cream-border";
                      })()}`,
                      "aria-label": "Minimum price",
                      placeholder: "Min"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-[11px] text-brand-brown/70 inline-flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Max" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "number",
                      inputMode: "numeric",
                      min: "0",
                      value: locFilters.priceMax,
                      onChange: (e) => updateParam("priceMax", e.target.value),
                      className: `w-20 text-[11px] px-2 py-1 border rounded bg-white ${(() => {
                        const min = Number(locFilters.priceMin || "");
                        const max = Number(locFilters.priceMax || "");
                        const hasMin = !Number.isNaN(min) && locFilters.priceMin !== "";
                        const hasMax = !Number.isNaN(max) && locFilters.priceMax !== "";
                        return hasMin && hasMax && min > max ? "border-red-400" : "border-cream-border";
                      })()}`,
                      "aria-label": "Maximum price",
                      placeholder: "Max"
                    }
                  )
                ] }),
                (() => {
                  const min = Number(locFilters.priceMin || "");
                  const max = Number(locFilters.priceMax || "");
                  const hasMin = !Number.isNaN(min) && locFilters.priceMin !== "";
                  const hasMax = !Number.isNaN(max) && locFilters.priceMax !== "";
                  if (hasMin && hasMax && min > max) {
                    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { role: "alert", className: "text-[11px] text-red-600", children: "Min is greater than Max" });
                  }
                  return null;
                })(),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-[11px] text-brand-brown/70 inline-flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "checkbox",
                      checked: !!locFilters.paidOnly,
                      onChange: (e) => {
                        const checked = e.target.checked;
                        updateParam("paidOnly", checked ? "1" : "");
                        if (checked) {
                          updateParam("freeOnly", "");
                        }
                      },
                      "aria-label": "Paid items only",
                      disabled: !!locFilters.freeOnly
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Paid only" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-[11px] text-brand-brown/70 inline-flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "checkbox",
                      checked: !!locFilters.freeOnly,
                      onChange: (e) => {
                        const checked = e.target.checked;
                        updateParam("freeOnly", checked ? "1" : "");
                        if (checked) {
                          updateParam("paidOnly", "");
                        }
                      },
                      "aria-label": "Free items only",
                      disabled: !!locFilters.paidOnly
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Free only" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: async () => {
                      try {
                        const url = window.location.href;
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                          await navigator.clipboard.writeText(url);
                        } else {
                          const ta = document.createElement("textarea");
                          ta.value = url;
                          ta.setAttribute("readonly", "");
                          ta.style.position = "absolute";
                          ta.style.left = "-9999px";
                          document.body.appendChild(ta);
                          ta.select();
                          document.execCommand("copy");
                          document.body.removeChild(ta);
                        }
                        setCopyLinkStatus("ok");
                        showToast("Link copied", "success");
                        setTimeout(() => setCopyLinkStatus(""), 1500);
                      } catch {
                        setCopyLinkStatus("err");
                        showToast("Copy failed", "error");
                        setTimeout(() => setCopyLinkStatus(""), 2e3);
                      }
                    },
                    className: "text-xs px-2 py-1 rounded border border-cream-border bg-white hover:bg-cream-hover",
                    title: "Copy shareable link",
                    "aria-label": "Copy shareable link",
                    children: "Copy link"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => {
                      const params = new URLSearchParams(location.search);
                      ["continent", "country", "province", "city", "area", "category", "priceMin", "priceMax", "paidOnly", "freeOnly", "q"].forEach((k) => params.delete(k));
                      setQuery("");
                      navigate({ search: "" }, { replace: true });
                    },
                    className: "text-xs px-2 py-1 rounded border border-cream-border bg-white hover:bg-cream-hover",
                    title: "Reset filters and search",
                    children: "Reset"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    className: "text-[11px] px-2 py-1 rounded border border-cream-border bg-white hover:bg-cream-hover",
                    title: "Set my location",
                    onClick: () => setLocModalOpen(true),
                    children: "Set my location"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-live": "polite", className: "sr-only", children: copyLinkStatus === "ok" ? "Link copied" : copyLinkStatus === "err" ? "Copy failed" : "" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "aria-live": "polite", role: "status", className: "sr-only", children: [
            sortedFiltered.length,
            " results in catalog"
          ] }),
          showAdvanced && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: advancedFiltersRef, className: "flex flex-wrap gap-2 sm:gap-2.5 md:gap-3 mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: locFilters.continent,
                onChange: (e) => updateLocationParam("continent", e.target.value),
                className: "text-xs px-2 py-1 border border-cream-border rounded bg-white",
                "aria-label": "Filter by continent",
                title: "Filter by continent",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All continents" }),
                  continents.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: c, children: [
                    c,
                    " ",
                    counts.continent[c] ? `(${counts.continent[c]})` : ""
                  ] }, c))
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: locFilters.country,
                onChange: (e) => updateLocationParam("country", e.target.value),
                className: "text-xs px-2 py-1 border border-cream-border rounded bg-white",
                "aria-label": "Filter by country",
                title: "Filter by country",
                disabled: !countries.length,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All countries" }),
                  countries.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: c, children: [
                    c,
                    " ",
                    counts.country[c] ? `(${counts.country[c]})` : ""
                  ] }, c))
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: locFilters.province,
                onChange: (e) => updateLocationParam("province", e.target.value),
                className: "text-xs px-2 py-1 border border-cream-border rounded bg-white",
                "aria-label": "Filter by province",
                title: "Filter by province",
                disabled: !provinces.length,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All provinces" }),
                  provinces.map((pv) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: pv, children: [
                    pv,
                    " ",
                    counts.province[pv] ? `(${counts.province[pv]})` : ""
                  ] }, pv))
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: locFilters.city,
                onChange: (e) => updateLocationParam("city", e.target.value),
                className: "text-xs px-2 py-1 border border-cream-border rounded bg-white",
                "aria-label": "Filter by city",
                title: "Filter by city",
                disabled: !cities.length,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All cities" }),
                  cities.map((ct) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: ct, children: [
                    ct,
                    " ",
                    counts.city[ct] ? `(${counts.city[ct]})` : ""
                  ] }, ct))
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: locFilters.area,
                onChange: (e) => updateLocationParam("area", e.target.value),
                className: "text-xs px-2 py-1 border border-cream-border rounded bg-white",
                "aria-label": "Filter by area",
                title: "Filter by area",
                disabled: !areas.length,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All areas" }),
                  areas.map((ar) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: ar, children: [
                    ar,
                    " ",
                    counts.area[ar] ? `(${counts.area[ar]})` : ""
                  ] }, ar))
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: locFilters.category,
                onChange: (e) => updateParam("category", e.target.value),
                className: "text-xs px-2 py-1 border border-cream-border rounded bg-white",
                "aria-label": "Filter by category",
                title: "Filter by category",
                disabled: !categories.length,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All categories" }),
                  categories.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: cat, children: [
                    cat,
                    " ",
                    counts.category[cat] ? `(${counts.category[cat]})` : ""
                  ] }, cat))
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-live": "polite", className: "sr-only", children: presetStatus === "saved" ? "Preset saved" : presetStatus === "applied" ? "Preset applied" : presetStatus === "deleted" ? "Preset deleted" : "" }),
          !simpleMode && showAdvanced && recentFilters.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-brand-brown/60 mr-1", children: "Recent:" }),
            recentFilters.map((r, idx) => {
              const f = r.filters || {};
              const labelParts = ["city", "province", "country", "area", "category", "continent"].map((k) => f[k]).filter(Boolean);
              const label = labelParts.join(" • ").slice(0, 40) + (labelParts.join(" • ").length > 40 ? "…" : "");
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => applyFilters(f),
                  className: "text-[11px] px-2 py-1 rounded-full border border-cream-border bg-white hover:bg-cream-hover",
                  title: labelParts.join(" • "),
                  children: label || "Unnamed"
                },
                r.signature || idx
              );
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => {
                  setRecentFilters([]);
                  try {
                    localStorage.setItem("planTripRecentFilters:v1", "[]");
                  } catch {
                  }
                  showToast("Recent filters cleared", "info");
                },
                className: "text-[11px] px-2 py-1 rounded-full border border-cream-border bg-white hover:bg-cream-hover",
                title: "Clear recent filters",
                children: "Clear recents"
              }
            )
          ] }),
          (locFilters.continent || locFilters.country || locFilters.province || locFilters.city || locFilters.area || locFilters.category || locFilters.priceMin || locFilters.priceMax || locFilters.paidOnly || locFilters.freeOnly) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-1.5 sm:gap-2 mb-4", children: [
            ["continent", "country", "province", "city", "area"].map((k) => locFilters[k] ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => updateLocationParam(k, ""),
                className: "text-xs px-2 py-1 rounded-full border border-cream-border bg-cream hover:bg-cream-hover focus:outline-none focus:ring-2 focus:ring-brand-russty/30 transition",
                title: `Clear ${k}`,
                "aria-label": `Clear ${k} filter: ${locFilters[k]}`,
                children: [
                  k,
                  ": ",
                  locFilters[k],
                  " ×"
                ]
              },
              k
            ) : null),
            locFilters.category ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => updateParam("category", ""),
                className: "text-xs px-2 py-1 rounded-full border border-cream-border bg-cream hover:bg-cream-hover focus:outline-none focus:ring-2 focus:ring-brand-russty/30 transition",
                title: `Clear category`,
                "aria-label": `Clear category filter: ${locFilters.category}`,
                children: [
                  "category: ",
                  locFilters.category,
                  " ×"
                ]
              }
            ) : null,
            locFilters.priceMin ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => updateParam("priceMin", ""),
                className: "text-xs px-2 py-1 rounded-full border border-cream-border bg-cream hover:bg-cream-hover focus:outline-none focus:ring-2 focus:ring-brand-russty/30 transition",
                title: "Clear minimum price",
                "aria-label": `Clear minimum price filter: ${locFilters.priceMin}`,
                children: [
                  "min: ",
                  locFilters.priceMin,
                  " ×"
                ]
              }
            ) : null,
            locFilters.priceMax ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => updateParam("priceMax", ""),
                className: "text-xs px-2 py-1 rounded-full border border-cream-border bg-cream hover:bg-cream-hover focus:outline-none focus:ring-2 focus:ring-brand-russty/30 transition",
                title: "Clear maximum price",
                "aria-label": `Clear maximum price filter: ${locFilters.priceMax}`,
                children: [
                  "max: ",
                  locFilters.priceMax,
                  " ×"
                ]
              }
            ) : null,
            locFilters.paidOnly ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => updateParam("paidOnly", ""),
                className: "text-xs px-2 py-1 rounded-full border border-cream-border bg-cream hover:bg-cream-hover focus:outline-none focus:ring-2 focus:ring-brand-russty/30 transition",
                title: "Clear paid only",
                "aria-label": `Clear paid only filter`,
                children: "paid only ×"
              }
            ) : null,
            locFilters.freeOnly ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => updateParam("freeOnly", ""),
                className: "text-xs px-2 py-1 rounded-full border border-cream-border bg-cream hover:bg-cream-hover focus:outline-none focus:ring-2 focus:ring-brand-brown/30 transition",
                title: "Clear free only",
                "aria-label": `Clear free only filter`,
                children: "free only ×"
              }
            ) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: clearLocationFilters,
                className: "text-[11px] px-2 py-1 rounded-full border border-cream-border bg-white hover:bg-cream-hover text-brand-russty/80 focus:outline-none focus:ring-2 focus:ring-brand-russty/30 transition",
                title: "Clear all location filters",
                "aria-label": "Clear all location filters",
                children: "Clear filters"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-3", children: [
            sortedFiltered.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "p-4 rounded border bg-cream-sand border-cream-border flex flex-col md:flex-row md:items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  sortedFiltered.length,
                  " results"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-brand-russty/70", children: highlight(p.description) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-brand-russty/50", children: [
                  p.category,
                  " • ",
                  p.price > 0 ? `Price: $${p.price}` : "Included / No charge"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-brand-russty/60 mt-0.5", children: p.province || p.country || p.city ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  p.province ? `${p.province}, ` : "",
                  p.city || p.country,
                  p.area ? ` • ${p.area}` : ""
                ] }) : null })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => addToBasket(p), className: "px-3 py-1.5 text-xs rounded border border-brand-russty hover:bg-cream-hover", children: "Add" })
            ] }, p.id)),
            sortedFiltered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "text-sm text-brand-russty/60 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "No results." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: clearLocationFilters, className: "text-brand-russty underline hover:no-underline", children: "Clear filters" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "or" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
                const params = new URLSearchParams(location.search);
                ["continent", "country", "province", "city", "area", "category", "priceMin", "priceMax", "paidOnly", "q"].forEach((k) => params.delete(k));
                setQuery("");
                navigate({ search: "" }, { replace: true });
              }, className: "text-brand-russty underline hover:no-underline", children: "Reset all" })
            ] })
          ] })
        ] }),
        !simpleMode && activeTab === "events" && (locFilters.country || locFilters.city || query.trim().length >= 3) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline justify-between mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "font-semibold", children: [
              "Events ",
              locFilters.city ? `• ${locFilters.city}` : locFilters.country ? `• ${locFilters.country}` : ""
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-[12px] text-brand-brown/70 inline-flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: includePast, onChange: toggleIncludePast }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Include past" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-[12px] text-brand-brown/70 inline-flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: groupByMonth, onChange: toggleGroup }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Group by month" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-[12px] text-brand-brown/70 inline-flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Sort" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "select",
                  {
                    "aria-label": "Sort events by date",
                    className: "text-[12px] px-1.5 py-0.5 border border-cream-border rounded bg-white",
                    value: eventsSort,
                    onChange: (e) => onChangeSort(e.target.value),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "dateAsc", children: "Soonest first" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "dateDesc", children: "Latest first" })
                    ]
                  }
                )
              ] }),
              eventsLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-brand-brown/60", children: "Loading…" })
            ] })
          ] }),
          eventsError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { role: "alert", className: "text-xs text-red-600 mb-2", children: eventsError }),
          !eventsLoading && events.length === 0 && !eventsError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-brand-brown/70 bg-cream-sand border border-cream-border rounded p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium mb-1", children: "No events found." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-4 space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Try a broader search term or clear the search box." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Select just a country (and remove city) to widen results." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "On Settings, enable “Show demo events” to visualize the experience." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Link,
              {
                to: "/settings",
                className: "inline-block px-2.5 py-1 text-xs rounded border border-cream-border bg-white hover:bg-cream-hover",
                children: "Open Settings"
              }
            ) })
          ] }),
          !groupByMonth && /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-2", children: [
            eventsLoading && events.length === 0 && Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "p-3 rounded border border-cream-border bg-white animate-pulse", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 bg-cream-sand/80 rounded w-2/3 mb-2" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 bg-cream-sand/70 rounded w-1/2" })
            ] }, `skeleton_${i}`)),
            events.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "p-3 rounded border border-cream-border bg-white flex flex-col md:flex-row md:items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium truncate", children: [
                  e.name,
                  " ",
                  e.source === "Demo" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-[10px] px-1 py-0.5 rounded bg-cream-sand border border-cream-border align-middle", children: "Demo" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[12px] text-brand-brown/70 truncate", children: [
                  [e.venue, e.city, e.country].filter(Boolean).length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    [e.venue, e.city, e.country].filter(Boolean).join(", "),
                    " ",
                    e.date ? `• ${new Date(e.date).toLocaleDateString()}` : ""
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: e.date ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-1 py-0.5 mr-1 rounded bg-cream-sand border border-cream-border align-middle", children: new Date(e.date).toLocaleDateString() }) : null }),
                  " ",
                  "• ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-1 py-0.5 text-[10px] rounded bg-cream-sand border border-cream-border align-middle", children: e.source })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                e.url && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: e.url, target: "_blank", rel: "noreferrer", className: "px-2 py-1 text-xs rounded border border-cream-border hover:bg-cream-hover", children: "Open" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => addToBasket({
                      id: `ev_${e.source}_${e.id}`,
                      title: e.name,
                      description: [e.venue, e.city, e.country, e.date && new Date(e.date).toLocaleDateString()].filter(Boolean).join(" • "),
                      category: "Event",
                      price: 0,
                      url: e.url || "",
                      source: e.source
                    }),
                    className: "px-3 py-1.5 text-xs rounded border border-brand-brown hover:bg-cream-hover",
                    children: "Add"
                  }
                )
              ] })
            ] }, `ev_${e.source}_${e.id}`))
          ] }),
          groupByMonth && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: (() => {
            const byMonth = /* @__PURE__ */ new Map();
            for (const e of events) {
              let label = "Unknown date";
              if (e?.date) {
                const d = new Date(e.date);
                if (!Number.isNaN(d.valueOf())) {
                  label = d.toLocaleString(void 0, { month: "long", year: "numeric" });
                }
              }
              if (!byMonth.has(label)) byMonth.set(label, []);
              byMonth.get(label).push(e);
            }
            const entries = Array.from(byMonth.entries());
            return entries.map(([label, list]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "text-sm font-semibold text-brand-brown/80 mb-2", children: label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: list.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "p-3 rounded border border-cream-border bg-white flex flex-col md:flex-row md:items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium truncate", children: [
                    e.name,
                    " ",
                    e.source === "Demo" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-[10px] px-1 py-0.5 rounded bg-cream-sand border border-cream-border align-middle", children: "Demo" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[12px] text-brand-brown/70 truncate", children: [
                    [e.venue, e.city, e.country].filter(Boolean).length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      [e.venue, e.city, e.country].filter(Boolean).join(", "),
                      " ",
                      e.date ? `• ${new Date(e.date).toLocaleDateString()}` : ""
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: e.date ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-1 py-0.5 mr-1 rounded bg-cream-sand border border-cream-border align-middle", children: new Date(e.date).toLocaleDateString() }) : null }),
                    " ",
                    "• ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-1 py-0.5 text-[10px] rounded bg-cream-sand border border-cream-border align-middle", children: e.source })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  e.url && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: e.url, target: "_blank", rel: "noreferrer", className: "px-2 py-1 text-xs rounded border border-cream-border hover:bg-cream-hover", children: "Open" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => addToBasket({
                        id: `ev_${e.source}_${e.id}`,
                        title: e.name,
                        description: [e.venue, e.city, e.country, e.date && new Date(e.date).toLocaleDateString()].filter(Boolean).join(" • "),
                        category: "Event",
                        price: 0,
                        url: e.url || "",
                        source: e.source
                      }),
                      className: "px-3 py-1.5 text-xs rounded border border-brand-brown hover:bg-cream-hover",
                      children: "Add"
                    }
                  )
                ] })
              ] }, `ev_${e.source}_${e.id}`)) })
            ] }, label));
          })() }),
          eventsHasMore && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: async () => {
                try {
                  setEventsLoading(true);
                  const term = query.trim();
                  const city = locFilters.city.trim();
                  const country = locFilters.country.trim();
                  const nextPage = (eventsPage || 1) + 1;
                  const { events: more, page, hasMore } = await searchEvents({ q: term || "", city, country, page: nextPage, limit: 8, includePast });
                  setEvents((prev) => mergeAndSort(prev, more, eventsSort));
                  setEventsPage(page || nextPage);
                  setEventsHasMore(!!hasMore);
                } catch {
                  setEventsError("Could not load more events.");
                } finally {
                  setEventsLoading(false);
                }
              },
              className: "px-3 py-1.5 text-xs rounded border border-cream-border bg-white hover:bg-cream-hover",
              children: "Load more"
            }
          ) }),
          Object.keys(eventsSourceCounts || {}).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 text-[12px] text-brand-brown/60", children: [
            "Sources: ",
            Object.entries(eventsSourceCounts).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 mr-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-1 py-0.5 rounded bg-cream-sand border border-cream-border", children: k }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: v })
            ] }, k))
          ] })
        ] })
      ] }),
      !simpleMode && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded border border-cream-border bg-cream p-4 h-fit sticky [top:calc(var(--header-h)+var(--banner-h)+2rem)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold", children: [
            "Basket (",
            basket.length,
            ")"
          ] }),
          !confirmClear && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setConfirmClear(true), className: "text-[11px] px-2 py-1 rounded border border-cream-border bg-white hover:bg-cream-hover", children: "Clear basket" }),
          confirmClear && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-brand-brown/70", children: "Confirm?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => {
                  setLastCleared(basket);
                  clearBasket();
                  setConfirmClear(false);
                  setUndoMsg("Basket cleared. Undo available for 10 seconds.");
                  if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
                  undoTimerRef.current = setTimeout(() => {
                    setUndoMsg("");
                    setLastCleared([]);
                  }, 1e4);
                  showToast("Basket cleared", "info");
                },
                className: "text-[11px] px-2 py-1 rounded border border-cream-border bg-white hover:bg-cream-hover",
                children: "Yes"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setConfirmClear(false), className: "text-[11px] px-2 py-1 rounded border border-cream-border bg-white hover:bg-cream-hover", children: "No" })
          ] })
        ] }),
        undoMsg && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 text-[12px] bg-cream-sand border border-cream-border rounded p-2 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: undoMsg }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                if (undoTimerRef.current) {
                  clearTimeout(undoTimerRef.current);
                  undoTimerRef.current = null;
                }
                const snapshot = lastCleared || [];
                snapshot.forEach((item) => addToBasket({ ...item }));
                setUndoMsg("Restored basket");
                setTimeout(() => setUndoMsg(""), 1200);
                setLastCleared([]);
                showToast("Basket restored", "success");
              },
              className: "text-[11px] px-2 py-1 rounded border border-cream-border bg-white hover:bg-cream-hover",
              children: "Undo"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-live": "polite", className: "sr-only", children: undoMsg }),
        basket.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          WorkflowPanel,
          {
            currentPage: "plan-trip",
            basketCount: basket.length,
            hasItinerary: false,
            hasQuote: false
          }
        ) }),
        toasts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed right-4 bottom-4 z-50 space-y-2", children: toasts.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `px-3 py-2 rounded shadow border text-sm ${t.type === "success" ? "bg-green-50 border-green-200 text-green-800" : t.type === "error" ? "bg-red-50 border-red-200 text-red-800" : t.type === "warn" ? "bg-yellow-50 border-yellow-200 text-yellow-800" : "bg-white border-cream-border text-brand-russty"}`, children: t.text }, t.id)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "aria-live": "polite", role: "status", className: "sr-only", children: [
          "Basket has ",
          basket.length,
          " item",
          basket.length === 1 ? "" : "s"
        ] }),
        basket.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-russty/60", children: "No items yet. Add from the catalog." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2 mb-4", children: basket.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "bg-white rounded border border-cream-border p-2 text-sm flex flex-col gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium truncate", children: item.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => removeFromBasket(item.id), className: "text-[10px] uppercase tracking-wide text-red-600 hover:text-red-500", children: "Remove" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 text-[11px] text-brand-russty/70", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.price > 0 ? formatCurrency(item.price, "USD") : "Included" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "• Qty" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: 1, value: item.quantity, onChange: (e) => updateQuantity(item.id, Number(e.target.value)), className: "w-14 px-1 py-0.5 border border-cream-border rounded" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "• Day" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: 1, value: item.day || 1, onChange: (e) => updateDay(item.id, e.target.value), className: "w-14 px-1 py-0.5 border border-cream-border rounded" })
          ] })
        ] }, item.id)) }),
        (() => {
          const paidTotal = paidItems.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-brand-russty/80 mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "All items appear in itinerary. Paid items appear in quotes." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
              "Paid total: ",
              formatCurrency(paidTotal, "USD")
            ] })
          ] });
        })(),
        basket.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MiniItineraryPreview, { basket }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: async () => {
                try {
                  const lines = [];
                  lines.push("Trip Basket Summary");
                  lines.push("");
                  basket.forEach((i) => {
                    const qty = Number(i.quantity) || 1;
                    const unit = Number(i.price) || 0;
                    const _lineTotal = unit * qty;
                    const loc = [i.city, i.province, i.country].filter(Boolean).join(", ");
                    lines.push(`- ${qty} x ${i.title}${unit > 0 ? ` @ ${formatCurrency(unit, "USD")}` : " (Included)"}${loc ? ` • ${loc}` : ""}`);
                  });
                  const paidTotal = paidItems.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0);
                  lines.push("");
                  lines.push(`Paid total: ${formatCurrency(paidTotal, "USD")}`);
                  const text = lines.join("\n");
                  if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(text);
                  } else {
                    const ta = document.createElement("textarea");
                    ta.value = text;
                    ta.setAttribute("readonly", "");
                    ta.style.position = "absolute";
                    ta.style.left = "-9999px";
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand("copy");
                    document.body.removeChild(ta);
                  }
                  setCopySummaryStatus("ok");
                  setTimeout(() => setCopySummaryStatus(""), 1500);
                } catch {
                  setCopySummaryStatus("err");
                  setTimeout(() => setCopySummaryStatus(""), 2e3);
                }
              },
              className: "px-2 py-1 text-xs rounded border border-cream-border bg-white hover:bg-cream-hover",
              title: "Copy basket summary",
              "aria-label": "Copy basket summary",
              children: "Copy summary"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-live": "polite", className: "sr-only", children: copySummaryStatus === "ok" ? "Basket summary copied" : copySummaryStatus === "err" ? "Copy failed" : "" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/quote/new", state: { fromBasket: true }, className: `block text-center px-3 py-2 rounded text-sm font-medium border ${paidItems.length ? "bg-brand-orange text-cream border-brand-orange hover:bg-brand-highlight" : "bg-cream-sand text-brand-russty/50 border-cream-border cursor-not-allowed"}`, children: [
          "Create Quote (",
          paidItems.length,
          ")"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-[calc(var(--footer-h)+1rem)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/bookings", className: "p-4 bg-cream-sand border border-cream-border rounded-md hover:bg-cream-hover transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Bookings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-russty/80", children: "See all confirmations and status in one place." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/terms", className: "p-4 bg-cream-sand border border-cream-border rounded-md hover:bg-cream-hover transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Travel Safety & Terms" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-russty/80", children: "Know-before-you-go and policies." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/contact", className: "p-4 bg-cream-sand border border-cream-border rounded-md hover:bg-cream-hover transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Concierge" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-russty/80", children: "Need help? Our team is here." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      MyLocationModal,
      {
        open: locModalOpen,
        initial: myLocation,
        onClose: () => setLocModalOpen(false),
        onSave: (loc) => {
          persistMyLocation(loc);
          setLocModalOpen(false);
          showToast("Location saved", "success");
        }
      }
    )
  ] }) });
}
export {
  PlanTrip as default
};
//# sourceMappingURL=PlanTrip-CHGleIan.js.map

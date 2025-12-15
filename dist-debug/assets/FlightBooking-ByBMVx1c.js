import { r as reactExports, j as jsxRuntimeExports, R as React } from "./motion-D9fZRtSt.js";
import { B as BookingNav } from "./BookingNav-B1OTCtxJ.js";
import { G as Award, F as Filter, ab as ArrowUpDown, ac as ChevronLeft, w as ChevronRight, d as Plane, ad as Heart, o as Clock, x as Star, aj as Wifi, ak as Coffee, al as MonitorPlay, j as Briefcase, S as Shield, T as TrendingUp, n as CheckCircle2, a as DollarSign } from "./icons-C4AMPM7L.js";
import { B as Button } from "./Button-BvBK5int.js";
import { o as processBookingRewards } from "./index-DlOecmR0.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
const __vite_import_meta_env__ = {};
function FlightSelector({
  from,
  to,
  departDate,
  returnDate,
  passengers,
  onSelectFlight,
  onSkip,
  onCancel
}) {
  const _log = (level, ...args) => {
    if (!(__vite_import_meta_env__?.VITE_DEBUG_FLIGHTS === "1")) return;
    if (level === "error") console.error(...args);
    else if (level === "warn") console.warn(...args);
    else console.log(...args);
  };
  const [flights, setFlights] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [filterBy, setFilterBy] = reactExports.useState("all");
  const [sortBy, setSortBy] = reactExports.useState("recommended");
  const [favoriteFlights, setFavoriteFlights] = reactExports.useState([]);
  const [selectedFlight, setSelectedFlight] = reactExports.useState(null);
  const [preferredAirline, setPreferredAirline] = reactExports.useState("");
  const [preferredCabin, setPreferredCabin] = reactExports.useState("");
  const [maxStops, setMaxStops] = reactExports.useState(3);
  const [requiredAmenities, setRequiredAmenities] = reactExports.useState([]);
  const [canScrollLeft, setCanScrollLeft] = reactExports.useState(false);
  const [canScrollRight, setCanScrollRight] = reactExports.useState(false);
  const scrollContainerRef = reactExports.useRef(null);
  const fetchAvailableFlights = reactExports.useCallback(async () => {
    setLoading(true);
    const useDemo = (__vite_import_meta_env__?.VITE_DEMO_FLIGHTS ?? "1") === "1";
    const generateMockFlights = () => {
      const airlines2 = ["South African", "Lift", "FlySafair", "CemAir", "British Airways", "Ethiopian", "Qatar"];
      const cabins = ["economy", "premium_economy", "business"];
      const basePrice = 1200;
      const amenitiesPool = ["WiFi", "Meals", "Entertainment", "Power Outlets", "Checked Baggage"];
      const mkLeg = (legFrom, legTo, dayOffset = 0, depHour = 6) => {
        const dep = new Date(departDate);
        dep.setDate(dep.getDate() + dayOffset);
        dep.setHours(depHour);
        const durationMinutes = 60 + Math.floor(Math.random() * 180);
        const arr = new Date(dep.getTime() + durationMinutes * 6e4);
        return { departureTime: dep.toISOString(), arrivalTime: arr.toISOString(), durationMinutes };
      };
      const out = [];
      for (let i = 0; i < 12; i++) {
        const name = airlines2[i % airlines2.length];
        const stops = i % 3;
        const cabin = cabins[i % cabins.length];
        const leg = mkLeg(from, to, 0, 6 + i % 10);
        const priceMult = (1 + stops * 0.15) * (cabin === "business" ? 2.2 : cabin === "premium_economy" ? 1.35 : 1);
        const price = Math.round(basePrice * priceMult / 10) * 10;
        const amenities = amenitiesPool.filter((_, idx) => (i + idx) % 2 === 0).slice(0, 4);
        const rating = 3.6 + Math.random() * 1.3;
        const reviewCount = 400 + Math.floor(Math.random() * 3600);
        out.push({
          id: `FL-${Date.now()}-${i}`,
          airline: { name, rating, reviewCount },
          flightNumber: `${name.slice(0, 2).toUpperCase()}${100 + i}`,
          from,
          to,
          ...leg,
          stops,
          cabin,
          amenities,
          baggageIncluded: amenities.includes("Checked Baggage"),
          refundable: Math.random() > 0.5,
          isPremium: cabin !== "economy",
          price,
          pricePerPerson: Math.round(price / Math.max(1, passengers))
        });
      }
      return out;
    };
    try {
      _log("log", "[FlightSelector] Fetching flights for:", { from, to, departDate, returnDate, passengers });
      const response = await fetch("/api/flights/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to,
          departDate,
          returnDate,
          passengers
        })
      });
      if (response.ok) {
        const data = await response.json();
        const list = data.flights || [];
        setFlights(list.length ? list : useDemo ? generateMockFlights() : []);
      } else {
        _log("error", "[FlightSelector] Failed to fetch flights");
        setFlights(useDemo ? generateMockFlights() : []);
      }
    } catch (error) {
      _log("error", "[FlightSelector] Error fetching flights:", error);
      setFlights(useDemo ? generateMockFlights() : []);
    } finally {
      setLoading(false);
    }
  }, [from, to, departDate, returnDate, passengers]);
  const loadFavoriteFlights = reactExports.useCallback(() => {
    try {
      const saved = localStorage.getItem("colleco.favoriteFlights");
      if (saved) {
        setFavoriteFlights(JSON.parse(saved));
      }
    } catch (error) {
      _log("error", "[FlightSelector] Error loading favorites:", error);
    }
  }, []);
  reactExports.useEffect(() => {
    fetchAvailableFlights();
    loadFavoriteFlights();
  }, [fetchAvailableFlights, loadFavoriteFlights]);
  reactExports.useEffect(() => {
    const checkScrollButtons = () => {
      const container2 = scrollContainerRef.current;
      if (!container2) return;
      setCanScrollLeft(container2.scrollTop > 0);
      setCanScrollRight(
        container2.scrollTop < container2.scrollHeight - container2.clientHeight - 10
      );
    };
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollButtons);
      const handleKeyDown = (e) => {
        const c = scrollContainerRef.current;
        if (!c) return;
        if (e.key === "ArrowUp") {
          e.preventDefault();
          c.scrollBy({ top: -300, behavior: "smooth" });
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          c.scrollBy({ top: 300, behavior: "smooth" });
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        container.removeEventListener("scroll", checkScrollButtons);
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [flights]);
  const scrollUp = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ top: -300, behavior: "smooth" });
    }
  };
  const scrollDown = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ top: 300, behavior: "smooth" });
    }
  };
  const toggleFavorite = (flightId) => {
    const newFavorites = favoriteFlights.includes(flightId) ? favoriteFlights.filter((id) => id !== flightId) : [...favoriteFlights, flightId];
    setFavoriteFlights(newFavorites);
    localStorage.setItem("colleco.favoriteFlights", JSON.stringify(newFavorites));
  };
  const scoreFlight = (flight) => {
    let score = 0;
    const stopsScore = (3 - flight.stops) * 10;
    const durationScore = Math.max(0, 20 - flight.durationMinutes / 60);
    score += stopsScore + durationScore;
    const avgPrice = flights.reduce((sum, f) => sum + f.price, 0) / flights.length;
    const priceScore = (1 - flight.price / (avgPrice * 1.5)) * 35;
    score += Math.max(0, priceScore);
    const ratingScore = flight.airline.rating / 5 * 15;
    const reviewScore = Math.min(10, flight.airline.reviewCount / 5e3 * 10);
    score += ratingScore + reviewScore;
    if (flight.stops === 0) score += 5;
    if (flight.amenities.includes("WiFi")) score += 2;
    if (flight.amenities.includes("Meals")) score += 2;
    if (flight.baggageIncluded) score += 3;
    if (flight.refundable) score += 3;
    if (flight.isPremium) score += 5;
    return Math.round(score);
  };
  const autoPickBestFlight = () => {
    if (flights.length === 0) return;
    const scoredFlights = flights.map((flight) => ({
      ...flight,
      smartScore: scoreFlight(flight)
    }));
    const best = scoredFlights.reduce(
      (max, flight) => flight.smartScore > max.smartScore ? flight : max
    );
    setSelectedFlight(best);
    onSelectFlight(best);
  };
  const getFilteredAndSortedFlights = () => {
    let filtered = [...flights];
    if (preferredAirline) {
      filtered = filtered.filter(
        (f) => f.airline && f.airline.name && f.airline.name.toLowerCase().includes(preferredAirline.toLowerCase())
      );
    }
    if (preferredCabin) {
      filtered = filtered.filter(
        (f) => f.cabin && f.cabin.toLowerCase().includes(preferredCabin.toLowerCase())
      );
    }
    if (maxStops < 3) {
      filtered = filtered.filter((f) => f.stops <= maxStops);
    }
    if (requiredAmenities.length > 0) {
      filtered = filtered.filter(
        (f) => f.amenities && requiredAmenities.every(
          (amenity) => f.amenities.some((a) => a.toLowerCase().includes(amenity.toLowerCase()))
        )
      );
    }
    if (filterBy !== "all") {
      if (filterBy === "favorites") {
        filtered = filtered.filter((f) => favoriteFlights.includes(f.id));
      } else if (filterBy === "direct") {
        filtered = filtered.filter((f) => f.stops === 0);
      } else if (filterBy === "1stop") {
        filtered = filtered.filter((f) => f.stops === 1);
      } else if (filterBy === "2stops") {
        filtered = filtered.filter((f) => f.stops === 2);
      } else if (filterBy === "premium") {
        filtered = filtered.filter((f) => f.isPremium);
      }
    }
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price_low":
          return a.price - b.price;
        case "price_high":
          return b.price - a.price;
        case "duration":
          return a.durationMinutes - b.durationMinutes;
        case "departure":
          return new Date(a.departureTime) - new Date(b.departureTime);
        case "recommended":
        default:
          return scoreFlight(b) - scoreFlight(a);
      }
    });
    return filtered;
  };
  const formatCurrency = (amount) => {
    return `R${amount.toLocaleString()}`;
  };
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  const formatTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
  };
  const filteredFlights = getFilteredAndSortedFlights();
  const airlines = [...new Set(flights.map((f) => f.airline.name))];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/50 z-modal flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 sm:p-6 border-b bg-gradient-to-r from-brand-orange to-orange-600", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: "Pick My Flight" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-white/90 text-sm", children: [
        from,
        " → ",
        to,
        " • ",
        passengers,
        " passenger",
        passengers !== 1 ? "s" : "",
        " • ",
        departDate,
        returnDate && ` - ${returnDate}`
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b bg-gray-50 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: autoPickBestFlight,
          className: "px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 text-sm font-medium",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-4 w-4" }),
            "Auto Smart Pick"
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: "Airline" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: preferredAirline,
              onChange: (e) => setPreferredAirline(e.target.value),
              className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-brand-orange focus:outline-none",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Any Airline" }),
                airlines.map((airline) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: airline, children: airline }, airline))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: "Cabin Class" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: preferredCabin,
              onChange: (e) => setPreferredCabin(e.target.value),
              className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-brand-orange focus:outline-none",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Any Class" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "economy", children: "Economy" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "premium_economy", children: "Premium Economy" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "business", children: "Business" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "first", children: "First Class" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: "Maximum Stops" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: maxStops,
              onChange: (e) => setMaxStops(Number(e.target.value)),
              className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-brand-orange focus:outline-none",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "3", children: "Any" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "0", children: "Direct Only" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "1", children: "Max 1 Stop" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "2", children: "Max 2 Stops" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: "Required Amenities" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              multiple: true,
              value: requiredAmenities,
              onChange: (e) => setRequiredAmenities(Array.from(e.target.selectedOptions, (option) => option.value)),
              className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-brand-orange focus:outline-none",
              size: 3,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "WiFi", children: "WiFi" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Meals", children: "Meals Included" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Entertainment", children: "Entertainment" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Power Outlets", children: "Power Outlets" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Filter, { className: "h-4 w-4 text-gray-500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: filterBy,
              onChange: (e) => setFilterBy(e.target.value),
              className: "px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:border-brand-orange focus:outline-none",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All Flights" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "favorites", children: "Favorites" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "direct", children: "Direct Only" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "1stop", children: "1 Stop" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "2stops", children: "2 Stops" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "premium", children: "Premium Only" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpDown, { className: "h-4 w-4 text-gray-500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: sortBy,
              onChange: (e) => setSortBy(e.target.value),
              className: "px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:border-brand-orange focus:outline-none",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "recommended", children: "Recommended" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "price_low", children: "Price: Low to High" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "price_high", children: "Price: High to Low" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "duration", children: "Shortest Duration" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "departure", children: "Earliest Departure" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-gray-600 ml-auto", children: [
          filteredFlights.length,
          " flight",
          filteredFlights.length !== 1 ? "s" : "",
          " available"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-4 relative", ref: scrollContainerRef, children: [
      canScrollLeft && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: scrollUp,
          className: "fixed top-1/2 left-4 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors border-2 border-gray-200",
          "aria-label": "Scroll up",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-6 w-6 text-brand-orange rotate-90" })
        }
      ),
      canScrollRight && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: scrollDown,
          className: "fixed bottom-32 left-4 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors border-2 border-gray-200",
          "aria-label": "Scroll down",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-6 w-6 text-brand-orange rotate-90" })
        }
      ),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-4 border-brand-orange border-t-transparent" }) }) : filteredFlights.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plane, { className: "h-16 w-16 text-gray-300 mx-auto mb-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500", children: "No flights match your criteria" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setFilterBy("all");
              setPreferredAirline("");
              setPreferredCabin("");
              setMaxStops(3);
              setRequiredAmenities([]);
            },
            className: "mt-4 text-brand-orange hover:underline text-sm",
            children: "Clear all filters"
          }
        )
      ] }) : filteredFlights.map((flight) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          onClick: () => setSelectedFlight(flight),
          className: `mb-4 border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg ${selectedFlight?.id === flight.id ? "border-brand-orange bg-orange-50" : "border-gray-200 hover:border-brand-orange/50"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plane, { className: "h-6 w-6 text-gray-600" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg text-brand-brown", children: flight.airline.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
                    "Flight ",
                    flight.flightNumber
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: (e) => {
                    e.stopPropagation();
                    toggleFavorite(flight.id);
                  },
                  className: "p-2 hover:bg-gray-100 rounded-full transition-colors",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Heart,
                    {
                      className: `h-5 w-5 ${favoriteFlights.includes(flight.id) ? "fill-red-500 text-red-500" : "text-gray-400"}`
                    }
                  )
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl sm:text-2xl font-bold text-brand-brown", children: formatTime(flight.departureTime) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: flight.from })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-600", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px bg-gray-300 flex-1" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: formatDuration(flight.durationMinutes) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px bg-gray-300 flex-1" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-1", children: flight.stops === 0 ? "Direct" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}` })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-brand-brown", children: formatTime(flight.arrivalTime) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: flight.to })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mb-3 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-1 bg-gray-100 rounded capitalize", children: flight.cabin.replace("_", " ") }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-4 w-4 text-brand-gold" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: flight.airline.rating.toFixed(1) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500", children: [
                  "(",
                  flight.airline.reviewCount,
                  " reviews)"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 mb-3", children: flight.amenities.map((amenity, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "span",
              {
                className: "px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full flex items-center gap-1",
                children: [
                  amenity === "WiFi" && /* @__PURE__ */ jsxRuntimeExports.jsx(Wifi, { className: "h-3 w-3" }),
                  amenity === "Meals" && /* @__PURE__ */ jsxRuntimeExports.jsx(Coffee, { className: "h-3 w-3" }),
                  amenity === "Entertainment" && /* @__PURE__ */ jsxRuntimeExports.jsx(MonitorPlay, { className: "h-3 w-3" }),
                  amenity === "Checked Baggage" && /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { className: "h-3 w-3" }),
                  amenity
                ]
              },
              idx
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mb-3", children: [
              flight.isPremium && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-3 w-3" }),
                "Premium Service"
              ] }),
              flight.baggageIncluded && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { className: "h-3 w-3" }),
                "Baggage Included"
              ] }),
              flight.refundable && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-3 w-3" }),
                "Refundable"
              ] }),
              flight.stops === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 py-1 bg-orange-100 text-brand-orange text-xs rounded-full flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-3 w-3" }),
                "Direct Flight"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline justify-between pt-3 border-t", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-bold text-brand-orange", children: formatCurrency(flight.price) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-600 ml-2", children: "total" })
              ] }),
              flight.pricePerPerson && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500", children: [
                formatCurrency(flight.pricePerPerson),
                " per person"
              ] })
            ] })
          ]
        },
        flight.id
      ))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-t bg-gray-50 flex flex-wrap justify-between items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: onCancel,
            className: "px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm",
            children: "Cancel"
          }
        ),
        onSkip && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => onSkip(flights),
            className: "px-4 py-2 border border-brand-orange text-brand-orange rounded-lg hover:bg-orange-50 transition-colors text-sm",
            children: "Skip for now"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => selectedFlight && onSelectFlight(selectedFlight),
          disabled: !selectedFlight,
          className: "px-3 sm:px-6 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm sm:text-base",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "h-4 w-4" }),
            "Confirm Flight ",
            selectedFlight && `- ${formatCurrency(selectedFlight.price)}`
          ]
        }
      )
    ] })
  ] }) });
}
function FlightBooking() {
  const [from, setFrom] = reactExports.useState("");
  const [to, setTo] = reactExports.useState("");
  const [departDate, setDepartDate] = reactExports.useState("");
  const [returnDate, setReturnDate] = reactExports.useState("");
  const [isRoundTrip, setIsRoundTrip] = reactExports.useState(false);
  const [passengers, setPassengers] = reactExports.useState(1);
  const [cabinClass, setCabinClass] = reactExports.useState("economy");
  const [showFlightSelector, setShowFlightSelector] = reactExports.useState(false);
  const [selectedFlight, setSelectedFlight] = reactExports.useState(null);
  const [flightPending, setFlightPending] = reactExports.useState(false);
  const [availableFlights, setAvailableFlights] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [formErrors, setFormErrors] = reactExports.useState({});
  React.useEffect(() => {
    if (typeof window !== "undefined" && typeof window.scrollTo === "function") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const minReturn = departDate || today;
  function handleSkipFlightSelection(flights) {
    setAvailableFlights(flights);
    setShowFlightSelector(false);
    setFlightPending(true);
    setSelectedFlight(null);
  }
  async function autoAssignCheapestFlight() {
    if (!availableFlights || availableFlights.length === 0) {
      alert("No available flights to assign. Please try again.");
      return;
    }
    const cheapestFlight = availableFlights.reduce(
      (min, flight) => flight.price < min.price ? flight : min
    );
    await confirmFlightSelection(cheapestFlight);
  }
  function reopenFlightSelector() {
    setFlightPending(false);
    setShowFlightSelector(true);
  }
  async function confirmFlightSelection(flight) {
    setSelectedFlight(flight);
    setShowFlightSelector(false);
    setFlightPending(false);
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      const booking = {
        id: `FLT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: "flight",
        amount: flight.price * passengers,
        userId: localStorage.getItem("colleco.user.id") || "guest_" + Date.now(),
        checkInDate: new Date(departDate),
        flightNumber: flight.flightNumber,
        from,
        to,
        passengers,
        cabinClass
      };
      const result = processBookingRewards(booking);
      alert(`Flight ${flight.flightNumber} booked successfully! You earned ${result.pointsEarned} loyalty points! 🎉`);
      setLoading(false);
    } catch (error) {
      console.error("Booking failed:", error);
      alert("Booking failed. Please try again.");
      setLoading(false);
    }
  }
  async function handleSubmit(e) {
    e.preventDefault();
    const errors = {};
    if (!from || from.length < 3) errors.from = "Please enter a valid departure city";
    if (!to || to.length < 3) errors.to = "Please enter a valid destination";
    if (!departDate) errors.departDate = "Please select departure date";
    if (isRoundTrip && !returnDate) errors.returnDate = "Please select return date";
    if (isRoundTrip && returnDate && departDate && new Date(returnDate) <= new Date(departDate)) {
      errors.returnDate = "Return date must be after departure";
    }
    if (passengers < 1 || passengers > 9) errors.passengers = "Passengers must be between 1 and 9";
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setShowFlightSelector(true);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-cream min-h-screen overflow-x-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(BookingNav, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl sm:text-4xl font-bold tracking-tight text-brand-brown", children: "Flight Booking" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm sm:text-base text-brand-russty max-w-prose", children: "Compare flights from multiple airlines and find the best deals for your journey." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-cream-border p-6 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold text-brand-brown mb-4", children: "Search Flights" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "radio",
                  checked: !isRoundTrip,
                  onChange: () => setIsRoundTrip(false),
                  className: "accent-brand-orange"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "One-way" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "radio",
                  checked: isRoundTrip,
                  onChange: () => setIsRoundTrip(true),
                  className: "accent-brand-orange"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "Round-trip" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-2 text-sm font-semibold text-brand-brown", children: "From (City/Airport) *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  value: from,
                  onChange: (e) => setFrom(e.target.value),
                  required: true,
                  className: "w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors",
                  placeholder: "e.g., Durban (DUR)"
                }
              ),
              formErrors.from && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs mt-1", children: formErrors.from })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-2 text-sm font-semibold text-brand-brown", children: "To (City/Airport) *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  value: to,
                  onChange: (e) => setTo(e.target.value),
                  required: true,
                  className: "w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors",
                  placeholder: "e.g., Cape Town (CPT)"
                }
              ),
              formErrors.to && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs mt-1", children: formErrors.to })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-2 text-sm font-semibold text-brand-brown", children: "Departure Date *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "date",
                  value: departDate,
                  onChange: (e) => setDepartDate(e.target.value),
                  min: today,
                  required: true,
                  className: "w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
                }
              ),
              formErrors.departDate && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs mt-1", children: formErrors.departDate })
            ] }),
            isRoundTrip && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-2 text-sm font-semibold text-brand-brown", children: "Return Date *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "date",
                  value: returnDate,
                  onChange: (e) => setReturnDate(e.target.value),
                  min: minReturn,
                  required: isRoundTrip,
                  className: "w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
                }
              ),
              formErrors.returnDate && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs mt-1", children: formErrors.returnDate })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "passengers", className: "block mb-2 text-sm font-semibold text-brand-brown", children: "Passengers *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  id: "passengers",
                  type: "number",
                  min: 1,
                  max: 9,
                  value: passengers,
                  onChange: (e) => setPassengers(Number(e.target.value)),
                  required: true,
                  className: "w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors"
                }
              ),
              formErrors.passengers && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-xs mt-1", children: formErrors.passengers })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "cabinClass", className: "block mb-2 text-sm font-semibold text-brand-brown", children: "Cabin Class" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  id: "cabinClass",
                  value: cabinClass,
                  onChange: (e) => setCabinClass(e.target.value),
                  className: "w-full border-2 border-cream-border rounded-lg px-3 py-2 focus:border-brand-orange focus:outline-none transition-colors",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "economy", children: "Economy" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "premium_economy", children: "Premium Economy" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "business", children: "Business" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "first", children: "First Class" })
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", fullWidth: true, disabled: loading, children: loading ? "Processing..." : "Search Flights" })
        ] })
      ] }),
      flightPending && !loading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 border-2 border-brand-orange rounded-lg bg-orange-50 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-brand-orange flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-5 w-5 text-white" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-lg text-brand-brown mb-1", children: "Booking Pending - Choose Your Flight" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-russty", children: "Your search details are saved. Select your preferred flight to proceed." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg p-4 mb-4 border border-cream-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Route" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold text-brand-brown", children: [
              from,
              " → ",
              to
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Passengers" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold text-brand-brown", children: [
              passengers,
              " passenger",
              passengers !== 1 ? "s" : ""
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Departure" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown", children: departDate })
          ] }),
          isRoundTrip && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Return" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown", children: returnDate })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { fullWidth: true, onClick: reopenFlightSelector, className: "flex items-center justify-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plane, { className: "h-4 w-4" }),
            "Pick My Flight"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              fullWidth: true,
              variant: "outline",
              onClick: autoAssignCheapestFlight,
              className: "flex items-center justify-center gap-2 border-brand-orange text-brand-orange hover:bg-orange-50",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-4 w-4" }),
                "Auto-assign Cheapest Flight"
              ]
            }
          )
        ] })
      ] }),
      selectedFlight && !loading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-cream-border p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold text-brand-brown mb-4", children: "Booking Confirmed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Flight:" }),
              " ",
              selectedFlight.airline.name,
              " ",
              selectedFlight.flightNumber
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Route:" }),
              " ",
              selectedFlight.from,
              " → ",
              selectedFlight.to
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Cabin:" }),
              " ",
              selectedFlight.cabin.replace("_", " ")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Total Price:" }),
              " R",
              selectedFlight.price.toLocaleString()
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-cream-border p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold text-brand-brown mb-4", children: "Flight Terms & Conditions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown mb-1", children: "Cancellation Policy" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside space-y-1 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Free cancellation up to 7 days before departure" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "50% refund for cancellations 3-7 days before departure" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "No refund for cancellations within 72 hours of departure" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown mb-1", children: "Payment Terms" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside space-y-1 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Full payment required at time of booking" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Tickets are issued immediately upon payment" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Changes may incur additional fees" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown mb-1", children: "Airline Policies" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside space-y-1 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Valid passport required for international flights" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Baggage allowance depends on fare and airline" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Check-in closes 2 hours before departure (domestic), 3 hours (international)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Travel insurance highly recommended" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown mb-1", children: "Important Information" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside space-y-1 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Arrive at airport 2-3 hours before departure" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Confirmation email includes your booking reference" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Seat selection and meal preferences handled directly with airline" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Delays/cancellations: Check with airline for rebooking options" })
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-3", children: "Need Assistance?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 bg-green-50 border border-green-200 rounded-lg p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-5 w-5 text-green-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-green-900", children: "Flight Changes & Check-in - Contact Airline Directly" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-green-800 mb-3", children: "For seat selection, baggage, check-in, or flight status updates:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-green-700 font-medium", children: [
                  "Airline: ",
                  selectedFlight.airline.name
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-green-600", children: "Visit airline website or call their customer service" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-orange-50 border-2 border-brand-orange rounded-lg p-4 mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-6 w-6 text-brand-orange", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-brand-brown text-lg", children: "Zola - 24/7 Instant Help" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown mb-3", children: "Get instant answers about your booking, changes, cancellations, refunds, payment issues, and recommendations. Zola handles most requests immediately and routes complex issues to the right specialist." }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => {
                    window.dispatchEvent(new CustomEvent("openAIAgent"));
                    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
                  },
                  className: "w-full bg-brand-orange text-white font-semibold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" }) }),
                    "Chat with Zola Now"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600 mt-2 text-center", children: "Available 24/7 • Instant responses • Handles booking changes, queries & recommendations" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 border border-gray-200 rounded-lg p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-5 w-5 text-gray-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium text-gray-700 text-sm", children: "Need to Speak to a Specialist?" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600 mb-3", children: "If Zola can't resolve your issue, you'll be connected to our team:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500", children: "Email Support" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-700", children: "support@colleco.co.za" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Zola routes to specialist" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500", children: "Phone (Escalations)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-700", children: "+27 31 123 4567" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400", children: "Mon-Fri: 9AM-5PM" })
                ] })
              ] })
            ] })
          ] })
        ] })
      ] })
    ] }),
    showFlightSelector && /* @__PURE__ */ jsxRuntimeExports.jsx(
      FlightSelector,
      {
        from,
        to,
        departDate,
        returnDate: isRoundTrip ? returnDate : null,
        passengers,
        onSelectFlight: confirmFlightSelection,
        onSkip: handleSkipFlightSelection,
        onCancel: () => setShowFlightSelector(false)
      }
    )
  ] });
}
export {
  FlightBooking as default
};
//# sourceMappingURL=FlightBooking-ByBMVx1c.js.map

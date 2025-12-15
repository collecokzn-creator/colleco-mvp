import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { o as Clock, O as Search, W as ChevronDown, F as Filter, C as Calendar, r as Mail, M as MapPin, d as Plane, H as Hotel, e as Car, a as DollarSign, b as FileText, D as Download, Y as Share2, _ as MessageCircle, V as XCircle, $ as AlertTriangle, n as CheckCircle2 } from "./icons-C4AMPM7L.js";
import { u as useNavigate } from "./index-DlOecmR0.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
const TRIP_FILTERS = [
  { value: "all", label: "All Trips" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past Trips" },
  { value: "cancelled", label: "Cancelled" }
];
const SORT_OPTIONS = [
  { value: "date_desc", label: "Newest First" },
  { value: "date_asc", label: "Oldest First" },
  { value: "amount_desc", label: "Highest Amount" },
  { value: "amount_asc", label: "Lowest Amount" }
];
function MyTrips() {
  const navigate = useNavigate();
  const [trips, setTrips] = reactExports.useState([]);
  const [filteredTrips, setFilteredTrips] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [activeFilter, setActiveFilter] = reactExports.useState("all");
  const [sortBy, setSortBy] = reactExports.useState("date_desc");
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [showFilters, setShowFilters] = reactExports.useState(false);
  const fetchTrips = reactExports.useCallback(async () => {
    try {
      const response = await fetch("/api/bookings/all");
      if (!response.ok) throw new Error("Failed to fetch trips");
      const data = await response.json();
      setTrips(data.bookings || mockTrips);
      setLoading(false);
    } catch (error) {
      console.error("Fetch error:", error);
      setTrips(mockTrips);
      setLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);
  const applyFiltersAndSort = reactExports.useCallback(() => {
    let result = [...trips];
    if (activeFilter !== "all") {
      const now = /* @__PURE__ */ new Date();
      if (activeFilter === "upcoming") {
        result = result.filter((trip) => new Date(trip.startDate) > now && trip.status !== "cancelled");
      } else if (activeFilter === "past") {
        result = result.filter((trip) => new Date(trip.endDate) < now && trip.status !== "cancelled");
      } else if (activeFilter === "cancelled") {
        result = result.filter((trip) => trip.status === "cancelled");
      }
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (trip) => trip.destination.toLowerCase().includes(query) || trip.bookingRef.toLowerCase().includes(query) || trip.accommodation?.toLowerCase().includes(query)
      );
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case "date_desc":
          return new Date(b.startDate) - new Date(a.startDate);
        case "date_asc":
          return new Date(a.startDate) - new Date(b.startDate);
        case "amount_desc":
          return b.totalAmount - a.totalAmount;
        case "amount_asc":
          return a.totalAmount - b.totalAmount;
        default:
          return 0;
      }
    });
    setFilteredTrips(result);
  }, [trips, activeFilter, sortBy, searchQuery]);
  reactExports.useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);
  const getStatusConfig = (trip) => {
    const now = /* @__PURE__ */ new Date();
    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    if (trip.status === "cancelled") {
      return { label: "Cancelled", color: "bg-red-100 text-red-800", icon: XCircle, borderColor: "border-red-300" };
    }
    if (trip.status === "pending_payment") {
      return { label: "Payment Pending", color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle, borderColor: "border-yellow-300" };
    }
    if (now >= startDate && now <= endDate) {
      return { label: "In Progress", color: "bg-blue-100 text-blue-800", icon: Plane, borderColor: "border-blue-300" };
    }
    if (endDate < now) {
      return { label: "Completed", color: "bg-gray-100 text-gray-800", icon: CheckCircle2, borderColor: "border-gray-300" };
    }
    if (startDate > now) {
      return { label: "Confirmed", color: "bg-green-100 text-green-800", icon: CheckCircle2, borderColor: "border-green-300" };
    }
    return { label: "Pending", color: "bg-gray-100 text-gray-800", icon: Clock, borderColor: "border-gray-300" };
  };
  const renderTripCard = (trip) => {
    const statusConfig = getStatusConfig(trip);
    const StatusIcon = statusConfig.icon;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `bg-white rounded-lg border-2 ${statusConfig.borderColor} hover:shadow-lg transition-all cursor-pointer`,
        onClick: () => navigate(`/bookings/${trip.id}`),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-between mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-brand-brown hover:text-brand-orange transition-colors", children: trip.destination }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(StatusIcon, { className: "w-3 h-3" }),
                statusConfig.label
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-500", children: [
              "Ref: ",
              trip.bookingRef
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-4 h-4 text-brand-orange" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                new Date(trip.startDate).toLocaleDateString(),
                " - ",
                new Date(trip.endDate).toLocaleDateString()
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-4 h-4 text-brand-orange" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                trip.travelers,
                " traveler(s) • ",
                trip.duration,
                " days"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 p-4 bg-cream-light rounded-lg", children: [
            trip.flight && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plane, { className: "w-4 h-4 text-brand-orange" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-700", children: "Flight" })
            ] }),
            trip.accommodation && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Hotel, { className: "w-4 h-4 text-brand-orange" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-700", children: trip.accommodation })
            ] }),
            trip.transport && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Car, { className: "w-4 h-4 text-brand-orange" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-700", children: "Transport" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "w-4 h-4 text-brand-orange" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold text-gray-700", children: [
                trip.currency,
                " ",
                trip.totalAmount?.toLocaleString()
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 pt-4 border-t", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: (e) => {
                  e.stopPropagation();
                  navigate(`/bookings/${trip.id}`);
                },
                className: "flex items-center gap-1 px-4 py-2 bg-brand-orange text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-4 h-4" }),
                  "View Details"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: (e) => {
                  e.stopPropagation();
                },
                className: "flex items-center gap-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4" }),
                  "Download"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: (e) => {
                  e.stopPropagation();
                },
                className: "flex items-center gap-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "w-4 h-4" }),
                  "Share"
                ]
              }
            ),
            trip.hasMessages && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: (e) => {
                  e.stopPropagation();
                  navigate(`/messages/${trip.id}`);
                },
                className: "flex items-center gap-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "w-4 h-4" }),
                  "Messages ",
                  trip.unreadMessages > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full", children: trip.unreadMessages })
                ]
              }
            )
          ] })
        ] })
      },
      trip.id
    );
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-cream flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-12 h-12 animate-spin text-brand-orange mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Loading your trips..." })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-cream py-8 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl md:text-4xl font-bold text-brand-brown mb-2", children: "My Trips" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Manage all your bookings and travel plans" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: TRIP_FILTERS.map((filter) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setActiveFilter(filter.value),
          className: `px-4 py-2 rounded-lg font-semibold text-sm transition-all ${activeFilter === filter.value ? "bg-brand-orange text-white" : "bg-white text-gray-700 border border-gray-300 hover:border-brand-orange"}`,
          children: filter.label
        },
        filter.value
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value),
              placeholder: "Search by destination, reference, or hotel...",
              className: "w-full pl-11 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "select",
            {
              value: sortBy,
              onChange: (e) => setSortBy(e.target.value),
              className: "appearance-none px-4 py-3 pr-10 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-brand-orange focus:border-transparent cursor-pointer",
              children: SORT_OPTIONS.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: option.value, children: option.label }, option.value))
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setShowFilters(!showFilters),
            className: "flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Filter, { className: "w-5 h-5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm", children: "Filters" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
        "Showing ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: filteredTrips.length }),
        " of ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: trips.length }),
        " trips"
      ] }),
      searchQuery && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setSearchQuery(""),
          className: "text-brand-orange text-sm font-semibold hover:underline",
          children: "Clear Search"
        }
      )
    ] }),
    filteredTrips.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg p-12 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-16 h-16 text-gray-300 mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-brand-brown mb-2", children: "No trips found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mb-4", children: searchQuery ? "Try adjusting your search or filters" : "You haven't booked any trips yet" }),
      !searchQuery && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => navigate("/plan-trip"),
          className: "px-6 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors",
          children: "Plan Your First Trip"
        }
      )
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: filteredTrips.map(renderTripCard) }),
    filteredTrips.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 bg-gradient-to-r from-brand-orange to-orange-600 text-white rounded-lg p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "w-12 h-12 mx-auto mb-4 opacity-90" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-bold mb-2", children: "Get Travel Inspiration" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-4 opacity-90", children: "Subscribe to our newsletter for exclusive deals and travel tips" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "px-6 py-3 bg-white text-brand-orange rounded-lg font-semibold hover:bg-opacity-90 transition-colors", children: "Subscribe Now" })
    ] })
  ] }) });
}
const mockTrips = [
  {
    id: "TRV001",
    bookingRef: "COL-2025-001",
    destination: "Kruger National Park Safari",
    startDate: "2025-12-15",
    endDate: "2025-12-20",
    duration: 5,
    travelers: 2,
    status: "confirmed",
    accommodation: "Sabi Sabi Private Lodge",
    flight: true,
    transport: true,
    currency: "ZAR",
    totalAmount: 35900,
    hasMessages: true,
    unreadMessages: 2
  },
  {
    id: "TRV002",
    bookingRef: "COL-2025-002",
    destination: "Cape Town & Winelands",
    startDate: "2025-11-28",
    endDate: "2025-12-03",
    duration: 5,
    travelers: 4,
    status: "confirmed",
    accommodation: "Table Bay Hotel",
    flight: false,
    transport: true,
    currency: "ZAR",
    totalAmount: 28500,
    hasMessages: false,
    unreadMessages: 0
  },
  {
    id: "TRV003",
    bookingRef: "COL-2025-003",
    destination: "Zanzibar Beach Escape",
    startDate: "2025-10-10",
    endDate: "2025-10-17",
    duration: 7,
    travelers: 2,
    status: "completed",
    accommodation: "The Rock Resort",
    flight: true,
    transport: true,
    currency: "ZAR",
    totalAmount: 42e3,
    hasMessages: true,
    unreadMessages: 0
  }
];
export {
  MyTrips as default
};
//# sourceMappingURL=MyTrips-CzyhjBFK.js.map

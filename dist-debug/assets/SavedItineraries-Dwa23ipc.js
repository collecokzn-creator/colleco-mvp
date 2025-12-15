import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { o as Clock, p as Plus, O as Search, a8 as Bookmark, E as Sparkles, M as MapPin, C as Calendar, a as DollarSign, i as PenSquare, n as CheckCircle2, J as Copy, Y as Share2, a9 as Trash2 } from "./icons-C4AMPM7L.js";
import { u as useNavigate } from "./index-DlOecmR0.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
function SavedItineraries() {
  const navigate = useNavigate();
  const [itineraries, setItineraries] = reactExports.useState([]);
  const [filteredItineraries, setFilteredItineraries] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [sortBy, setSortBy] = reactExports.useState("recent");
  reactExports.useEffect(() => {
    fetchItineraries();
  }, [fetchItineraries]);
  reactExports.useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);
  const fetchItineraries = reactExports.useCallback(async () => {
    try {
      const response = await fetch("/api/itineraries/saved");
      if (!response.ok) throw new Error("Failed to fetch itineraries");
      const data = await response.json();
      setItineraries(data.itineraries || mockItineraries);
      setLoading(false);
    } catch (error) {
      console.error("Fetch error:", error);
      setItineraries(mockItineraries);
      setLoading(false);
    }
  }, []);
  const applyFiltersAndSort = reactExports.useCallback(() => {
    let result = [...itineraries];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (itinerary) => itinerary.title.toLowerCase().includes(query) || itinerary.destinations?.some((d) => d.toLowerCase().includes(query))
      );
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.savedAt) - new Date(a.savedAt);
        case "oldest":
          return new Date(a.savedAt) - new Date(b.savedAt);
        case "duration_desc":
          return b.duration - a.duration;
        case "duration_asc":
          return a.duration - b.duration;
        case "budget_desc":
          return b.estimatedBudget - a.estimatedBudget;
        case "budget_asc":
          return a.estimatedBudget - b.estimatedBudget;
        default:
          return 0;
      }
    });
    setFilteredItineraries(result);
  }, [itineraries, searchQuery, sortBy]);
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this itinerary?")) return;
    try {
      const response = await fetch(`/api/itineraries/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      setItineraries((prev) => prev.filter((i) => i.id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete itinerary");
    }
  };
  const handleDuplicate = async (itinerary, e) => {
    e.stopPropagation();
    const newItinerary = {
      ...itinerary,
      id: `ITN-${Date.now()}`,
      title: `${itinerary.title} (Copy)`,
      savedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    try {
      const response = await fetch("/api/itineraries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItinerary)
      });
      if (!response.ok) throw new Error("Duplicate failed");
      const result = await response.json();
      setItineraries((prev) => [result.itinerary, ...prev]);
    } catch (error) {
      console.error("Duplicate error:", error);
    }
  };
  const handleConvertToBooking = (id, e) => {
    e.stopPropagation();
    navigate(`/book-itinerary/${id}`);
  };
  const renderItineraryCard = (itinerary) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "bg-white rounded-lg border-2 border-gray-200 hover:border-brand-orange hover:shadow-lg transition-all cursor-pointer group",
      onClick: () => navigate(`/itineraries/${itinerary.id}`),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-48 bg-gradient-to-br from-brand-orange to-orange-600 rounded-t-lg overflow-hidden", children: [
          itinerary.thumbnail ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: itinerary.thumbnail,
              alt: itinerary.title,
              className: "w-full h-full object-cover group-hover:scale-105 transition-transform"
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-16 h-16 text-white opacity-50" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-3 right-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-full p-2 shadow-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bookmark, { className: "w-5 h-5 text-brand-orange fill-brand-orange" }) }) }),
          itinerary.isAIGenerated && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-3 left-3 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-3 h-3" }),
            "AI Generated"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-brand-brown mb-2 group-hover:text-brand-orange transition-colors", children: itinerary.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 mb-4 text-sm text-gray-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-4 h-4 text-brand-orange mt-0.5 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-2", children: itinerary.destinations?.join(" → ") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3 mb-4 p-3 bg-cream-light rounded-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-4 h-4 text-brand-orange mx-auto mb-1" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-gray-700", children: [
                itinerary.duration,
                " days"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "w-4 h-4 text-brand-orange mx-auto mb-1" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-gray-700", children: [
                itinerary.currency,
                " ",
                itinerary.estimatedBudget?.toLocaleString()
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4 text-brand-orange mx-auto mb-1" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-gray-700", children: [
                itinerary.activities || 0,
                " activities"
              ] })
            ] })
          ] }),
          itinerary.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-4 line-clamp-2", children: itinerary.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-gray-500 mb-4 pt-3 border-t", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Saved ",
              new Date(itinerary.savedAt).toLocaleDateString()
            ] }),
            itinerary.lastModified && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Modified ",
              new Date(itinerary.lastModified).toLocaleDateString()
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: (e) => {
                  e.stopPropagation();
                  navigate(`/itineraries/${itinerary.id}/edit`);
                },
                className: "flex items-center gap-1 px-4 py-2 bg-brand-orange text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(PenSquare, { className: "w-4 h-4" }),
                  "Edit"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: (e) => handleConvertToBooking(itinerary.id, e),
                className: "flex items-center gap-1 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "w-4 h-4" }),
                  "Book Now"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: (e) => handleDuplicate(itinerary, e),
                className: "flex items-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "w-4 h-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: (e) => {
                  e.stopPropagation();
                },
                className: "flex items-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "w-4 h-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: (e) => handleDelete(itinerary.id, e),
                className: "flex items-center gap-1 px-3 py-2 border border-red-300 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
              }
            )
          ] })
        ] })
      ]
    },
    itinerary.id
  );
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-cream flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-12 h-12 animate-spin text-brand-orange mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Loading your itineraries..." })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-cream py-8 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl md:text-4xl font-bold text-brand-brown mb-2", children: "Saved Itineraries" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Your saved travel plans and AI-generated itineraries" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => navigate("/trip-assist"),
          className: "mt-4 md:mt-0 flex items-center gap-2 px-6 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-5 h-5" }),
            "Create New Itinerary"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex flex-col sm:flex-row gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            placeholder: "Search itineraries...",
            className: "w-full pl-11 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "select",
        {
          value: sortBy,
          onChange: (e) => setSortBy(e.target.value),
          className: "px-4 py-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-brand-orange focus:border-transparent",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "recent", children: "Most Recent" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "oldest", children: "Oldest First" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "duration_desc", children: "Longest Duration" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "duration_asc", children: "Shortest Duration" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "budget_desc", children: "Highest Budget" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "budget_asc", children: "Lowest Budget" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
      "Showing ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: filteredItineraries.length }),
      " of ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: itineraries.length }),
      " itineraries"
    ] }) }),
    filteredItineraries.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg p-12 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Bookmark, { className: "w-16 h-16 text-gray-300 mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-brand-brown mb-2", children: "No saved itineraries" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mb-4", children: searchQuery ? "No itineraries match your search" : "Start planning your dream trip with AI assistance" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => navigate("/trip-assist"),
          className: "px-6 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors inline-flex items-center gap-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-5 h-5" }),
            "Use Trip Assistant"
          ]
        }
      )
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: filteredItineraries.map(renderItineraryCard) }),
    filteredItineraries.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-12 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-12 h-12 mx-auto mb-4 opacity-90" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-bold mb-2", children: "Let AI Plan Your Next Adventure" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-4 opacity-90", children: "Get personalized itineraries in seconds with our AI Trip Assistant" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => navigate("/trip-assist"),
          className: "px-6 py-3 bg-white text-purple-700 rounded-lg font-semibold hover:bg-opacity-90 transition-colors",
          children: "Try Trip Assistant"
        }
      )
    ] })
  ] }) });
}
const mockItineraries = [
  {
    id: "ITN-001",
    title: "Cape Town & Winelands Explorer",
    destinations: ["Cape Town", "Stellenbosch", "Franschhoek", "Hermanus"],
    duration: 7,
    currency: "ZAR",
    estimatedBudget: 18500,
    activities: 12,
    description: "Experience the beauty of the Western Cape with city tours, wine tasting, and coastal adventures.",
    savedAt: "2025-11-20T10:00:00Z",
    lastModified: "2025-11-22T15:30:00Z",
    isAIGenerated: true,
    thumbnail: null
  },
  {
    id: "ITN-002",
    title: "Kruger Safari Adventure",
    destinations: ["Johannesburg", "Kruger National Park", "Blyde River Canyon"],
    duration: 5,
    currency: "ZAR",
    estimatedBudget: 32e3,
    activities: 8,
    description: "Big Five safari with luxury lodge accommodation and guided game drives.",
    savedAt: "2025-11-15T14:00:00Z",
    lastModified: null,
    isAIGenerated: false,
    thumbnail: null
  },
  {
    id: "ITN-003",
    title: "Garden Route Road Trip",
    destinations: ["Cape Town", "Mossel Bay", "Knysna", "Plettenberg Bay", "Port Elizabeth"],
    duration: 10,
    currency: "ZAR",
    estimatedBudget: 25e3,
    activities: 15,
    description: "Scenic coastal drive with beaches, forests, and adventure activities.",
    savedAt: "2025-11-10T09:00:00Z",
    lastModified: "2025-11-18T11:00:00Z",
    isAIGenerated: true,
    thumbnail: null
  }
];
export {
  SavedItineraries as default
};
//# sourceMappingURL=SavedItineraries-Dwa23ipc.js.map

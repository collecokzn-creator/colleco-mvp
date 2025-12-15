import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { G as GamificationWidget } from "./GamificationWidget-C6rM1rFK.js";
import { o as Clock, d as Plane, M as MapPin, a as DollarSign, x as Star, q as ArrowRight, C as Calendar, p as Plus, n as CheckCircle2, a8 as Bookmark, _ as MessageCircle, T as TrendingUp, V as XCircle, H as Hotel, e as Car, b as FileText } from "./icons-C4AMPM7L.js";
import { u as useNavigate } from "./index-DlOecmR0.js";
import "./react-4gMnsuNC.js";
import "./gamificationEngine-BquAD8q6.js";
import "./pdf-DKpnIAzb.js";
function TravelerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = reactExports.useState(null);
  const [upcomingTrips, setUpcomingTrips] = reactExports.useState([]);
  const [savedItineraries, setSavedItineraries] = reactExports.useState([]);
  const [recentActivity, setRecentActivity] = reactExports.useState([]);
  const [stats, setStats] = reactExports.useState({
    totalTrips: 0,
    countriesVisited: 0,
    totalSpent: 0,
    rewardsPoints: 0
  });
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    fetchDashboardData();
  }, []);
  const fetchDashboardData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("colleco.user") || "{}");
      setUser(userData);
      const tripsResponse = await fetch("/api/bookings/upcoming");
      if (tripsResponse.ok) {
        const tripsData = await tripsResponse.json();
        setUpcomingTrips(tripsData.bookings || []);
      }
      const itinerariesResponse = await fetch("/api/itineraries/saved");
      if (itinerariesResponse.ok) {
        const itinerariesData = await itinerariesResponse.json();
        setSavedItineraries(itinerariesData.itineraries || []);
      }
      const activityResponse = await fetch("/api/activity/recent");
      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setRecentActivity(activityData.activities || []);
      }
      const statsResponse = await fetch("/api/travelers/stats");
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
      setLoading(false);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      setLoading(false);
    }
  };
  const renderStatCard = (icon, label, value, color = "brand-orange") => {
    const Icon = icon;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `p-3 rounded-full bg-${color} bg-opacity-10`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `w-6 h-6 text-${color}` }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-4 h-4 text-green-500" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-brand-brown mb-1", children: value }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: label })
    ] });
  };
  const renderUpcomingTripCard = (trip) => {
    const statusConfig = {
      confirmed: { label: "Confirmed", color: "text-green-600", icon: CheckCircle2 },
      pending: { label: "Pending", color: "text-yellow-600", icon: Clock },
      cancelled: { label: "Cancelled", color: "text-red-600", icon: XCircle }
    };
    const config = statusConfig[trip.status] || statusConfig.pending;
    const StatusIcon = config.icon;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-brand-orange transition-all cursor-pointer group",
        onClick: () => navigate(`/bookings/${trip.id}`),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-1 group-hover:text-brand-orange transition-colors", children: trip.destination }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-600", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  new Date(trip.startDate).toLocaleDateString(),
                  " - ",
                  new Date(trip.endDate).toLocaleDateString()
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-sm font-semibold ${config.color}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(StatusIcon, { className: "w-4 h-4" }),
              config.label
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 mb-4", children: [
            trip.accommodation && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Hotel, { className: "w-4 h-4 text-brand-orange" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: trip.accommodation })
            ] }),
            trip.flight && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plane, { className: "w-4 h-4 text-brand-orange" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: trip.flight })
            ] }),
            trip.transport && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Car, { className: "w-4 h-4 text-brand-orange" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: trip.transport })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "w-4 h-4 text-brand-orange" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
                trip.currency,
                " ",
                trip.totalAmount?.toLocaleString()
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pt-3 border-t", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500", children: [
              trip.travelers,
              " traveler(s)"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "text-brand-orange text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all", children: [
              "View Details",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-4 h-4" })
            ] })
          ] })
        ]
      },
      trip.id
    );
  };
  const renderSavedItinerary = (itinerary) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "bg-white p-4 rounded-lg border border-gray-200 hover:border-brand-orange transition-all cursor-pointer group",
      onClick: () => navigate(`/itineraries/${itinerary.id}`),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-brand-brown group-hover:text-brand-orange transition-colors", children: itinerary.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-gray-500 mt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-3 h-3" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: itinerary.destinations?.join(", ") })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bookmark, { className: "w-5 h-5 text-brand-orange" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-gray-500", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            itinerary.duration,
            " days"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Saved ",
            new Date(itinerary.savedAt).toLocaleDateString()
          ] })
        ] })
      ]
    },
    itinerary.id
  );
  const renderQuickAction = (icon, label, onClick, color = "brand-orange") => {
    const Icon = icon;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick,
        className: `flex flex-col items-center gap-2 p-4 rounded-lg bg-white border-2 border-gray-200 hover:border-${color} hover:shadow-md transition-all group`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `p-3 rounded-full bg-${color} bg-opacity-10 group-hover:bg-opacity-20 transition-all`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `w-6 h-6 text-${color}` }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-brand-brown", children: label })
        ]
      }
    );
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-12 h-12 animate-spin text-brand-orange mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Loading your dashboard..." })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-3xl md:text-4xl font-bold text-brand-brown mb-2", children: [
        "Welcome back, ",
        user?.name || "Traveler",
        "! ✈️"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Here's what's happening with your trips" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8", children: [
      renderStatCard(Plane, "Total Trips", stats.totalTrips),
      renderStatCard(MapPin, "Countries Visited", stats.countriesVisited),
      renderStatCard(DollarSign, "Total Spent", `R ${stats.totalSpent?.toLocaleString()}`),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          onClick: () => navigate("/loyalty"),
          className: "cursor-pointer",
          children: renderStatCard(Star, "Rewards Points", stats.rewardsPoints)
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-brand-brown mb-4", children: "Quick Actions" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4", children: [
        renderQuickAction(Plus, "Plan New Trip", () => navigate("/plan-trip")),
        renderQuickAction(Calendar, "My Bookings", () => navigate("/my-trips")),
        renderQuickAction(Star, "Rewards", () => navigate("/loyalty")),
        renderQuickAction(Bookmark, "Saved Itineraries", () => navigate("/saved-itineraries")),
        renderQuickAction(MessageCircle, "Trip Assistant", () => navigate("/trip-assist")),
        renderQuickAction(FileText, "Documents", () => navigate("/travel-documents"))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 space-y-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GamificationWidget, { userId: user?.id || "user_123", compact: false }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-brand-brown", children: "Upcoming Trips" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => navigate("/my-trips"),
                className: "text-brand-orange text-sm font-semibold hover:underline flex items-center gap-1",
                children: [
                  "View All",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-4 h-4" })
                ]
              }
            )
          ] }),
          upcomingTrips.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-12 rounded-lg text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-16 h-16 text-gray-300 mx-auto mb-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-brand-brown mb-2", children: "No upcoming trips" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mb-4", children: "Start planning your next adventure!" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => navigate("/plan-trip"),
                className: "px-6 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors inline-flex items-center gap-2",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-5 h-5" }),
                  "Plan a Trip"
                ]
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: upcomingTrips.slice(0, 3).map(renderUpcomingTripCard) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-brand-brown mb-4", children: "Recent Activity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg shadow-md p-6", children: recentActivity.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 text-center py-4", children: "No recent activity" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: recentActivity.map((activity, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 pb-4 last:pb-0 border-b last:border-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 rounded-full bg-brand-orange bg-opacity-10", children: [
              activity.type === "booking" && /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "w-4 h-4 text-brand-orange" }),
              activity.type === "itinerary" && /* @__PURE__ */ jsxRuntimeExports.jsx(Bookmark, { className: "w-4 h-4 text-brand-orange" }),
              activity.type === "message" && /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "w-4 h-4 text-brand-orange" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown font-medium", children: activity.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-1", children: activity.description })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400", children: activity.timeAgo })
          ] }, idx)) }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden lg:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GamificationWidget, { userId: user?.id || "user_123", compact: false }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-brand-brown", children: "Saved Itineraries" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => navigate("/saved-itineraries"),
                className: "text-brand-orange text-sm hover:underline",
                children: "See All"
              }
            )
          ] }),
          savedItineraries.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bookmark, { className: "w-10 h-10 text-gray-300 mx-auto mb-2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "No saved itineraries" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: savedItineraries.slice(0, 3).map(renderSavedItinerary) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-br from-brand-orange to-orange-600 text-white rounded-lg shadow-md p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold mb-2", children: "✨ Recommended for You" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mb-4 opacity-90", children: "Based on your travel history and preferences" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white bg-opacity-20 p-3 rounded-lg", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm", children: "Garden Route Adventure" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs opacity-90", children: "7 days • From R12,500 pp" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white bg-opacity-20 p-3 rounded-lg", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm", children: "Kruger Safari Escape" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs opacity-90", children: "5 days • From R15,900 pp" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "mt-4 w-full bg-white text-brand-orange rounded-lg py-2 font-semibold text-sm hover:bg-opacity-90 transition-colors", children: "Explore Packages" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-blue-900 mb-2", children: "Need Help?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-blue-800 mb-3", children: "Our travel experts are here to assist you 24/7" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => navigate("/support"),
              className: "w-full bg-blue-600 text-white rounded-lg py-2 font-semibold text-sm hover:bg-blue-700 transition-colors",
              children: "Contact Support"
            }
          )
        ] })
      ] })
    ] })
  ] }) });
}
export {
  TravelerDashboard as default
};
//# sourceMappingURL=TravelerDashboard-DblsybnJ.js.map

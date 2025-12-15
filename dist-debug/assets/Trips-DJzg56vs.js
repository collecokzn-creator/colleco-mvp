import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { c as useUser, u as useNavigate } from "./index-DlOecmR0.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
import "./icons-C4AMPM7L.js";
function Trips() {
  const { user: _user } = useUser();
  const navigate = useNavigate();
  const [upcomingTrips, setUpcomingTrips] = reactExports.useState([]);
  const [pastTrips, setPastTrips] = reactExports.useState([]);
  const [activeTab, setActiveTab] = reactExports.useState("upcoming");
  reactExports.useEffect(() => {
    if (typeof window !== "undefined" && typeof window.scrollTo === "function") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    const bookings = JSON.parse(localStorage.getItem("colleco.bookings") || "[]");
    const travelHistory = JSON.parse(localStorage.getItem("colleco.travel.history") || "[]");
    const upcoming = bookings.filter(
      (b) => b.status === "confirmed" || b.status === "pending"
    );
    setUpcomingTrips(upcoming);
    setPastTrips(travelHistory);
  }, []);
  const handleViewDetails = () => {
    navigate("/bookings");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-hidden bg-cream min-h-screen", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-brand-brown", children: "My Trips" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-russty mt-2", children: "Manage your upcoming and past travel experiences" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 mb-6 border-b border-cream-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setActiveTab("upcoming"),
          className: `px-6 py-3 font-semibold transition-colors ${activeTab === "upcoming" ? "text-brand-orange border-b-2 border-brand-orange" : "text-gray-600 hover:text-brand-brown"}`,
          children: [
            "Upcoming (",
            upcomingTrips.length,
            ")"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setActiveTab("past"),
          className: `px-6 py-3 font-semibold transition-colors ${activeTab === "past" ? "text-brand-orange border-b-2 border-brand-orange" : "text-gray-600 hover:text-brand-brown"}`,
          children: [
            "Past Trips (",
            pastTrips.length,
            ")"
          ]
        }
      )
    ] }),
    activeTab === "upcoming" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: upcomingTrips.length > 0 ? upcomingTrips.map((trip, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-brand-brown", children: trip.destination || trip.title || "Trip" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-3 py-1 rounded-full text-xs font-semibold ${trip.status === "confirmed" ? "bg-cream-sand text-brand-brown" : "bg-amber-100 text-brand-russty"}`, children: trip.status })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 text-gray-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "📅" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: trip.date || "Date TBD" })
          ] }),
          trip.guests && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "👥" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              trip.guests,
              " guest(s)"
            ] })
          ] }),
          trip.amount && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "💰" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-brand-orange", children: [
              "R ",
              trip.amount
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => handleViewDetails(),
          className: "px-4 py-2 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-gold transition",
          children: "View Details"
        }
      )
    ] }) }, index)) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-md p-12 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-6xl mb-4", children: "✈️" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-brand-brown mb-2", children: "No upcoming trips" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mb-6", children: "Start planning your next adventure!" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => navigate("/plan-trip"),
          className: "px-6 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-gold transition",
          children: "Plan a Trip"
        }
      )
    ] }) }),
    activeTab === "past" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: pastTrips.length > 0 ? pastTrips.map((trip, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg shadow-md p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-brand-brown mb-2", children: trip.destination || "Trip" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 text-gray-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "📅" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: trip.date }),
            trip.duration && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "• ",
              trip.duration
            ] })
          ] }),
          trip.amount && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "💰" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
              "R ",
              trip.amount
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800", children: "Completed" })
    ] }) }, index)) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-md p-12 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-6xl mb-4", children: "🗺️" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-brand-brown mb-2", children: "No travel history yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Your completed trips will appear here" })
    ] }) })
  ] }) });
}
export {
  Trips as default
};
//# sourceMappingURL=Trips-DJzg56vs.js.map

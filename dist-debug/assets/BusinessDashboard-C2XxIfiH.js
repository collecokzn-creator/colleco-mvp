import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { n as CheckCircle2, b as FileText, j as Briefcase, M as MapPin, a as DollarSign, U as Users, p as Plus, k as BarChart3, D as Download, C as Calendar, m as User, d as Plane, H as Hotel, e as Car } from "./icons-C4AMPM7L.js";
import { u as useNavigate, b as useLocation } from "./index-DlOecmR0.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
function BusinessDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = reactExports.useState({
    totalBookings: 0,
    activeTrips: 0,
    totalSpend: 0,
    activeTravelers: 0,
    pendingApprovals: 0,
    avgTripCost: 0
  });
  const [recentBookings, setRecentBookings] = reactExports.useState([]);
  const [upcomingTrips, setUpcomingTrips] = reactExports.useState([]);
  const [topTravelers, setTopTravelers] = reactExports.useState([]);
  const [spendByCategory, setSpendByCategory] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [successMessage, setSuccessMessage] = reactExports.useState(location.state?.message || "");
  reactExports.useEffect(() => {
    fetchDashboardData();
    if (successMessage) {
      setTimeout(() => setSuccessMessage(""), 5e3);
    }
  }, [successMessage]);
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, bookingsRes, tripsRes, travelersRes, spendRes] = await Promise.all([
        fetch("/api/business-travelers/stats").then((r) => r.json()),
        fetch("/api/business-travelers/bookings/recent").then((r) => r.json()),
        fetch("/api/business-travelers/trips/upcoming").then((r) => r.json()),
        fetch("/api/business-travelers/travelers/top").then((r) => r.json()),
        fetch("/api/business-travelers/spend/by-category").then((r) => r.json())
      ]);
      setStats(statsRes);
      setRecentBookings(bookingsRes);
      setUpcomingTrips(tripsRes);
      setTopTravelers(travelersRes);
      setSpendByCategory(spendRes);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 0
    }).format(amount);
  };
  const renderStatsCards = () => {
    const cards = [
      {
        label: "Total Bookings",
        value: stats.totalBookings,
        icon: Briefcase,
        color: "blue",
        trend: "+12% from last month"
      },
      {
        label: "Active Trips",
        value: stats.activeTrips,
        icon: MapPin,
        color: "green",
        trend: `${stats.activeTrips} in progress`
      },
      {
        label: "Total Spend",
        value: formatCurrency(stats.totalSpend),
        icon: DollarSign,
        color: "purple",
        trend: "This fiscal year"
      },
      {
        label: "Active Travelers",
        value: stats.activeTravelers,
        icon: Users,
        color: "orange",
        trend: `${stats.pendingApprovals} pending approval`
      }
    ];
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: cards.map((card, idx) => {
      const Icon = card.icon;
      const colorClasses = {
        blue: "bg-blue-100 text-blue-600",
        green: "bg-green-100 text-green-600",
        purple: "bg-purple-100 text-purple-600",
        orange: "bg-orange-100 text-brand-orange"
      };
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-between mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `p-3 rounded-lg ${colorClasses[card.color]}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-6 h-6" }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium text-gray-600 mb-1", children: card.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-brand-brown mb-2", children: card.value }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: card.trend })
      ] }, idx);
    }) });
  };
  const renderQuickActions = () => {
    const actions = [
      { label: "Book Travel", icon: Plus, color: "bg-brand-orange", action: () => navigate("/plan-trip") },
      { label: "Manage Travelers", icon: Users, color: "bg-blue-600", action: () => navigate("/business/travelers") },
      { label: "View Reports", icon: BarChart3, color: "bg-purple-600", action: () => navigate("/business/reports") },
      { label: "Download Invoice", icon: Download, color: "bg-green-600", action: () => navigate("/business/invoices") }
    ];
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-8", children: actions.map((action, idx) => {
      const Icon = action.icon;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: action.action,
          className: `${action.color} text-white p-4 rounded-xl hover:opacity-90 transition-opacity flex flex-col items-center gap-2 shadow-md`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-6 h-6" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: action.label })
          ]
        },
        idx
      );
    }) });
  };
  const getStatusBadge = (status) => {
    const configs = {
      confirmed: { bg: "bg-green-100", text: "text-green-700", label: "Confirmed" },
      pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending" },
      in_progress: { bg: "bg-blue-100", text: "text-blue-700", label: "In Progress" },
      completed: { bg: "bg-gray-100", text: "text-gray-700", label: "Completed" },
      cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled" },
      pending_approval: { bg: "bg-orange-100", text: "text-orange-700", label: "Pending Approval" }
    };
    const config = configs[status] || configs.pending;
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`, children: config.label });
  };
  const renderUpcomingTrips = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-md p-6 border border-gray-100", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-brand-brown", children: "Upcoming Trips" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => navigate("/business/trips"),
          className: "text-brand-orange font-semibold text-sm hover:underline",
          children: "View All"
        }
      )
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-gray-500", children: "Loading trips..." }) : upcomingTrips.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-12 h-12 mx-auto mb-3 text-gray-300" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500", children: "No upcoming trips" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => navigate("/plan-trip"),
          className: "mt-4 px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition-colors",
          children: "Book New Trip"
        }
      )
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: upcomingTrips.map((trip) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-gray-200 rounded-lg p-4 hover:border-brand-orange transition-colors cursor-pointer", onClick: () => navigate(`/booking/${trip.bookingRef}`), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-brand-brown mb-1", children: trip.destination }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600 mb-2", children: [
            new Date(trip.startDate).toLocaleDateString(),
            " - ",
            new Date(trip.endDate).toLocaleDateString()
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-4 h-4 text-gray-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-600", children: trip.travelerName })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
          getStatusBadge(trip.status),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-brand-brown mt-2", children: formatCurrency(trip.totalAmount) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 text-xs text-gray-500", children: [
        trip.services?.flight && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plane, { className: "w-3 h-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Flight" })
        ] }),
        trip.services?.accommodation && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Hotel, { className: "w-3 h-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Hotel" })
        ] }),
        trip.services?.transport && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Car, { className: "w-3 h-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Transfer" })
        ] })
      ] })
    ] }, trip.id)) })
  ] });
  const renderRecentBookings = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-md p-6 border border-gray-100", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-brand-brown", children: "Recent Bookings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => navigate("/business/bookings"),
          className: "text-brand-orange font-semibold text-sm hover:underline",
          children: "View All"
        }
      )
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-gray-500", children: "Loading bookings..." }) : recentBookings.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-gray-500", children: "No recent bookings" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: recentBookings.map((booking) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-brand-orange transition-colors", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-cream flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-5 h-5 text-brand-orange" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown text-sm", children: booking.travelerName }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500", children: [
            booking.destination,
            " • ",
            booking.bookingRef
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-brand-brown text-sm", children: formatCurrency(booking.amount) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: new Date(booking.bookedAt).toLocaleDateString() })
      ] })
    ] }, booking.id)) })
  ] });
  const renderSpendAnalysis = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-md p-6 border border-gray-100", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-brand-brown mb-6", children: "Spend by Category" }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-gray-500", children: "Loading analysis..." }) : spendByCategory.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-gray-500", children: "No spend data available" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: spendByCategory.map((category) => {
      const percentage = stats.totalSpend > 0 ? category.amount / stats.totalSpend * 100 : 0;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-700", children: category.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold text-brand-brown", children: formatCurrency(category.amount) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "bg-brand-orange h-2 rounded-full transition-all",
            style: { width: `${percentage}%` }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
          percentage.toFixed(1),
          "% of total spend"
        ] })
      ] }, category.name);
    }) })
  ] });
  const renderTopTravelers = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-md p-6 border border-gray-100", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-brand-brown mb-6", children: "Top Travelers" }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-gray-500", children: "Loading travelers..." }) : topTravelers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-gray-500", children: "No traveler data available" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: topTravelers.map((traveler, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold text-sm", children: idx + 1 }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown text-sm", children: traveler.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500", children: [
          traveler.trips,
          " trips • ",
          traveler.department
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-gray-700", children: formatCurrency(traveler.totalSpend) })
    ] }, traveler.id)) })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-cream py-8 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto", children: [
    successMessage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "w-5 h-5 text-green-600" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-green-800 font-medium", children: successMessage })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl md:text-4xl font-bold text-brand-brown mb-2", children: "Business Travel Dashboard" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Manage your corporate travel and team bookings" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-3 mt-4 md:mt-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => navigate("/business/settings"),
          className: "flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-brand-orange transition-colors",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Settings" })
          ]
        }
      ) })
    ] }),
    renderStatsCards(),
    renderQuickActions(),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-2", children: renderUpcomingTrips() }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: renderRecentBookings() })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [
      renderSpendAnalysis(),
      renderTopTravelers()
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 bg-blue-100 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-6 h-6 text-blue-600" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-blue-900 mb-2", children: "Need Help Managing Business Travel?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-blue-800 mb-3", children: "Our dedicated business travel team is here to assist with booking, policy setup, reporting, and more." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "mailto:business@collecotravel.com", className: "text-sm font-semibold text-blue-700 hover:underline", children: "Contact Support" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-blue-300", children: "•" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate("/business/help"), className: "text-sm font-semibold text-blue-700 hover:underline", children: "View Help Center" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-blue-300", children: "•" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate("/business/reports"), className: "text-sm font-semibold text-blue-700 hover:underline", children: "Download Reports" })
        ] })
      ] })
    ] }) })
  ] }) });
}
export {
  BusinessDashboard as default
};
//# sourceMappingURL=BusinessDashboard-C2XxIfiH.js.map

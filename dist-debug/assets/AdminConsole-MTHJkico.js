import { r as reactExports, j as jsxRuntimeExports, m as motion, A as AnimatePresence } from "./motion-D9fZRtSt.js";
import { h as getSubscriptionAnalytics, j as getCommissionAnalytics, k as getPayoutStatistics, l as getAllSubscriptions } from "./payoutsSystem-wwSz4I24.js";
import { l as CreditCard, U as Users, T as TrendingUp, k as BarChart3, a as DollarSign, b as FileText, y as ShieldCheck, aa as MessageSquare, c as Settings } from "./icons-C4AMPM7L.js";
import "./react-4gMnsuNC.js";
import "./subscriptionPlans-rkZPWK28.js";
function AdminRevenueMetrics() {
  const [activeTab, setActiveTab] = reactExports.useState("overview");
  const [subscriptionData, setSubscriptionData] = reactExports.useState(null);
  const [commissionData, setCommissionData] = reactExports.useState(null);
  const [payoutData, setPayoutData] = reactExports.useState(null);
  const [allPartners, setAllPartners] = reactExports.useState([]);
  const [filter, setFilter] = reactExports.useState("all");
  reactExports.useEffect(() => {
    loadMetrics();
  }, []);
  const loadMetrics = () => {
    setSubscriptionData(getSubscriptionAnalytics());
    setCommissionData(getCommissionAnalytics());
    setPayoutData(getPayoutStatistics());
    setAllPartners(getAllSubscriptions());
  };
  if (!subscriptionData || !commissionData || !payoutData) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-center text-gray-500", children: "Loading metrics..." });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-br from-cream-50 to-white p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl font-bold text-brand-brown mb-2", children: "Revenue Dashboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Monitor subscriptions, commissions, and partner payouts" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6 mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        KPICard,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "text-brand-orange", size: 32 }),
          label: "Monthly Recurring Revenue",
          value: `R${subscriptionData.totalMRR.toLocaleString()}`,
          change: "+12%",
          trend: "up"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        KPICard,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "text-blue-500", size: 32 }),
          label: "Active Partners",
          value: subscriptionData.activePartners,
          subtitle: `${subscriptionData.totalPartners} total`
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        KPICard,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "text-green-500", size: 32 }),
          label: "Total Commission Paid",
          value: `R${commissionData.totalCommission.toLocaleString()}`,
          subtitle: `${commissionData.totalBookings} bookings`
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        KPICard,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(BarChart3, { className: "text-purple-500", size: 32 }),
          label: "Pending Payouts",
          value: `R${payoutData.totalPending.toLocaleString()}`,
          subtitle: `${payoutData.payoutsPending} partners`,
          warning: payoutData.payoutsPending > 0
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl border border-gray-200 mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-8 p-6 border-b border-gray-200 overflow-x-auto", children: [
        { id: "overview", label: "Overview", icon: "📊" },
        { id: "subscriptions", label: "Subscriptions", icon: "💳" },
        { id: "commissions", label: "Commissions", icon: "💰" },
        { id: "payouts", label: "Payouts", icon: "💸" },
        { id: "partners", label: "Partners", icon: "👥" }
      ].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setActiveTab(tab.id),
          className: `px-4 py-2 font-semibold flex items-center gap-2 transition ${activeTab === tab.id ? "text-brand-orange border-b-2 border-brand-orange" : "text-gray-600 hover:text-gray-800"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: tab.icon }),
            tab.label
          ]
        },
        tab.id
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
        activeTab === "overview" && /* @__PURE__ */ jsxRuntimeExports.jsx(OverviewTab, { data: { subscriptionData, commissionData, payoutData } }),
        activeTab === "subscriptions" && /* @__PURE__ */ jsxRuntimeExports.jsx(SubscriptionsTab, { data: subscriptionData }),
        activeTab === "commissions" && /* @__PURE__ */ jsxRuntimeExports.jsx(CommissionsTab, { data: commissionData }),
        activeTab === "payouts" && /* @__PURE__ */ jsxRuntimeExports.jsx(PayoutsTab, { data: payoutData }),
        activeTab === "partners" && /* @__PURE__ */ jsxRuntimeExports.jsx(PartnersTab, { partners: allPartners, filter, setFilter })
      ] })
    ] })
  ] }) });
}
function KPICard({ icon, label, value, subtitle, change, trend, warning }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-6 rounded-lg border-2 ${warning ? "border-orange-300 bg-orange-50" : "border-gray-200 bg-white"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 bg-gray-100 rounded-lg", children: icon }),
      change && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-sm font-bold ${trend === "up" ? "text-green-600" : "text-red-600"}`, children: change })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-1", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-gray-800", children: value }),
    subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-2", children: subtitle })
  ] });
}
function OverviewTab({ data }) {
  const { subscriptionData, commissionData, payoutData } = data;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "MRR by Plan" }),
        subscriptionData.adoptionByPlan.map((tier) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-gray-700", children: tier.plan }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-600", children: [
              "R",
              tier.mrr.toLocaleString()
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-2 bg-white rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "h-full bg-blue-500",
              style: { width: `${tier.mrr / subscriptionData.totalMRR * 100}%` }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-600 mt-1", children: [
            tier.percentage,
            "% adoption"
          ] })
        ] }, tier.plan))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "Revenue Health" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Average LTV" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-green-600", children: [
              "R",
              subscriptionData.averageLTV.toLocaleString()
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Churn Rate" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-orange-600", children: [
              (subscriptionData.churnRate * 100).toFixed(1),
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2 border-t border-green-300", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-600", children: [
            "Status: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-green-600", children: "Healthy" })
          ] }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-gray-800 mb-4", children: "Booking Performance" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Total Bookings" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-purple-600", children: commissionData.totalBookings.toLocaleString() })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Avg Booking Value" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-purple-600", children: [
            "R",
            (commissionData.totalBookingAmount / commissionData.totalBookings).toLocaleString()
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Avg Commission" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-purple-600", children: [
            "R",
            commissionData.averageCommissionPerBooking.toLocaleString()
          ] })
        ] })
      ] })
    ] })
  ] });
}
function SubscriptionsTab({ data }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-gray-800 mb-6", children: "Subscription Distribution" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: data.adoptionByPlan.map((tier, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-50 rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-800", children: tier.plan }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
          tier.count,
          " partners · ",
          tier.percentage,
          "% adoption"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-bold text-brand-orange", children: [
          "R",
          tier.mrr.toLocaleString(),
          "/mo MRR"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
          "LTV: R",
          tier.ltv.toLocaleString()
        ] })
      ] })
    ] }, idx)) })
  ] });
}
function CommissionsTab({ data }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-gray-800 mb-6", children: "Top Commission Earners" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-100", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left font-semibold", children: "Partner ID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left font-semibold", children: "Bookings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right font-semibold", children: "Booking Amount" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right font-semibold", children: "Commission" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right font-semibold", children: "Avg/Booking" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: data.topPartners.map((partner, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-200 hover:bg-gray-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 font-mono text-xs", children: [
          partner.partnerId.substring(0, 12),
          "..."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: partner.transactions }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-right", children: [
          "R",
          partner.totalBookingAmount.toLocaleString()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-right font-bold text-brand-orange", children: [
          "R",
          partner.totalCommission.toLocaleString()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-right text-gray-600", children: [
          "R",
          partner.averageCommissionPerBooking.toLocaleString()
        ] })
      ] }, idx)) })
    ] }) })
  ] });
}
function PayoutsTab({ data }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-green-50 rounded-lg border border-green-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-2", children: "Completed" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-green-600", children: data.payoutsCompleted }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600 mt-2", children: [
        "R",
        data.totalPaidOut.toLocaleString()
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-yellow-50 rounded-lg border border-yellow-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-2", children: "Pending" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-yellow-600", children: data.payoutsPending }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600 mt-2", children: [
        "R",
        data.totalPending.toLocaleString()
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-red-50 rounded-lg border border-red-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-2", children: "Failed" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-red-600", children: data.payoutsFailed }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600 mt-2", children: [
        "R",
        data.totalFailed.toLocaleString()
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-blue-50 rounded-lg border border-blue-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-2", children: "Average Payout" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-blue-600", children: [
        "R",
        data.averagePayoutAmount.toLocaleString()
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600 mt-2", children: [
        data.totalPayouts,
        " total"
      ] })
    ] })
  ] }) });
}
function PartnersTab({ partners, filter, setFilter }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 flex gap-4", children: ["all", "active", "paused", "cancelled"].map((status) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => setFilter(status),
        className: `px-4 py-2 rounded-lg font-semibold transition ${filter === status ? "bg-brand-orange text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`,
        children: status.charAt(0).toUpperCase() + status.slice(1)
      },
      status
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-100", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left font-semibold", children: "Partner" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left font-semibold", children: "Plan" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-left font-semibold", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right font-semibold", children: "MRR" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right font-semibold", children: "LTV" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right font-semibold", children: "Months Active" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: partners.filter((p) => filter === "all" || p.status === filter).map((partner, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-200 hover:bg-gray-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 font-mono text-xs", children: [
          partner.partnerId.substring(0, 12),
          "..."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-3 py-1 rounded-full text-xs font-bold ${partner.planId === "free" ? "bg-gray-200 text-gray-700" : partner.planId === "starter" ? "bg-blue-200 text-blue-700" : partner.planId === "pro" ? "bg-purple-200 text-purple-700" : "bg-brand-orange/20 text-brand-orange"}`, children: partner.planName }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-3 py-1 rounded-full text-xs font-bold ${partner.status === "active" ? "bg-green-200 text-green-700" : partner.status === "paused" ? "bg-yellow-200 text-yellow-700" : "bg-red-200 text-red-700"}`, children: partner.status }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-right font-bold", children: [
          "R",
          partner.stats.monthlyRecurringRevenue.toLocaleString()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-right", children: [
          "R",
          partner.stats.lifetimeValue.toLocaleString()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: partner.stats.monthsSinceStart })
      ] }, idx)) })
    ] }) })
  ] });
}
const menuItems = [
  { name: "Dashboard", icon: BarChart3 },
  { name: "Revenue", icon: DollarSign },
  { name: "Partners", icon: Users },
  { name: "Bookings", icon: FileText },
  { name: "Compliance", icon: ShieldCheck },
  { name: "AI Assistant", icon: MessageSquare },
  { name: "Settings", icon: Settings }
];
const TripAssistPro = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border rounded-lg shadow p-4 h-full flex flex-col", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-brand-brown mb-3", children: "Trip Assist Pro" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(
    "iframe",
    {
      src: "/trip-assist-widget",
      className: "flex-grow rounded border",
      title: "AI Admin Assistant"
    }
  )
] });
const AdminConsole = () => {
  const [activeTab, setActiveTab] = reactExports.useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = reactExports.useState(true);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-screen bg-gray-50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.aside,
      {
        animate: { width: sidebarOpen ? 240 : 80 },
        className: "bg-cream-sand text-brand-brown flex flex-col transition-all duration-300 shadow-xl border-r border-cream-border",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: `text-lg font-bold transition-all ${!sidebarOpen && "hidden"}`, children: "CollEco Admin" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setSidebarOpen(!sidebarOpen),
                className: "text-brand-brown hover:text-yellow-600",
                children: sidebarOpen ? "←" : "→"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "mt-6 flex-1 space-y-1", children: menuItems.map(({ name, icon: Icon }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setActiveTab(name),
              className: `w-full flex items-center gap-3 px-4 py-2 rounded-lg transition font-semibold ${activeTab === name ? "bg-brand-orange text-white shadow-md ring-2 ring-brand-orange" : "hover:bg-cream-hover text-brand-brown"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 20 }),
                sidebarOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: name })
              ]
            },
            name
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 text-xs text-brand-brown/70", children: [
            "© ",
            (/* @__PURE__ */ new Date()).getFullYear(),
            " CollEco Travel"
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AnimatePresence, { mode: "wait", children: [
      activeTab === "Dashboard" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -10 },
          className: "space-y-6",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold text-brand-brown", children: "Dashboard Overview" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-3 gap-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Total Bookings", value: "1,248" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Active Partners", value: "128" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Pending Approvals", value: "6" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChartPlaceholder, { title: "Revenue Overview" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChartPlaceholder, { title: "Booking Trends" })
            ] })
          ]
        },
        "dashboard"
      ),
      activeTab === "Revenue" && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { ...fadeMotion, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminRevenueMetrics, {}) }, "revenue"),
      activeTab === "Partners" && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { ...fadeMotion, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold text-brand-brown mb-4", children: "Partners" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg shadow p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "View and manage partner listings, tiers, and performance here." }) })
      ] }, "partners"),
      activeTab === "Bookings" && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { ...fadeMotion, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold text-brand-brown mb-4", children: "Bookings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg shadow p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "All active, pending, and completed bookings appear here." }) })
      ] }, "bookings"),
      activeTab === "Compliance" && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { ...fadeMotion, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold text-brand-brown mb-4", children: "Compliance Monitor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg shadow p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Monitor partner documentation, expiry dates, and safety status." }) })
      ] }, "compliance"),
      activeTab === "AI Assistant" && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { ...fadeMotion, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TripAssistPro, {}) }, "ai"),
      activeTab === "Settings" && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { ...fadeMotion, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold text-brand-brown mb-4", children: "System Settings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg shadow p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Configure app preferences, access levels, and brand settings." }) })
      ] }, "settings")
    ] }) })
  ] });
};
const fadeMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};
const StatCard = ({ label, value }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-6 rounded-lg shadow hover:shadow-lg transition", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 text-sm", children: label }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-brand-brown mt-1", children: value })
] });
const ChartPlaceholder = ({ title }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow p-6 text-center text-gray-400 border-dashed border-2 border-gray-200", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 font-medium mb-2", children: title }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Chart Placeholder — connect analytics later" })
] });
export {
  AdminConsole as default
};
//# sourceMappingURL=AdminConsole-MTHJkico.js.map

import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import "./react-4gMnsuNC.js";
function TransferAnalytics() {
  const [metrics, setMetrics] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [timeRange, setTimeRange] = reactExports.useState("week");
  const loadMetrics = reactExports.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/transfers/analytics?range=${timeRange}`);
      const data = await res.json();
      if (data.ok) {
        setMetrics(data.metrics);
      }
    } catch (e) {
      console.error("[analytics] load failed", e);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);
  reactExports.useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold mb-6", children: "Transfer Analytics" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500", children: "Loading analytics..." })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-brand-brown", children: "Transfer Analytics" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: ["week", "month", "year"].map((range) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setTimeRange(range),
          className: `px-4 py-2 rounded font-semibold capitalize transition ${timeRange === range ? "bg-brand-orange text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
          children: range
        },
        range
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm opacity-90 mb-1", children: "Total Transfers" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-4xl font-bold", children: metrics?.totalTransfers || 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs opacity-80 mt-2", children: [
          "+",
          metrics?.transferGrowth || 0,
          "% vs last ",
          timeRange
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm opacity-90 mb-1", children: "Revenue" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-4xl font-bold", children: [
          "R",
          metrics?.totalRevenue || 0
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs opacity-80 mt-2", children: [
          "+",
          metrics?.revenueGrowth || 0,
          "% vs last ",
          timeRange
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm opacity-90 mb-1", children: "Active Partners" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-4xl font-bold", children: metrics?.activePartners || 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs opacity-80 mt-2", children: [
          metrics?.partnerUtilization || 0,
          "% utilization"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm opacity-90 mb-1", children: "Avg Rating" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-4xl font-bold", children: [
          metrics?.avgRating || 0,
          " ⭐"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs opacity-80 mt-2", children: [
          metrics?.totalRatings || 0,
          " reviews"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border p-6 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold mb-4 text-brand-brown", children: "Popular Routes" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: (metrics?.popularRoutes || []).slice(0, 5).map((route, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-2xl font-bold text-gray-400", children: [
            "#",
            idx + 1
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold", children: [
              route.pickup,
              " → ",
              route.dropoff
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
              route.count,
              " trips"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-bold text-brand-orange", children: [
            "R",
            route.avgPrice
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "avg price" })
        ] })
      ] }, idx)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border p-6 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold mb-4 text-brand-brown", children: "Top Partners" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-3 px-4", children: "Partner" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-3 px-4", children: "Trips" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-3 px-4", children: "Revenue" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-3 px-4", children: "Rating" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-3 px-4", children: "Acceptance Rate" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: (metrics?.topPartners || []).slice(0, 10).map((partner, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b hover:bg-gray-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: partner.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: partner.vehicle })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-right py-3 px-4 font-semibold", children: partner.trips }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "text-right py-3 px-4 font-semibold text-green-600", children: [
            "R",
            partner.revenue
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-right py-3 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
            partner.rating,
            " ⭐"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-right py-3 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-semibold ${partner.acceptanceRate >= 80 ? "text-green-600" : partner.acceptanceRate >= 60 ? "text-yellow-600" : "text-red-600"}`, children: [
            partner.acceptanceRate,
            "%"
          ] }) })
        ] }, idx)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold mb-4 text-brand-brown", children: "Peak Hours" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-12 gap-2", children: (metrics?.hourlyDistribution || Array(24).fill(0)).map((count, hour) => {
        const maxCount = Math.max(...metrics?.hourlyDistribution || [1]);
        const height = count / maxCount * 100;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-gray-100 rounded h-32 flex items-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "w-full bg-brand-orange rounded",
              style: { height: `${height}%` },
              title: `${hour}:00 - ${count} trips`
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
            hour,
            "h"
          ] })
        ] }, hour);
      }) })
    ] })
  ] });
}
export {
  TransferAnalytics as default
};
//# sourceMappingURL=TransferAnalytics-BJ_4fNi8.js.map

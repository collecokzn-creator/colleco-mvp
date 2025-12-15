import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { c as useUser } from "./index-DlOecmR0.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
import "./icons-C4AMPM7L.js";
const STORAGE_KEY = "colleco.downloads.metrics";
function getDownloadStats() {
  const records = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  if (records.length === 0) {
    return {
      totalDownloads: 0,
      bySource: {},
      byOS: {},
      byCountry: {},
      byRegion: {},
      byDevice: {},
      timeline: []
    };
  }
  const stats = {
    totalDownloads: records.length,
    bySource: {},
    byOS: {},
    byCountry: {},
    byRegion: {},
    byDevice: {},
    byBrowser: {},
    uniqueCountries: /* @__PURE__ */ new Set(),
    uniqueRegions: /* @__PURE__ */ new Set(),
    timeline: []
  };
  records.forEach((record) => {
    stats.bySource[record.source] = (stats.bySource[record.source] || 0) + 1;
    const os = record.device.os;
    stats.byOS[os] = (stats.byOS[os] || 0) + 1;
    const deviceType = record.device.deviceType;
    stats.byDevice[deviceType] = (stats.byDevice[deviceType] || 0) + 1;
    const browser = record.device.browser;
    stats.byBrowser[browser] = (stats.byBrowser[browser] || 0) + 1;
    const country = record.location.country;
    stats.byCountry[country] = (stats.byCountry[country] || 0) + 1;
    stats.uniqueCountries.add(country);
    const region = record.location.region;
    stats.byRegion[region] = (stats.byRegion[region] || 0) + 1;
    stats.uniqueRegions.add(region);
  });
  stats.uniqueCountries = stats.uniqueCountries.size;
  stats.uniqueRegions = stats.uniqueRegions.size;
  const now = Date.now();
  const last24h = now - 24 * 60 * 60 * 1e3;
  const recent = records.filter((r) => new Date(r.timestamp).getTime() > last24h);
  const timeline = {};
  recent.forEach((record) => {
    const date = new Date(record.timestamp);
    const hour = Math.floor(date.getTime() / (60 * 60 * 1e3));
    timeline[hour] = (timeline[hour] || 0) + 1;
  });
  stats.timeline = Object.entries(timeline).map(([hour, count]) => ({
    timestamp: new Date(parseInt(hour) * 60 * 60 * 1e3).toISOString(),
    downloads: count
  })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  return stats;
}
function getTopDownloadCountries(limit = 10) {
  const stats = getDownloadStats();
  return Object.entries(stats.byCountry).sort(([, a], [, b]) => b - a).slice(0, limit).map(([country, count]) => ({ country, count }));
}
function getDeviceBreakdown() {
  const stats = getDownloadStats();
  return {
    byOS: stats.byOS,
    byDevice: stats.byDevice,
    byBrowser: stats.byBrowser
  };
}
const SESSIONS_KEY = "colleco.usage.sessions";
const EVENTS_KEY = "colleco.usage.events";
const FEATURES_KEY = "colleco.usage.features";
function getUsageStats(timeRange = "all") {
  const sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || "[]");
  const events = JSON.parse(localStorage.getItem(EVENTS_KEY) || "[]");
  const features = JSON.parse(localStorage.getItem(FEATURES_KEY) || "{}");
  let filteredSessions = sessions;
  let filteredEvents = events;
  if (timeRange !== "all") {
    const now = Date.now();
    let cutoff = 0;
    switch (timeRange) {
      case "24h":
        cutoff = now - 24 * 60 * 60 * 1e3;
        break;
      case "7d":
        cutoff = now - 7 * 24 * 60 * 60 * 1e3;
        break;
      case "30d":
        cutoff = now - 30 * 24 * 60 * 60 * 1e3;
        break;
      case "90d":
        cutoff = now - 90 * 24 * 60 * 60 * 1e3;
        break;
    }
    filteredSessions = sessions.filter((s) => new Date(s.startTime).getTime() > cutoff);
    filteredEvents = events.filter((e) => new Date(e.timestamp).getTime() > cutoff);
  }
  const totalSessions = filteredSessions.length;
  const avgSessionDuration = totalSessions > 0 ? filteredSessions.reduce((sum, s) => sum + s.duration, 0) / totalSessions : 0;
  const totalPageViews = filteredEvents.filter((e) => e.type === "pageview").length;
  const avgPageViewsPerSession = totalSessions > 0 ? totalPageViews / totalSessions : 0;
  const totalConversions = filteredEvents.filter((e) => e.type === "conversion").length;
  const conversionRate = totalSessions > 0 ? totalConversions / totalSessions : 0;
  const uniqueUsers = new Set(filteredSessions.map((s) => s.userId)).size;
  const featureStats = Object.entries(features).map(([name, stats]) => ({
    name,
    ...stats,
    adoptionRate: totalSessions > 0 ? stats.views / totalSessions : 0
  }));
  return {
    totalSessions,
    totalPageViews,
    totalConversions,
    avgSessionDuration,
    avgPageViewsPerSession,
    conversionRate,
    uniqueUsers,
    featureStats,
    timeRange
  };
}
function getFeatureAdoption(timeRange = "all") {
  const stats = getUsageStats(timeRange);
  const adoption = stats.featureStats.sort((a, b) => b.adoptionRate - a.adoptionRate).map((f) => ({
    feature: f.name,
    views: f.views,
    adoptionRate: (f.adoptionRate * 100).toFixed(2) + "%",
    lastUsed: f.lastUsed,
    firstUsed: f.firstUsed
  }));
  return adoption;
}
function getConversionFunnel() {
  const events = JSON.parse(localStorage.getItem(EVENTS_KEY) || "[]");
  const conversions = {};
  events.filter((e) => e.type === "conversion").forEach((e) => {
    const type = e.conversionType;
    conversions[type] = (conversions[type] || 0) + 1;
  });
  return Object.entries(conversions).sort(([, a], [, b]) => b - a).map(([type, count]) => ({ conversionType: type, count }));
}
function getTopPages(limit = 10) {
  const events = JSON.parse(localStorage.getItem(EVENTS_KEY) || "[]");
  const pages = {};
  events.filter((e) => e.type === "pageview").forEach((e) => {
    pages[e.page] = (pages[e.page] || 0) + 1;
  });
  return Object.entries(pages).sort(([, a], [, b]) => b - a).slice(0, limit).map(([page, views]) => ({ page, views }));
}
function Analytics() {
  const { user: _user } = useUser();
  const [stats, setStats] = reactExports.useState({
    totalTrips: 0,
    totalSpent: 0,
    favoriteDestination: "None",
    upcomingTrips: 0,
    completedTrips: 0
  });
  const [downloadStats, setDownloadStats] = reactExports.useState(null);
  const [usageStats, setUsageStats] = reactExports.useState(null);
  const [featureAdoption, setFeatureAdoption] = reactExports.useState([]);
  const [conversionFunnel, setConversionFunnel] = reactExports.useState([]);
  const [topPages, setTopPages] = reactExports.useState([]);
  const [topCountries, setTopCountries] = reactExports.useState([]);
  const [deviceBreakdown, setDeviceBreakdown] = reactExports.useState(null);
  const [timeRange, setTimeRange] = reactExports.useState("all");
  const [activeTab, setActiveTab] = reactExports.useState("user");
  reactExports.useEffect(() => {
    const bookings = JSON.parse(localStorage.getItem("colleco.bookings") || "[]");
    const travelHistory = JSON.parse(localStorage.getItem("colleco.travel.history") || "[]");
    const completed = travelHistory.length;
    const upcoming = bookings.filter((b) => b.status === "confirmed" || b.status === "pending").length;
    const totalSpent = travelHistory.reduce((sum, trip) => sum + (trip.amount || 0), 0);
    const destinations = {};
    travelHistory.forEach((trip) => {
      const dest = trip.destination || "Unknown";
      destinations[dest] = (destinations[dest] || 0) + 1;
    });
    const favoriteDestination = Object.keys(destinations).length > 0 ? Object.keys(destinations).reduce((a, b) => destinations[a] > destinations[b] ? a : b) : "None";
    setStats({
      totalTrips: completed + upcoming,
      totalSpent,
      favoriteDestination,
      upcomingTrips: upcoming,
      completedTrips: completed
    });
    const downloads = getDownloadStats();
    setDownloadStats(downloads);
    setTopCountries(getTopDownloadCountries(10));
    setDeviceBreakdown(getDeviceBreakdown());
    const usage = getUsageStats(timeRange);
    setUsageStats(usage);
    setFeatureAdoption(getFeatureAdoption(timeRange));
    setConversionFunnel(getConversionFunnel());
    setTopPages(getTopPages(10));
  }, [timeRange]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-hidden bg-cream min-h-screen", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-brand-brown", children: "CollEco Analytics Dashboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-russty mt-2", children: "Track app performance, user engagement, and travel insights" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 mb-6 border-b border-gray-300", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setActiveTab("user"),
          className: `px-4 py-2 font-medium ${activeTab === "user" ? "text-brand-orange border-b-2 border-brand-orange" : "text-gray-600"}`,
          children: "User Travel"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setActiveTab("downloads"),
          className: `px-4 py-2 font-medium ${activeTab === "downloads" ? "text-brand-orange border-b-2 border-brand-orange" : "text-gray-600"}`,
          children: "📥 Downloads"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setActiveTab("usage"),
          className: `px-4 py-2 font-medium ${activeTab === "usage" ? "text-brand-orange border-b-2 border-brand-orange" : "text-gray-600"}`,
          children: "📊 Usage"
        }
      )
    ] }),
    (activeTab === "downloads" || activeTab === "usage") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTimeRange("24h"), className: `px-3 py-1 rounded ${timeRange === "24h" ? "bg-brand-orange text-white" : "bg-white text-gray-700"}`, children: "24h" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTimeRange("7d"), className: `px-3 py-1 rounded ${timeRange === "7d" ? "bg-brand-orange text-white" : "bg-white text-gray-700"}`, children: "7d" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTimeRange("30d"), className: `px-3 py-1 rounded ${timeRange === "30d" ? "bg-brand-orange text-white" : "bg-white text-gray-700"}`, children: "30d" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTimeRange("all"), className: `px-3 py-1 rounded ${timeRange === "all" ? "bg-brand-orange text-white" : "bg-white text-gray-700"}`, children: "All" })
    ] }),
    activeTab === "user" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg shadow-md p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Total Trips" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-brand-orange", children: stats.totalTrips })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-4xl", children: "✈️" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg shadow-md p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Total Spent" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-3xl font-bold text-brand-orange", children: [
              "R ",
              stats.totalSpent.toFixed(2)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-4xl", children: "💰" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg shadow-md p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Upcoming Trips" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-brand-orange", children: stats.upcomingTrips })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-4xl", children: "📅" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg shadow-md p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Completed" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-brand-russty", children: stats.completedTrips })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-4xl", children: "✅" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gradient-to-r from-brand-orange to-brand-gold rounded-lg shadow-md p-6 mb-8 text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm opacity-90", children: "Favorite Destination" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-4xl font-bold mt-2", children: stats.favoriteDestination })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-6xl", children: "🏖️" })
      ] }) })
    ] }),
    activeTab === "downloads" && downloadStats && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Total Downloads" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-brand-orange", children: downloadStats.totalDownloads })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Unique Countries" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-brand-orange", children: downloadStats.uniqueCountries })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Unique Devices" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-brand-orange", children: downloadStats.uniqueDevices })
        ] })
      ] }),
      deviceBreakdown && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-4", children: "Downloads by OS" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: Object.entries(deviceBreakdown.byOS).map(([os, count]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-700", children: os }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-brand-orange", children: count })
          ] }, os)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-4", children: "Downloads by Device" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: Object.entries(deviceBreakdown.byDevice).map(([device, count]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-700", children: device }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-brand-orange", children: count })
          ] }, device)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-4", children: "Downloads by Browser" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: Object.entries(deviceBreakdown.byBrowser).map(([browser, count]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-700", children: browser }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-brand-orange", children: count })
          ] }, browser)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-4", children: "Downloads by Source" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: Object.entries(downloadStats.bySource).map(([source, count]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-700", children: source }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-brand-orange", children: count })
          ] }, source)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-4", children: "Top 10 Countries" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: topCountries.map(({ country, count }, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-700", children: country }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-brand-orange", children: count })
          ] }, idx)) })
        ] })
      ] })
    ] }),
    activeTab === "usage" && usageStats && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6 mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Sessions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-brand-orange", children: usageStats.totalSessions })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Page Views" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-brand-orange", children: usageStats.totalPageViews })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Conversions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-brand-orange", children: usageStats.totalConversions })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Conversion Rate" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-3xl font-bold text-brand-orange", children: [
            (usageStats.conversionRate * 100).toFixed(1),
            "%"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-4", children: "Top Features by Adoption" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: featureAdoption.slice(0, 5).map((f, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-700", children: f.feature }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-brand-orange", children: f.adoptionRate })
          ] }, idx)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-4", children: "Conversion Funnel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: conversionFunnel.slice(0, 5).map((c, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-700", children: c.conversionType }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-brand-orange", children: c.count })
          ] }, idx)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-md p-6 mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-4", children: "Most Visited Pages" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: topPages.map((p, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center pb-2 border-b border-gray-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-700", children: p.page }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-brand-orange", children: [
            p.views,
            " views"
          ] })
        ] }, idx)) })
      ] })
    ] })
  ] }) });
}
export {
  Analytics as default
};
//# sourceMappingURL=Analytics-DxSi1iJg.js.map

import { j as jsxRuntimeExports, r as reactExports } from "./motion-D9fZRtSt.js";
import { A as AutoSyncBanner } from "./AutoSyncBanner-CKsB_6Rd.js";
import { L as LiveStatCard } from "./LiveStatCard-DJeVqhb9.js";
import { b as createBooking, d as createMockCheckout, l as listPayments, t as totalPaid } from "./client-BwpB5jnn.js";
import { B as Button } from "./Button-BvBK5int.js";
import { W as WorkflowPanel } from "./WorkflowPanel-DczOhPSj.js";
import { L as Link } from "./index-DlOecmR0.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
import "./icons-C4AMPM7L.js";
function FeesBreakdown({ items = [], currency = "USD", fees }) {
  items.reduce((s, it) => s + Math.max(0, Number(it.amount || 0)), 0);
  const f = fees || computeFeesLocal(items);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-cream-border rounded p-3 bg-cream text-brand-brown text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold mb-2", children: "Price breakdown" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Subtotal", value: f.subtotal, currency }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Payment processing", value: f.paymentProcessor, currency }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Platform fee", value: f.platformFee, currency }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Taxes", value: f.taxes, currency }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-cream-border mt-2 pt-2 font-semibold", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Total", value: f.total, currency }) })
  ] });
}
function Row({ label, value, currency }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-0.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(value, currency) })
  ] });
}
function formatCurrency(v, cur) {
  try {
    return new Intl.NumberFormat(void 0, { style: "currency", currency: cur }).format(v);
  } catch {
    return `${cur} ${v.toFixed(2)}`;
  }
}
function computeFeesLocal(items = []) {
  const subtotal = items.reduce((sum, it) => sum + Math.max(0, Number(it.amount || 0)), 0);
  const paymentProcessor = Math.round(subtotal * 0.029 * 100) / 100 + 0.3;
  const platformFee = Math.round(subtotal * 0.05 * 100) / 100;
  const taxes = Math.round(subtotal * 0.15 * 100) / 100;
  const total = Math.round((subtotal + paymentProcessor + platformFee + taxes) * 100) / 100;
  return { subtotal, paymentProcessor, platformFee, taxes, total };
}
function PaymentButton({ items = [], currency = "USD" }) {
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [bookingInfo, setBookingInfo] = reactExports.useState(null);
  const [copied, setCopied] = reactExports.useState(false);
  function sendAnalytics(event, data = {}) {
    try {
      if (window && window.dataLayer && typeof window.dataLayer.push === "function") {
        window.dataLayer.push({ event, ...data });
      }
    } catch (e) {
    }
  }
  async function startCheckout() {
    setError("");
    setLoading(true);
    setBookingInfo(null);
    setCopied(false);
    try {
      const runtimeApi = typeof window !== "undefined" && window.__E2E_API_BASE ? window.__E2E_API_BASE : null;
      const apiBase = runtimeApi || void 0 || "";
      if (apiBase) {
        const payload = { items, customer: {}, currency, metadata: { source: "itinerary" } };
        const created = await createBooking(payload);
        if (!created || !created.booking) throw new Error("Booking creation failed");
        setBookingInfo({ booking: created.booking, checkoutUrl: created.checkout?.checkoutUrl, fees: created.fees });
        sendAnalytics("booking:created", { id: created.booking.id, ref: created.booking.ref });
        return;
      }
      const mock = createMockCheckout({ items, currency, metadata: { source: "itinerary" } });
      setBookingInfo({ sessionId: mock.sessionId, checkoutUrl: mock.checkoutUrl });
      sendAnalytics("booking:created:mock", { sessionId: mock.sessionId });
    } catch (e) {
      setError(e.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  }
  function handleProceed() {
    if (!bookingInfo) return;
    const url = bookingInfo.checkoutUrl;
    if (url) {
      const to = url.startsWith("/") ? `${window.location.origin}${url}` : url;
      sendAnalytics("booking:proceed_to_payment", { bookingRef: bookingInfo.booking?.ref || bookingInfo.sessionId });
      window.location.assign(to);
      return;
    }
    if (bookingInfo.booking && bookingInfo.booking.id) {
      window.location.assign(`/payment-success?bookingId=${bookingInfo.booking.id}`);
      return;
    }
    window.location.assign("/bookings");
  }
  function handleView() {
    if (bookingInfo && bookingInfo.booking && bookingInfo.booking.id) {
      window.location.assign(`/payment-success?bookingId=${bookingInfo.booking.id}`);
      return;
    }
    window.location.assign("/bookings");
  }
  async function handleCopyRef() {
    const ref = bookingInfo?.booking?.ref || bookingInfo?.sessionId || "";
    if (!ref) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(ref);
      } else {
        const ta = document.createElement("textarea");
        ta.value = ref;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2e3);
      sendAnalytics("booking:ref_copied", { ref });
    } catch (e) {
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: !bookingInfo ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: startCheckout, disabled: loading, className: "px-4 py-2 bg-brand-orange text-white rounded hover:bg-brand-highlight disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed", children: loading ? "Creating booking…" : "Pay securely" }),
    error ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-red-600 mt-1", children: error }) : null
  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 border rounded bg-gray-50 mt-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-500", children: "Booking" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm", children: bookingInfo.booking ? bookingInfo.booking.ref : `Session ${bookingInfo.sessionId}` }),
        bookingInfo.booking && bookingInfo.booking.status ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gray-500", children: [
          "Status: ",
          bookingInfo.booking.status
        ] }) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleCopyRef, className: "text-sm text-gray-600 hover:text-gray-800", children: copied ? "Copied!" : "Copy ref" }) })
    ] }),
    bookingInfo.fees ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-sm text-gray-700", children: [
      "Total: ",
      bookingInfo.fees.currency,
      " ",
      bookingInfo.fees.total
    ] }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleProceed, className: "px-3 py-1 bg-brand-orange text-white rounded", children: "Proceed to payment" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleView, className: "px-3 py-1 border rounded", children: "View booking" })
    ] })
  ] }) });
}
function PaymentsHistory() {
  const payments = listPayments().slice().sort((a, b) => (b.paidAt || 0) - (a.paidAt || 0));
  if (!payments.length) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-brand-brown/70", children: "No payments yet." });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-brand-brown", children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-cream-border", children: payments.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "py-2 flex items-center justify-between", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium text-sm", children: [
        "Payment ",
        p.id.slice(0, 8)
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-brand-brown/70", children: new Date(p.paidAt).toLocaleString() })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-semibold", children: [
      p.amount.toFixed(2),
      " ",
      p.currency
    ] })
  ] }, p.id)) }) });
}
function Bookings() {
  const [providers, setProviders] = reactExports.useState([]);
  const [trustedOnly, setTrustedOnly] = reactExports.useState(false);
  const [statusFilter, setStatusFilter] = reactExports.useState(() => {
    try {
      return localStorage.getItem("bookings:statusFilter") || "all";
    } catch {
      return "all";
    }
  });
  const [sortBy, setSortBy] = reactExports.useState(() => {
    try {
      return localStorage.getItem("bookings:sortBy") || "date";
    } catch {
      return "date";
    }
  });
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const autoRefreshTimerRef = reactExports.useRef(null);
  const lastRecommendationRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    try {
      localStorage.setItem("bookings:statusFilter", statusFilter);
    } catch {
    }
  }, [statusFilter]);
  reactExports.useEffect(() => {
    try {
      localStorage.setItem("bookings:sortBy", sortBy);
    } catch {
    }
  }, [sortBy]);
  reactExports.useEffect(() => {
    const refresh = () => {
      try {
        const saved = localStorage.getItem("colleco.bookings");
        if (saved) {
          const _bookings = JSON.parse(saved);
        }
      } catch {
      }
    };
    autoRefreshTimerRef.current = setInterval(refresh, 3e4);
    return () => {
      if (autoRefreshTimerRef.current) clearInterval(autoRefreshTimerRef.current);
    };
  }, []);
  const smartSort = reactExports.useCallback((items2) => {
    const now = /* @__PURE__ */ new Date();
    return items2.sort((a, b) => {
      const aDate = new Date(a.date);
      const bDate = new Date(b.date);
      const aUrgent = a.status === "pending" && aDate - now < 48 * 60 * 60 * 1e3;
      const bUrgent = b.status === "pending" && bDate - now < 48 * 60 * 60 * 1e3;
      if (aUrgent && !bUrgent) return -1;
      if (!aUrgent && bUrgent) return 1;
      if (sortBy === "date") return bDate - aDate;
      if (sortBy === "price") return b.amount - a.amount;
      if (sortBy === "status") {
        const order = { pending: 0, confirmed: 1, completed: 2 };
        return order[a.status] - order[b.status];
      }
      return 0;
    });
  }, [sortBy]);
  const getSmartRecommendation = (items2) => {
    const pendingCount = items2.filter((i) => i.status === "pending").length;
    const upcomingCount = items2.filter((i) => {
      const days = Math.ceil((new Date(i.date) - /* @__PURE__ */ new Date()) / (1e3 * 60 * 60 * 24));
      return days >= 0 && days <= 7 && i.status === "confirmed";
    }).length;
    if (pendingCount > 2) return "⚡ You have multiple pending bookings. Consider confirming soon.";
    if (upcomingCount > 0) return `📅 ${upcomingCount} booking${upcomingCount > 1 ? "s" : ""} coming up this week!`;
    if (items2.length === 0) return "✨ Start planning your next adventure!";
    return null;
  };
  reactExports.useEffect(() => {
    (async () => {
      return;
    })();
  }, []);
  const verifiedIds = reactExports.useMemo(() => new Set((providers || []).filter((p) => p.verified).map((p) => p.id)), [providers]);
  const items = reactExports.useMemo(() => [
    {
      name: "Sea View Hotel (2 nights)",
      amount: 180,
      providerId: "hotel-123",
      status: "confirmed",
      date: "2024-10-01",
      category: "Accommodation"
    },
    {
      name: "Table Mountain Hike",
      amount: 60,
      providerId: "hike-789",
      status: "confirmed",
      date: "2024-10-02",
      category: "Activity"
    },
    {
      name: "Airport Transfer",
      amount: 45,
      providerId: "transfer-456",
      status: "pending",
      date: "2024-09-30",
      category: "Transport"
    },
    {
      name: "Safari Tour (3 days)",
      amount: 320,
      providerId: "safari-321",
      status: "completed",
      date: "2024-09-15",
      category: "Activity"
    }
  ], []);
  const filteredAndSortedItems = reactExports.useMemo(() => {
    let filtered = [...items];
    if (statusFilter !== "all") {
      filtered = filtered.filter((it) => it.status === statusFilter);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(
        (it) => it.name.toLowerCase().includes(term) || it.category.toLowerCase().includes(term) || it.status.toLowerCase().includes(term)
      );
    }
    return smartSort(filtered);
  }, [items, trustedOnly, verifiedIds, statusFilter, searchTerm, smartSort]);
  reactExports.useMemo(() => {
    const rec = getSmartRecommendation(filteredAndSortedItems);
    lastRecommendationRef.current = rec;
    return rec;
  }, [filteredAndSortedItems]);
  function exportToCSV() {
    const headers = ["Name", "Amount", "Status", "Date", "Category"];
    const rows = filteredAndSortedItems.map((it) => [
      it.name,
      it.amount,
      it.status,
      it.date,
      it.category
    ]);
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-br from-cream via-white to-cream-sand overflow-x-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 sm:mb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-3xl sm:text-4xl font-bold text-brand-brown flex items-center gap-3", children: [
          "Bookings",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1 text-xs bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 px-3 py-1.5 rounded-full font-semibold border border-green-200 shadow-sm", title: "Auto-refresh, smart sorting, and intelligent recommendations enabled", children: "Smart Mode" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-brand-russty text-sm sm:text-base", children: "All your confirmed items in one place — always up to date." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 sm:gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/check-in", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "primary", size: "md", children: "Check-In" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "md", onClick: exportToCSV, title: "Export to CSV", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Export" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sm:hidden", children: "CSV" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AutoSyncBanner, { message: "Bookings sync with partners automatically — no manual refresh needed." }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(WorkflowPanel, { currentPage: "bookings", basketCount: 0 }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LiveStatCard, { title: "Upcoming", value: "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LiveStatCard, { title: "Total paid", value: `$${totalPaid().toFixed(2)}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LiveStatCard, { title: "Changes pending", value: "—" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "bg-white rounded-xl shadow-md border border-cream-border p-4 sm:p-6 mb-4 sm:mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-4", children: "Filter & Search" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-brand-russty", children: "🔍" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: searchTerm,
              onChange: (e) => setSearchTerm(e.target.value),
              placeholder: "Search bookings...",
              className: "w-full pl-10 pr-4 py-2.5 text-sm border-2 border-cream-border rounded-lg bg-cream focus:border-brand-orange focus:outline-none transition-colors",
              "aria-label": "Search bookings"
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0 sm:min-w-[160px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-brand-brown whitespace-nowrap", children: "Sort by:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: sortBy,
              onChange: (e) => setSortBy(e.target.value),
              className: "flex-1 px-3 py-2.5 text-sm border-2 border-cream-border rounded-lg bg-cream focus:border-brand-orange focus:outline-none transition-colors font-medium",
              "aria-label": "Sort by",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "date", children: "Date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "price", children: "Price" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "status", children: "Status" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-brand-brown mb-2", children: "Status:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: ["all", "pending", "confirmed", "completed"].map((status) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setStatusFilter(status),
            className: `px-4 py-2 text-sm font-semibold rounded-lg transition-all ${statusFilter === status ? "bg-brand-orange text-white shadow-md" : "bg-cream border-2 border-cream-border text-brand-brown hover:border-brand-orange hover:bg-cream-sand"}`,
            children: status.charAt(0).toUpperCase() + status.slice(1)
          },
          status
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "inline-flex items-center gap-2 text-sm font-medium text-brand-brown cursor-pointer hover:text-brand-orange transition-colors", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", className: "w-4 h-4 accent-brand-orange rounded", checked: trustedOnly, onChange: (e) => setTrustedOnly(e.target.checked) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Show trusted providers only" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded-full", children: "✓" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "bg-white rounded-xl shadow-sm border border-cream-border p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-brand-brown", children: "Your Bookings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-3 py-1 bg-brand-orange/10 text-brand-orange rounded-full text-sm font-semibold", children: [
          filteredAndSortedItems.length,
          " ",
          filteredAndSortedItems.length === 1 ? "item" : "items"
        ] })
      ] }),
      filteredAndSortedItems.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-12 sm:py-16 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-6xl mb-4", children: "📋" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-brown/70 text-base sm:text-lg mb-2", children: "No bookings found" }),
        statusFilter !== "all" ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-russty", children: "Try changing the filter to see more results" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-col sm:flex-row gap-3 justify-center items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/plan-trip", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "primary", size: "md", children: "🗺️ Plan a Trip" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/packages", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "md", children: "📦 Browse Packages" }) })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: filteredAndSortedItems.map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border border-cream-border hover:border-brand-orange rounded-xl p-5 transition-all hover:shadow-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-brand-brown text-lg", children: item.name }),
            null
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-brand-russty", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Date:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-brand-russty", children: "Amount:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-brand-orange", children: [
                "$",
                item.amount
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-3 py-1 bg-cream-sand text-brand-brown rounded-lg text-xs font-semibold", children: item.category }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap ${item.status === "confirmed" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : item.status === "pending" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-white text-brand-russty border border-cream-border"}`, children: item.status.charAt(0).toUpperCase() + item.status.slice(1) }),
          item.status === "confirmed" && /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/check-in", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-xs font-medium text-brand-orange hover:text-brand-brown transition-colors underline", children: "Quick Check-In →" }) })
        ] })
      ] }) }, idx)) }),
      filteredAndSortedItems.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 sm:mt-8 pt-6 border-t-2 border-cream-border overflow-x-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-lg font-bold text-brand-brown mb-4", children: "Payment Summary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FeesBreakdown, { items: filteredAndSortedItems, currency: "USD" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentButton, { items: filteredAndSortedItems, currency: "USD" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 sm:mt-8 pt-6 border-t-2 border-cream-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-lg font-bold text-brand-brown mb-4", children: "Payments History" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentsHistory, {})
      ] })
    ] })
  ] }) });
}
export {
  Bookings as default
};
//# sourceMappingURL=Bookings-BYtPTBMw.js.map

import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { B as Button } from "./Button-BvBK5int.js";
import { D as Download, C as Calendar, a as DollarSign, T as TrendingUp, F as Filter, b as FileText } from "./icons-C4AMPM7L.js";
import "./react-4gMnsuNC.js";
function AdminBookings() {
  const [bookings, setBookings] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [filters, setFilters] = reactExports.useState({
    supplierId: "",
    paymentStatus: "",
    dateFrom: "",
    dateTo: ""
  });
  const [stats, setStats] = reactExports.useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalCommission: 0,
    pendingPayments: 0
  });
  const loadBookings = reactExports.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.supplierId) params.append("supplierId", filters.supplierId);
      if (filters.paymentStatus) params.append("paymentStatus", filters.paymentStatus);
      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.append("dateTo", filters.dateTo);
      const response = await fetch(`/api/admin/bookings?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
        calculateStats(data.bookings || []);
      }
    } catch (error) {
      console.error("Failed to load bookings:", error);
    }
    setLoading(false);
  }, [filters.supplierId, filters.paymentStatus, filters.dateFrom, filters.dateTo]);
  reactExports.useEffect(() => {
    loadBookings();
  }, [loadBookings]);
  function calculateStats(bookings2) {
    const stats2 = bookings2.reduce((acc, booking) => {
      acc.totalBookings++;
      acc.totalRevenue += booking.pricing.subtotal;
      acc.totalCommission += booking.pricing.commissionAmount;
      if (booking.paymentStatus === "pending") {
        acc.pendingPayments += booking.pricing.total;
      }
      return acc;
    }, {
      totalBookings: 0,
      totalRevenue: 0,
      totalCommission: 0,
      pendingPayments: 0
    });
    setStats(stats2);
  }
  async function exportToCSV() {
    try {
      const response = await fetch("/api/admin/bookings/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters)
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `bookings-export-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export bookings");
    }
  }
  async function downloadInvoice(bookingId) {
    try {
      const response = await fetch(`/api/invoices/${bookingId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Invoice_${bookingId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert("Failed to download invoice");
      }
    } catch (error) {
      console.error("Invoice download failed:", error);
      alert("Failed to download invoice");
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-cream min-h-screen p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-brand-brown", children: "Bookings Management" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Internal monitoring with full commission breakdown" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: exportToCSV, className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }),
        "Export CSV"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg shadow-sm border border-cream-border p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-5 w-5 text-blue-600" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600", children: "Total Bookings" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-brand-brown", children: stats.totalBookings })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg shadow-sm border border-cream-border p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-green-100 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-5 w-5 text-green-600" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600", children: "Total Revenue" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-brand-brown", children: [
            "ZAR ",
            stats.totalRevenue.toFixed(0)
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg shadow-sm border border-cream-border p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-5 w-5 text-orange-600" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600", children: "CollEco Commission" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-brand-orange", children: [
            "ZAR ",
            stats.totalCommission.toFixed(0)
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg shadow-sm border border-cream-border p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-5 w-5 text-yellow-600" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600", children: "Pending Payments" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-yellow-600", children: [
            "ZAR ",
            stats.pendingPayments.toFixed(0)
          ] })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-sm border border-cream-border p-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Filter, { className: "h-4 w-4 text-gray-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-brand-brown", children: "Filters" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: filters.supplierId,
            onChange: (e) => setFilters({ ...filters, supplierId: e.target.value }),
            className: "border border-cream-border rounded-lg px-3 py-2 text-sm",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All Suppliers" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "beekman", children: "Beekman Holidays" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "premier", children: "Premier Hotels" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: filters.paymentStatus,
            onChange: (e) => setFilters({ ...filters, paymentStatus: e.target.value }),
            className: "border border-cream-border rounded-lg px-3 py-2 text-sm",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All Statuses" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "pending", children: "Pending" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "completed", children: "Completed" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "failed", children: "Failed" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "refunded", children: "Refunded" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "date",
            value: filters.dateFrom,
            onChange: (e) => setFilters({ ...filters, dateFrom: e.target.value }),
            placeholder: "From Date",
            className: "border border-cream-border rounded-lg px-3 py-2 text-sm"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "date",
            value: filters.dateTo,
            onChange: (e) => setFilters({ ...filters, dateTo: e.target.value }),
            placeholder: "To Date",
            className: "border border-cream-border rounded-lg px-3 py-2 text-sm"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg shadow-sm border border-cream-border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-cream", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-left text-xs font-semibold text-gray-700", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Booking ID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Property/Supplier" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Customer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Check-in" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right", children: "Base Price" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right", children: "Commission" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right", children: "Total" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Payment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-cream-border", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: "10", className: "px-4 py-8 text-center text-gray-500", children: "Loading bookings..." }) }) : bookings.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: "10", className: "px-4 py-8 text-center text-gray-500", children: "No bookings found" }) }) : bookings.map((booking) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-cream-50 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-gray-600", children: booking.id }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown", children: booking.metadata?.propertyName || "N/A" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 capitalize", children: booking.supplierId })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700", children: booking.userId }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-gray-700", children: booking.checkInDate }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs", children: booking.bookingType }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-right text-gray-700", children: [
          "ZAR ",
          booking.pricing.subtotal.toFixed(2)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-green-600", children: [
            "ZAR ",
            booking.pricing.commissionAmount.toFixed(2)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500", children: [
            booking.pricing.commissionPercent,
            "% • ",
            booking.commissionModel
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-right font-semibold text-brand-brown", children: [
          "ZAR ",
          booking.pricing.total.toFixed(2)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-2 py-1 rounded text-xs ${booking.paymentStatus === "completed" ? "bg-green-100 text-green-700" : booking.paymentStatus === "pending" ? "bg-yellow-100 text-yellow-700" : booking.paymentStatus === "failed" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`, children: booking.paymentStatus }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "a",
            {
              href: `/admin/bookings/${booking.id}`,
              className: "text-brand-orange hover:text-orange-600 text-xs font-semibold",
              children: "Details"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => downloadInvoice(booking.id),
              className: "text-brand-orange hover:text-orange-600 flex items-center gap-1",
              title: "Download invoice PDF",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" })
            }
          )
        ] }) })
      ] }, booking.id)) })
    ] }) }) })
  ] }) });
}
export {
  AdminBookings as default
};
//# sourceMappingURL=AdminBookings-NdyFHFu3.js.map

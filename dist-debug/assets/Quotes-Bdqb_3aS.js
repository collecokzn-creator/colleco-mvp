import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { f as formatCurrency } from "./currency-J2bxD4Bj.js";
import { g as generateQuotePdf } from "./pdfGenerators-Dpk5CIWQ.js";
import { W as WorkflowPanel } from "./WorkflowPanel-DczOhPSj.js";
import { B as Button } from "./Button-BvBK5int.js";
import { g as getQuotes, d as deleteQuote, c as createQuote } from "./quotes-Cs8OmkV4.js";
import { u as useNavigate } from "./index-DlOecmR0.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
import "./icons-C4AMPM7L.js";
function Quotes() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  reactExports.useEffect(() => {
    let mounted = true;
    setLoading(true);
    getQuotes().then((qs) => {
      if (mounted) setQuotes(qs || []);
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);
  const computeTotals = (q) => {
    const subtotal = (q?.items || []).reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0);
    const taxRate = q?.taxRate || 0;
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };
  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this quote?")) return;
    try {
      await deleteQuote(id);
      setQuotes((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
    }
  }
  async function handleClone(id) {
    const src = quotes.find((q) => q.id === id);
    if (!src) return;
    const copy = { ...src, id: void 0, clientName: `${src.clientName} (Copy)`, createdAt: void 0, updatedAt: void 0 };
    try {
      const created = await createQuote(copy);
      setQuotes((prev) => [created, ...prev]);
    } catch (e) {
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-hidden bg-cream min-h-screen", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl sm:text-4xl font-bold text-brand-brown mb-2", children: "Quotes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-russty", children: "Manage client quotations and pricing" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => navigate("/quote/new"), variant: "primary", size: "md", children: "New Quote" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg shadow-sm border border-cream-border p-6 hover:shadow-md transition-shadow", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-russty", children: "Total Quotes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-brand-orange", children: quotes.length })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg shadow-sm border border-cream-border p-6 hover:shadow-md transition-shadow", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-russty", children: "Accepted" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-brand-orange", children: quotes.filter((q) => q.status === "accepted").length })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg shadow-sm border border-cream-border p-6 hover:shadow-md transition-shadow", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-russty", children: "Pending" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-brand-orange", children: quotes.filter((q) => q.status === "sent").length })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(WorkflowPanel, { currentPage: "quotes", basketCount: 0, hasQuote: quotes.length > 0 }) }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-block w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-brand-russty", children: "Loading quotes..." })
    ] }) : quotes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-sm border border-cream-border p-12 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-6xl mb-4 opacity-20", children: "📋" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-semibold text-brand-brown mb-2", children: "No quotes yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-russty mb-6", children: "Create your first quote to get started" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => navigate("/quote/new"), variant: "primary", size: "md", children: "Create Quote" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: quotes.map((q) => {
      const { total } = computeTotals(q);
      const getStatusStyle = (status) => {
        const s = status?.toLowerCase();
        if (s === "accepted" || s === "paid") return "bg-green-100 text-green-800";
        if (s === "sent") return "bg-brand-orange/10 text-brand-orange";
        if (s === "rejected" || s === "cancelled") return "bg-red-100 text-red-800";
        return "bg-cream-sand text-brand-brown";
      };
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg shadow-sm border border-cream-border p-6 hover:shadow-md transition-shadow", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-brand-brown mb-2", children: q.clientName || "Untitled Quote" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(q.status)}`, children: q.status || "Draft" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-brand-russty", children: [
              q.items?.length || 0,
              " ",
              q.items?.length === 1 ? "item" : "items"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-brand-orange", children: formatCurrency(total, q.currency) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-brand-russty", children: [
            "Updated ",
            new Date(q.updatedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric"
            })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => navigate("/quote/new?edit=" + q.id), variant: "primary", size: "sm", children: "Open" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => generateQuotePdf(q), variant: "outline", size: "sm", children: "PDF" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => handleClone(q.id), variant: "secondary", size: "sm", children: "Clone" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => handleDelete(q.id), variant: "danger", size: "sm", children: "Delete" })
        ] })
      ] }) }, q.id);
    }) })
  ] }) });
}
export {
  Quotes as default
};
//# sourceMappingURL=Quotes-Bdqb_3aS.js.map

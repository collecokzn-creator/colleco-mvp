import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { u as useBasketState } from "./useBasketState-DcL2gvap.js";
import { g as generateQuotePdf } from "./pdfGenerators-Dpk5CIWQ.js";
import { f as formatCurrency } from "./currency-J2bxD4Bj.js";
import { c as createQuote, u as updateQuote } from "./quotes-Cs8OmkV4.js";
import { b as useLocation } from "./index-DlOecmR0.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
import "./icons-C4AMPM7L.js";
const KEY = "quotes:v1";
const newId = () => "q_" + Math.random().toString(36).slice(2, 10);
const newItemId = () => "qi_" + Math.random().toString(36).slice(2, 10);
function useQuotesState() {
  const [quotes, setQuotes] = reactExports.useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  reactExports.useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(quotes));
    } catch {
    }
  }, [quotes]);
  const createQuote2 = reactExports.useCallback((data = {}) => {
    const q = {
      id: newId(),
      clientName: data.clientName || "",
      clientEmail: data.clientEmail || "",
      quoteNumber: data.quoteNumber || (() => {
        const d = /* @__PURE__ */ new Date();
        const y = d.getFullYear();
        const seq = Math.floor(Math.random() * 9e3) + 1e3;
        return `Q-${y}-${seq}`;
      })(),
      dueDate: data.dueDate || "",
      currency: data.currency || "USD",
      items: [],
      taxRate: data.taxRate || 0,
      discountRate: data.discountRate || 0,
      notes: data.notes || "",
      status: "Draft",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    setQuotes((qs) => [...qs, q]);
    return q.id;
  }, []);
  const updateQuote2 = reactExports.useCallback((id, patch) => {
    setQuotes((qs) => qs.map((q) => q.id === id ? { ...q, ...patch, updatedAt: (/* @__PURE__ */ new Date()).toISOString() } : q));
  }, []);
  const deleteQuote = reactExports.useCallback((id) => {
    setQuotes((qs) => qs.filter((q) => q.id !== id));
  }, []);
  reactExports.useCallback((id) => {
    setQuotes((qs) => {
      const src = qs.find((q) => q.id === id);
      if (!src) return qs;
      const cloned = {
        ...src,
        id: newId(),
        status: "Draft",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        items: src.items.map((i) => ({ ...i, id: newItemId() }))
      };
      return [...qs, cloned];
    });
  }, []);
  const addItem = reactExports.useCallback((quoteId, item) => {
    setQuotes((qs) => qs.map((q) => {
      if (q.id !== quoteId) return q;
      const newItem = { id: newItemId(), title: "", unitPrice: 0, quantity: 1, ...item };
      return { ...q, items: [...q.items, newItem], updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
    }));
  }, []);
  const updateItem = reactExports.useCallback((quoteId, itemId, patch) => {
    setQuotes((qs) => qs.map((q) => {
      if (q.id !== quoteId) return q;
      return {
        ...q,
        items: q.items.map((i) => i.id === itemId ? { ...i, ...patch } : i),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }));
  }, []);
  const removeItem = reactExports.useCallback((quoteId, itemId) => {
    setQuotes((qs) => qs.map((q) => q.id === quoteId ? { ...q, items: q.items.filter((i) => i.id !== itemId), updatedAt: (/* @__PURE__ */ new Date()).toISOString() } : q));
  }, []);
  const computeTotals = reactExports.useCallback((quote) => {
    if (!quote) return { subtotal: 0, discount: 0, tax: 0, total: 0 };
    const rawSubtotal = (quote.items || []).reduce((sum, i) => sum + Number(i.unitPrice || 0) * Number(i.quantity || 1), 0);
    const discountRate = Math.max(0, Math.min(100, Number(quote.discountRate || 0)));
    const discount = discountRate ? rawSubtotal * (discountRate / 100) : 0;
    const subtotal = rawSubtotal - discount;
    const taxRate = Math.max(0, Number(quote.taxRate || 0));
    const tax = taxRate ? subtotal * (taxRate / 100) : 0;
    const total = subtotal + tax;
    return { subtotal, discount, tax, total };
  }, []);
  const setStatus = reactExports.useCallback((id, status) => {
    const allowed = ["Draft", "Sent", "Accepted", "Declined"];
    if (!allowed.includes(status)) return;
    updateQuote2(id, { status });
  }, [updateQuote2]);
  return {
    quotes,
    createQuote: createQuote2,
    updateQuote: updateQuote2,
    deleteQuote,
    addItem,
    updateItem,
    removeItem,
    computeTotals,
    setStatus
  };
}
function NewQuote() {
  const { quotes, createQuote: createQuote$1, updateQuote: updateQuote$1, addItem, updateItem, removeItem, computeTotals, setStatus } = useQuotesState();
  const { paidItems } = useBasketState();
  const loc = useLocation();
  const params = new URLSearchParams(loc.search);
  const editingId = params.get("edit");
  const [quoteId, setQuoteId] = reactExports.useState(editingId || null);
  const [created, setCreated] = reactExports.useState(false);
  const [errors, setErrors] = reactExports.useState({});
  reactExports.useEffect(() => {
    if (!quoteId) {
      const id = createQuote$1({});
      setQuoteId(id);
      setCreated(true);
      if (!editingId && loc.state?.fromBasket && paidItems.length) {
        paidItems.forEach((pi) => {
          addItem(id, { title: pi.title, description: pi.description, category: pi.category, unitPrice: pi.price, quantity: pi.quantity || 1 });
        });
      }
    }
  }, [quoteId, createQuote$1, editingId, loc.state, paidItems, addItem]);
  const quote = quotes.find((q) => q.id === quoteId);
  function handleAddItem() {
    if (!quote) return;
    addItem(quote.id, { title: "New Line Item", unitPrice: 0, quantity: 1 });
  }
  function handleExport() {
    if (!quote) return;
    generateQuotePdf(quote);
  }
  if (!quote) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: "Loading Quote..." });
  const { subtotal, discount, tax, total } = computeTotals(quote);
  async function handleSave() {
    setErrors({});
    const payload = { clientName: quote.clientName, clientEmail: quote.clientEmail, currency: quote.currency, items: quote.items, taxRate: quote.taxRate, discountRate: quote.discountRate, notes: quote.notes, status: quote.status, dueDate: quote.dueDate };
    try {
      let res;
      const isTmp = String(quote.id || "").startsWith("tmp_") || !quote.id;
      if (isTmp) {
        res = await createQuote(payload);
        if (res && res.id) {
          updateQuote$1(quote.id, { id: res.id, createdAt: res.createdAt || Date.now(), updatedAt: res.updatedAt || Date.now(), quoteNumber: res.quoteNumber || quote.quoteNumber });
        }
      } else {
        res = await updateQuote(quote.id, payload);
        if (res && res.id) updateQuote$1(quote.id, { ...res });
      }
      setCreated(false);
    } catch (e) {
      if (e && e.body && Array.isArray(e.body.details)) {
        const map = {};
        for (const d of e.body.details) {
          map[d.field] = d.message;
        }
        setErrors(map);
      } else {
        setErrors({ _global: "Save failed. Try again." });
      }
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-8 text-brand-brown max-w-5xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold", children: editingId ? "Edit Quote" : "New Quote" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleExport, className: "px-3 py-2 rounded border border-brand-brown text-brand-brown hover:bg-cream-hover", children: "Export PDF" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleSave, className: "px-3 py-2 rounded bg-brand-orange text-white", children: "Save" })
      ] })
    ] }),
    created && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown/70 mb-4", children: "A draft quote was created — fill in details below." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 md:grid-cols-3 mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 md:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-cream rounded border border-cream-border p-4 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold mb-2", children: "Quote Details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex flex-col gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-wide text-brand-brown/70", children: "Client Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: quote.clientName, onChange: (e) => updateQuote$1(quote.id, { clientName: e.target.value }), className: "px-2 py-1 rounded border border-cream-border bg-white" }),
              errors["clientName"] && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-red-600 text-sm", children: errors["clientName"] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex flex-col gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-wide text-brand-brown/70", children: "Client Email" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", value: quote.clientEmail || "", onChange: (e) => updateQuote$1(quote.id, { clientEmail: e.target.value }), className: "px-2 py-1 rounded border border-cream-border bg-white" }),
              errors["clientEmail"] && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-red-600 text-sm", children: errors["clientEmail"] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex flex-col gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-wide text-brand-brown/70", children: "Currency" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: quote.currency, onChange: (e) => updateQuote$1(quote.id, { currency: e.target.value }), className: "px-2 py-1 rounded border border-cream-border bg-white", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "USD", children: "USD" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "EUR", children: "EUR" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ZAR", children: "ZAR" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "GBP", children: "GBP" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex flex-col gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-wide text-brand-brown/70", children: "Quote Number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: quote.quoteNumber || "", readOnly: true, className: "px-2 py-1 rounded border border-cream-border bg-white text-brand-brown/60" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex flex-col gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-wide text-brand-brown/70", children: "Tax Rate (%)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: "0", value: quote.taxRate, onChange: (e) => updateQuote$1(quote.id, { taxRate: Number(e.target.value) }), className: "px-2 py-1 rounded border border-cream-border bg-white" }),
              errors["taxRate"] && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-red-600 text-sm", children: errors["taxRate"] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex flex-col gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-wide text-brand-brown/70", children: "Discount (%)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: "0", max: "100", value: quote.discountRate || 0, onChange: (e) => updateQuote$1(quote.id, { discountRate: Number(e.target.value) }), className: "px-2 py-1 rounded border border-cream-border bg-white" }),
              errors["discountRate"] && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-red-600 text-sm", children: errors["discountRate"] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex flex-col gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-wide text-brand-brown/70", children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: quote.status, onChange: (e) => setStatus(quote.id, e.target.value), className: "px-2 py-1 rounded border border-cream-border bg-white", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Draft" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Sent" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Accepted" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Declined" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex flex-col gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-wide text-brand-brown/70", children: "Due Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", value: quote.dueDate || "", onChange: (e) => updateQuote$1(quote.id, { dueDate: e.target.value }), className: "px-2 py-1 rounded border border-cream-border bg-white" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex flex-col gap-1 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-wide text-brand-brown/70", children: "Internal / Client Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { rows: 3, value: quote.notes, onChange: (e) => updateQuote$1(quote.id, { notes: e.target.value }), className: "px-2 py-1 rounded border border-cream-border bg-white" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-cream rounded border border-cream-border p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold", children: "Line Items" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleAddItem, className: "px-2 py-1 text-xs rounded border border-brand-brown text-brand-brown hover:bg-cream-hover", children: "Add Item" })
          ] }),
          quote.items.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown/60", children: "No items yet. Add your first line." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-3", children: quote.items.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "bg-white rounded border border-cream-border p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-5 gap-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex flex-col gap-1 md:col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-wide text-brand-brown/60", children: "Title" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: i.title, onChange: (e) => updateItem(quote.id, i.id, { title: e.target.value }), className: "px-2 py-1 rounded border border-cream-border bg-cream-sand" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex flex-col gap-1 md:col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-wide text-brand-brown/60", children: "Description" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: i.description || "", onChange: (e) => updateItem(quote.id, i.id, { description: e.target.value }), className: "px-2 py-1 rounded border border-cream-border bg-cream-sand" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex flex-col gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-wide text-brand-brown/60", children: "Category" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: i.category || "", onChange: (e) => updateItem(quote.id, i.id, { category: e.target.value }), className: "px-2 py-1 rounded border border-cream-border bg-cream-sand" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex flex-col gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-wide text-brand-brown/60", children: "Unit Price" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: "0", value: i.unitPrice, onChange: (e) => updateItem(quote.id, i.id, { unitPrice: Number(e.target.value) }), className: "px-2 py-1 rounded border border-cream-border bg-cream-sand" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex flex-col gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-wide text-brand-brown/60", children: "Qty" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: "1", value: i.quantity, onChange: (e) => updateItem(quote.id, i.id, { quantity: Number(e.target.value) }), className: "px-2 py-1 rounded border border-cream-border bg-cream-sand" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-wide text-brand-brown/60", children: "Line Total" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-2 py-1 rounded bg-cream-sand border border-cream-border", children: formatCurrency(Number(i.unitPrice) * Number(i.quantity || 1), quote.currency) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => removeItem(quote.id, i.id), className: "mt-auto px-2 py-1 text-xs rounded bg-red-500 text-white hover:bg-red-400", children: "Remove" }) })
          ] }) }, i.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-cream rounded border border-cream-border p-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold mb-2", children: "Summary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between py-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-brand-brown/70", children: "Subtotal" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(subtotal, quote.currency) })
        ] }),
        discount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between py-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-brand-brown/70", children: [
            "Discount (",
            quote.discountRate || 0,
            "%)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "-",
            formatCurrency(discount, quote.currency)
          ] })
        ] }),
        quote.taxRate > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between py-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-brand-brown/70", children: [
            "Tax (",
            quote.taxRate,
            "%)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(tax, quote.currency) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between py-1 font-semibold border-t border-cream-border mt-2 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(total, quote.currency) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-brand-brown/60 mt-3", children: [
          "Status: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: quote.status })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-brand-brown/60", children: [
          "Created: ",
          new Date(quote.createdAt).toLocaleString()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-brand-brown/60", children: [
          "Updated: ",
          new Date(quote.updatedAt).toLocaleString()
        ] }),
        quote.dueDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-brand-brown/60", children: [
          "Due: ",
          new Date(quote.dueDate).toLocaleDateString()
        ] })
      ] }) })
    ] })
  ] });
}
export {
  NewQuote as default
};
//# sourceMappingURL=NewQuote-spyZAHeU.js.map

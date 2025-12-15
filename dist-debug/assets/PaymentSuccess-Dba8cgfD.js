import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { g as getBooking, c as confirmMockPayment, a as getPayment } from "./client-BwpB5jnn.js";
import { b as FileText } from "./icons-C4AMPM7L.js";
import { L as Link } from "./index-DlOecmR0.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
function PaymentSuccess() {
  let params = new URLSearchParams(window.location.search);
  if (!params.get("bookingId") && !params.get("sessionId") && window.location.hash && window.location.hash.includes("?")) {
    try {
      const hashQuery = window.location.hash.split("?")[1] || "";
      params = new URLSearchParams(hashQuery);
    } catch (e) {
    }
  }
  const sessionId = params.get("sessionId");
  const [status, setStatus] = reactExports.useState("processing");
  const [payment, setPayment] = reactExports.useState(null);
  const bookingId = params.get("bookingId");
  async function downloadInvoice() {
    if (!bookingId) {
      alert("No booking ID available");
      return;
    }
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
  reactExports.useEffect(() => {
    if (bookingId) {
      try {
        if (typeof window !== "undefined" && window.__E2E_BOOKING && window.__E2E_BOOKING.id === bookingId) {
          const b = window.__E2E_BOOKING;
          if (b.pricing) {
            const p2 = b.pricing;
            setPayment({ id: b.id, amount: p2.total || 0, currency: p2.currency || "ZAR", items: p2.items || [], pricing: p2 });
          } else {
            const fees = b.items ? { total: b.items.reduce((s, i) => s + (Number(i.amount || i.price || 0) || 0), 0) } : null;
            setPayment({ id: b.id, amount: Number(fees?.total || 0), currency: "USD", items: b.items || [] });
          }
          setStatus("ok");
          return;
        }
      } catch (e) {
      }
      (async () => {
        try {
          const res = await getBooking(bookingId);
          if (res && res.booking) {
            if (res.booking.pricing) {
              const p2 = res.booking.pricing;
              setPayment({ id: res.booking.id, amount: p2.total || 0, currency: p2.currency || "ZAR", items: p2.items || [], pricing: p2 });
            } else {
              const fees = res.booking.items ? { total: res.booking.items.reduce((s, i) => s + (Number(i.amount || i.price || 0) || 0), 0) } : null;
              setPayment({ id: res.booking.id, amount: Number(fees?.total || 0), currency: "USD", items: res.booking.items || [] });
            }
            setStatus("ok");
            return;
          }
          setStatus("error");
        } catch (e) {
          setStatus("error");
        }
      })();
      return;
    }
    if (!sessionId) {
      setStatus("error");
      return;
    }
    const p = confirmMockPayment(sessionId) || getPayment(sessionId);
    if (p) {
      setPayment(p);
      setStatus("ok");
    } else {
      setStatus("error");
    }
  }, [sessionId, bookingId]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-8 text-brand-brown", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold mb-2", children: "Payment success" }),
    status === "processing" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-brown/80", children: "Finalizing your payment…" }),
    status === "ok" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-cream-sand p-4 border border-cream-border rounded", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold mb-1", children: "Thank you! Your payment is confirmed." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-brand-brown/80", children: [
        "Reference: ",
        payment?.id
      ] }),
      payment?.pricing ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 text-sm text-brand-brown/80", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Pricing breakdown" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1", children: [
          "Subtotal: ",
          payment.pricing.currency,
          " ",
          Number(payment.pricing.subtotal || 0).toFixed(2)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          "CollEco service fees: ",
          payment.pricing.currency,
          " ",
          Number(payment.pricing.totalServiceFees || 0).toFixed(2)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          "Partner commission (",
          payment.pricing.commissionTier || "",
          " @ ",
          Math.round((payment.pricing.commissionRate || 0) * 100),
          "%): ",
          payment.pricing.currency,
          " ",
          Number(payment.pricing.commission || 0).toFixed(2)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold mt-1", children: [
          "Partner receives: ",
          payment.pricing.currency,
          " ",
          Number(payment.pricing.partnerReceives || 0).toFixed(2)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1", children: [
          "Total charged: ",
          payment.pricing.currency,
          " ",
          Number(payment.pricing.total || 0).toFixed(2)
        ] })
      ] }) : payment?.items?.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold mb-1", children: "Summary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "text-sm list-disc list-inside", children: payment.items.map((i, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          i.name,
          " — $",
          Number(i.amount || 0).toFixed(2)
        ] }, idx)) })
      ] }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/bookings", className: "px-3 py-2 bg-brand-orange text-white rounded hover:bg-orange-600 transition", children: "Back to Bookings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: downloadInvoice,
            className: "px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition flex items-center gap-2",
            title: "Download invoice PDF",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" }),
              "Download Invoice"
            ]
          }
        )
      ] })
    ] }),
    status === "error" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-600", children: "We couldn't find your session." })
  ] });
}
export {
  PaymentSuccess as default
};
//# sourceMappingURL=PaymentSuccess-Dba8cgfD.js.map

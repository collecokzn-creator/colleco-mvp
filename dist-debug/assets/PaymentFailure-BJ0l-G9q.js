import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { b as useLocation, u as useNavigate, L as Link } from "./index-DlOecmR0.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
import "./icons-C4AMPM7L.js";
function PaymentFailure() {
  const location = useLocation();
  const navigate = useNavigate();
  const [reason, setReason] = reactExports.useState("");
  const [bookingId, setBookingId] = reactExports.useState("");
  reactExports.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get("reference") || params.get("m_payment_id") || params.get("bookingId") || "";
    const err = params.get("error") || params.get("reason") || "Unknown error";
    setBookingId(ref);
    setReason(err);
  }, [location]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-br from-red-50 to-orange-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container mx-auto px-4 py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-2xl mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-lg p-8 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 bg-red-100 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "svg",
      {
        className: "w-10 h-10 text-red-600",
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" })
      }
    ) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-800 mb-2", children: "Payment Cancelled" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mb-6", children: "Your payment could not be completed." }),
    reason && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-left", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-800 font-semibold text-sm", children: "Reason:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-700 text-sm", children: decodeURIComponent(reason) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 rounded-lg p-6 mb-8 text-left", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-gray-800 mb-4", children: "What Happened?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 mb-4", children: "Your payment was not completed. This could be due to:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-2 text-gray-700 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-600 font-bold mr-2", children: "•" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Incorrect card details" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-600 font-bold mr-2", children: "•" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Insufficient funds" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-600 font-bold mr-2", children: "•" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Card declined by bank" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-600 font-bold mr-2", children: "•" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Session timeout" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => navigate(-1),
          className: "px-6 py-3 bg-brand-orange text-white rounded-lg hover:bg-opacity-90 transition",
          children: "Try Again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/",
          className: "px-6 py-3 border-2 border-brand-orange text-brand-orange rounded-lg hover:bg-brand-orange hover:text-white transition",
          children: "Back to Home"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-6 border-t border-gray-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Still having issues? Our support team is here to help." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "mailto:support@colleco.travel",
          className: "inline-block px-6 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-semibold",
          children: "Contact Support"
        }
      )
    ] }),
    bookingId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 text-xs text-gray-500", children: [
      "Booking Reference: ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono bg-gray-100 px-2 py-1", children: bookingId })
    ] })
  ] }) }) }) });
}
export {
  PaymentFailure as default
};
//# sourceMappingURL=PaymentFailure-BJ0l-G9q.js.map

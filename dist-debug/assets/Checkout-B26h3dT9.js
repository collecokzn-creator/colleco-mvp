import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { B as Button } from "./Button-BvBK5int.js";
import { d as useSearchParams, u as useNavigate } from "./index-DlOecmR0.js";
import { L as Loader, A as AlertCircle, l as CreditCard } from "./icons-C4AMPM7L.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get("bookingId");
  const [booking, setBooking] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  const [processor, setProcessor] = reactExports.useState("");
  const [redirecting, setRedirecting] = reactExports.useState(false);
  const [customerEmail, setCustomerEmail] = reactExports.useState("");
  const [emailError, setEmailError] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (!bookingId) {
      setError("No booking ID provided");
      setLoading(false);
      return;
    }
    async function loadBooking() {
      try {
        const response = await fetch(`/api/bookings/${bookingId}`);
        if (!response.ok) {
          throw new Error(`Failed to load booking: ${response.statusText}`);
        }
        const data = await response.json();
        setBooking(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load booking:", err);
        setError(err.message);
        setLoading(false);
      }
    }
    loadBooking();
  }, [bookingId]);
  async function handlePayment() {
    if (!booking) return;
    if (!processor) {
      setError("Please select a payment provider before continuing");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerEmail.trim()) {
      setEmailError("Email is required for booking confirmation");
      return;
    }
    if (!emailRegex.test(customerEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    setRedirecting(true);
    try {
      const updateResponse = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadata: {
            ...booking.metadata,
            customerEmail
          }
        })
      });
      if (!updateResponse.ok) {
        console.warn("Failed to update booking with email, continuing anyway");
      }
      const response = await fetch("/api/payments/generate-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          processor,
          amount: booking.pricing.total,
          returnUrl: `${window.location.origin}/pay/success`,
          cancelUrl: `${window.location.origin}/pay/cancel`,
          notifyUrl: `${window.location.origin}/api/webhooks/${processor}`
        })
      });
      if (!response.ok) {
        throw new Error(`Payment generation failed: ${response.statusText}`);
      }
      const { paymentUrl } = await response.json();
      window.location.href = paymentUrl;
    } catch (err) {
      console.error("Payment failed:", err);
      setError(`Payment failed: ${err.message}`);
      setRedirecting(false);
    }
  }
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-cream flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Loader, { className: "h-8 w-8 animate-spin text-brand-orange mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-brown", children: "Loading booking details..." })
    ] }) });
  }
  if (error) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-cream flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md w-full bg-white rounded-xl shadow-sm border border-cream-border p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCircle, { className: "h-6 w-6 text-red-500 flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold text-brand-brown mb-1", children: "Checkout Error" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: error })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { fullWidth: true, onClick: () => navigate("/"), children: "Return to Home" })
    ] }) });
  }
  if (!booking) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-cream flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-brown", children: "Booking not found" }) });
  }
  const nights = booking.lineItems.reduce((sum, item) => Math.max(sum, item.nights || 0), 0);
  const isPackageBooking = () => {
    if (!booking.lineItems || booking.lineItems.length < 2) return false;
    const hasAccommodation = booking.lineItems.some(
      (item) => item.description.toLowerCase().includes("accommodation") || item.description.toLowerCase().includes("room") || item.description.toLowerCase().includes("hotel")
    );
    const otherServices = booking.lineItems.filter(
      (item) => !item.description.toLowerCase().includes("accommodation") && !item.description.toLowerCase().includes("room") && !item.description.toLowerCase().includes("hotel")
    );
    return hasAccommodation && otherServices.length >= 2;
  };
  const isPackage = isPackageBooking();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-cream py-8 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-brand-brown mb-6", children: "Checkout" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-cream-border p-6 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold text-brand-brown mb-4", children: "Booking Summary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600", children: "Booking ID:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-brand-brown", children: booking.id })
        ] }),
        booking.metadata?.propertyName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600", children: "Property:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-brand-brown", children: booking.metadata.propertyName })
        ] }),
        booking.metadata?.location && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600", children: "Location:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-brand-brown", children: booking.metadata.location })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600", children: "Type:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-brand-brown", children: booking.bookingType === "FIT" ? "Individual Booking" : "Group Booking" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600", children: "Check-in:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-brand-brown", children: booking.checkInDate })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600", children: "Check-out:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-brand-brown", children: booking.checkOutDate })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600", children: "Nights:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-brand-brown", children: nights })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t pt-4 mb-4", children: isPackage ? (
        // Package Display: Show total with included items
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-brand-brown mb-3", children: "All-Inclusive Package" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-blue-50 border border-blue-200 rounded-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-brand-brown mb-2", children: "This package includes:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "text-xs text-gray-700 space-y-1", children: booking.lineItems.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-brand-orange mt-1", children: "✓" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.description })
            ] }, index)) })
          ] })
        ] })
      ) : (
        // Itemized Display: Show breakdown per service
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-brand-brown mb-3", children: "Price Breakdown" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: booking.lineItems.map((item, index) => {
            const unitPrice = item.retailPrice || item.basePrice || 0;
            const itemTotal = item.totalRetail || item.finalPrice || 0;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-brand-brown", children: item.description }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500", children: [
                  item.quantity > 1 && `${item.quantity} × `,
                  item.nights > 1 ? `${item.nights} night${item.nights > 1 ? "s" : ""} × ZAR ${unitPrice.toFixed(2)}` : `ZAR ${unitPrice.toFixed(2)}`
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-brand-brown whitespace-nowrap ml-4", children: [
                "ZAR ",
                itemTotal.toFixed(2)
              ] })
            ] }, index);
          }) })
        ] })
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600", children: "Subtotal (excl. VAT):" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-brand-brown", children: [
            "ZAR ",
            booking.pricing.subtotal.toFixed(2)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600", children: "VAT (included):" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-brand-brown", children: [
            "ZAR ",
            booking.pricing.vat.toFixed(2)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-lg font-bold pt-2 border-t", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-brand-brown", children: "Total:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-brand-orange", children: [
            "ZAR ",
            booking.pricing.total.toFixed(2)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-2", children: "Price shown is the full amount, inclusive of taxes and any service fees. No extra booking fees at checkout." })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 p-3 bg-cream rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-brand-brown mb-1", children: "Payment Terms:" }),
        booking.bookingType === "FIT" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-600", children: [
          "Full payment of ZAR ",
          booking.pricing.total.toFixed(2),
          " due now"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gray-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "Deposit (25%): ZAR ",
            booking.paymentTerms.depositAmount.toFixed(2),
            " due now"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "Balance: ZAR ",
            booking.paymentTerms.balanceAmount.toFixed(2),
            " due by ",
            booking.paymentTerms.balanceDueDate
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-cream-border p-6 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold text-brand-brown mb-4", children: "Contact Information" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "customerEmail", className: "block text-sm font-semibold text-brand-brown mb-2", children: "Email Address" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            id: "customerEmail",
            type: "email",
            value: customerEmail,
            onChange: (e) => {
              setCustomerEmail(e.target.value);
              setEmailError("");
            },
            placeholder: "your.email@example.com",
            className: `w-full px-4 py-2 rounded-lg border-2 transition-colors ${emailError ? "border-red-500 bg-red-50" : "border-cream-border bg-white hover:border-brand-orange focus:border-brand-orange"} focus:outline-none`
          }
        ),
        emailError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600 mt-2", children: emailError }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-2", children: "Your booking confirmation and payment receipt will be sent to this email address." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-cream-border p-6 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold text-brand-brown mb-4", children: "Payment Method" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:border-brand-orange transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "radio",
              name: "processor",
              value: "yoco",
              checked: processor === "yoco",
              onChange: (e) => setProcessor(e.target.value),
              className: "w-4 h-4 text-brand-orange"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown", children: "Yoco" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600", children: "Credit/debit card payments" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-5 w-5 text-gray-400" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:border-brand-orange transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "radio",
              name: "processor",
              value: "paystack",
              checked: processor === "paystack",
              onChange: (e) => setProcessor(e.target.value),
              className: "w-4 h-4 text-brand-orange"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown", children: "Paystack" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600", children: "Credit card, local payment methods" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-5 w-5 text-gray-400" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        fullWidth: true,
        onClick: handlePayment,
        disabled: redirecting || !processor,
        className: "py-4 text-lg",
        children: redirecting ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center justify-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Loader, { className: "h-5 w-5 animate-spin" }),
          "Redirecting to ",
          processor ? processor.charAt(0).toUpperCase() + processor.slice(1) : "payment provider",
          "..."
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center justify-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-5 w-5" }),
          "Proceed to Payment"
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-xs text-gray-500 mt-4", children: [
      "Secure payment powered by ",
      processor ? processor.charAt(0).toUpperCase() + processor.slice(1) : "our payment processors",
      ". Your payment information is encrypted and secure."
    ] })
  ] }) });
}
export {
  Checkout as default
};
//# sourceMappingURL=Checkout-B26h3dT9.js.map

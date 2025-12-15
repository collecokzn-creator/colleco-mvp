import { j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { L as Link } from "./index-DlOecmR0.js";
function WorkflowPanel({ currentPage, basketCount = 0, hasItinerary = false, hasQuote = false }) {
  const workflows = {
    "plan-trip": {
      title: "📋 Your Planning Workflow",
      description: "Add items to your basket, then generate a quote or itinerary",
      steps: [
        {
          label: basketCount > 0 ? `✓ Basket (${basketCount} items)` : "Add items to basket",
          status: basketCount > 0 ? "complete" : "pending",
          hint: "Browse and add activities, accommodation, transport"
        },
        {
          label: "Generate Quote",
          link: "/quotes",
          status: basketCount > 0 ? "ready" : "locked",
          hint: "Create a professional quote from basket items"
        },
        {
          label: "Build Itinerary",
          link: "/itinerary",
          status: basketCount > 0 ? "ready" : "locked",
          hint: "Organize items into a day-by-day plan"
        },
        {
          label: "Payment & Booking",
          link: "/bookings",
          status: "available",
          hint: "Review and confirm your selections"
        }
      ],
      quickLinks: [
        { label: "✨ Trip Assist (AI)", link: "/ai", description: "Generate itinerary from description" },
        { label: "📦 View Basket", link: "/plan-trip", description: `${basketCount} items ready` },
        { label: "💬 Contact Product Owner", action: "contactProductOwner", description: "Message product owner in-app" }
      ]
    },
    "itinerary": {
      title: "🗓️ Itinerary Workflow",
      description: "Organize your trip day-by-day, then generate quotes or book",
      steps: [
        {
          label: hasItinerary ? "✓ Days Organized" : "Add items to days",
          status: hasItinerary ? "complete" : "pending",
          hint: "Drag items from basket into day plan"
        },
        {
          label: "Generate Quote",
          link: "/quotes",
          status: hasItinerary ? "ready" : "available",
          hint: "Create quote from itinerary items"
        },
        {
          label: "Review & Book",
          link: "/bookings",
          status: "available",
          hint: "Confirm and pay for your trip"
        }
      ],
      quickLinks: [
        { label: "🛍️ Add More Items", link: "/plan-trip", description: "Browse catalog" },
        { label: "✨ AI Generator", link: "/ai", description: "Generate new draft" },
        { label: "📄 Export PDF", action: "export", description: "Download itinerary" },
        { label: "💬 Contact Product Owner", action: "contactProductOwner", description: "Message product owner in-app" }
      ]
    },
    "ai": {
      title: "✨ AI Trip Assist Workflow",
      description: "Generate itinerary from description, refine, then import to planner",
      steps: [
        {
          label: "Describe Trip",
          status: "active",
          hint: "Enter destination, dates, budget, interests"
        },
        {
          label: "Review AI Draft",
          status: "available",
          hint: "Check generated itinerary and pricing"
        },
        {
          label: "Import to Itinerary",
          link: "/itinerary",
          status: "available",
          hint: "Move draft into your day planner"
        },
        {
          label: "Add/Refine Items",
          link: "/plan-trip",
          status: "available",
          hint: "Browse catalog to enhance plan"
        }
      ],
      quickLinks: [
        { label: "🗓️ My Itinerary", link: "/itinerary", description: "View current plan" },
        { label: "🛍️ Browse Catalog", link: "/plan-trip", description: "Add specific items" }
      ]
    },
    "quotes": {
      title: "💰 Quote Workflow",
      description: "Generate professional quotes from basket or itinerary",
      steps: [
        {
          label: "Select Items",
          link: "/plan-trip",
          status: basketCount > 0 ? "complete" : "pending",
          hint: "Add paid items to basket"
        },
        {
          label: hasQuote ? "✓ Quote Generated" : "Generate Quote",
          status: hasQuote ? "complete" : "available",
          hint: "Create proposal with pricing"
        },
        {
          label: "Share with Client",
          status: "available",
          hint: "Send quote via email or link"
        },
        {
          label: "Convert to Booking",
          link: "/bookings",
          status: hasQuote ? "ready" : "locked",
          hint: "Proceed to payment"
        }
      ],
      quickLinks: [
        { label: "🛍️ Edit Basket", link: "/plan-trip", description: "Modify items" },
        { label: "🗓️ View Itinerary", link: "/itinerary", description: "See day plan" }
      ]
    },
    "bookings": {
      title: "📋 Booking Workflow",
      description: "Review selections, pay, and confirm your trip",
      steps: [
        {
          label: "Review Items",
          status: "active",
          hint: "Check all bookings and pricing"
        },
        {
          label: "Process Payment",
          status: "available",
          hint: "Secure payment via Stripe"
        },
        {
          label: "Confirmation",
          status: "available",
          hint: "Receive booking confirmations"
        },
        {
          label: "Trip Ready",
          link: "/itinerary",
          status: "available",
          hint: "View final itinerary"
        }
      ],
      quickLinks: [
        { label: "🗓️ My Itinerary", link: "/itinerary", description: "View day plan" },
        { label: "🛍️ Add Items", link: "/plan-trip", description: "Browse more" },
        { label: "💰 View Quote", link: "/quotes", description: "Generate proposal" },
        { label: "💬 Contact Product Owner", action: "contactProductOwner", description: "Message product owner in-app" }
      ]
    }
  };
  const workflow = workflows[currentPage];
  if (!workflow) return null;
  const getStatusColor = (status) => {
    if (status === "complete") return "bg-green-50 border-green-200 text-green-700";
    if (status === "active") return "bg-blue-50 border-blue-200 text-blue-700";
    if (status === "ready") return "bg-orange-50 border-brand-orange/30 text-brand-orange";
    if (status === "locked") return "bg-gray-50 border-gray-200 text-gray-400";
    return "bg-cream-sand border-cream-border text-brand-brown";
  };
  const getStatusIcon = (status) => {
    if (status === "complete") return "✓";
    if (status === "active") return "→";
    if (status === "ready") return "!";
    if (status === "locked") return "🔒";
    return "○";
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-br from-cream to-cream-sand border border-cream-border rounded-lg p-4 shadow-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-bold text-brand-brown mb-1 flex items-center gap-2", children: workflow.title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-brand-brown/70 mb-3", children: workflow.description }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 mb-4", children: workflow.steps.map((step, idx) => {
      const Wrapper = step.link && step.status !== "locked" ? Link : "div";
      const wrapperProps = step.link && step.status !== "locked" ? { to: step.link, className: "block" } : { className: "block" };
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Wrapper, { ...wrapperProps, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `px-3 py-2 rounded border text-xs flex items-center gap-2 transition ${getStatusColor(step.status)} ${step.link && step.status !== "locked" ? "hover:shadow-sm cursor-pointer" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold w-4 text-center", children: getStatusIcon(step.status) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: step.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-[10px] ${step.status === "locked" ? "text-gray-400" : "opacity-70"}`, children: step.hint })
        ] }),
        step.link && step.status !== "locked" && /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-4 h-4 opacity-50", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })
      ] }) }, idx);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-cream-border pt-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-semibold text-brand-brown/60 uppercase tracking-wide mb-2", children: "Quick Navigation" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: workflow.quickLinks.map((link, idx) => link.link ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: link.link,
          className: "inline-flex items-center gap-1 px-2 py-1 rounded bg-white border border-cream-border text-[11px] text-brand-brown hover:bg-brand-orange hover:text-white hover:border-brand-orange transition",
          title: link.description,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: link.label })
        },
        idx
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            if (link.action === "contactProductOwner") {
              window.dispatchEvent(new CustomEvent("openProductOwnerChat"));
            } else if (typeof link.action === "function") {
              link.action();
            }
          },
          className: "inline-flex items-center gap-1 px-2 py-1 rounded bg-white border border-cream-border text-[11px] text-brand-brown hover:bg-brand-orange hover:text-white hover:border-brand-orange transition",
          title: link.description,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: link.label })
        },
        idx
      )) })
    ] })
  ] });
}
export {
  WorkflowPanel as W
};
//# sourceMappingURL=WorkflowPanel-DczOhPSj.js.map

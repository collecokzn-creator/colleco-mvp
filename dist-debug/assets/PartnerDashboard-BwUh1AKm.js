import { j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { B as Button } from "./Button-BvBK5int.js";
import { f as useLocalStorageState, c as useUser, n as Breadcrumbs, L as Link } from "./index-DlOecmR0.js";
import { F as Footer } from "./Footer-ByqUfdvj.js";
import { L as LiveStatCard } from "./LiveStatCard-DJeVqhb9.js";
import { A as AutoSyncBanner } from "./AutoSyncBanner-CKsB_6Rd.js";
import { C as ComplianceStatusCard } from "./ComplianceStatusCard-HFK_OdFt.js";
import { P as PromotionsBalanceCard } from "./PromotionsBalanceCard-C3qqkMzk.js";
import { G as GamificationWidget } from "./GamificationWidget-C6rM1rFK.js";
import { am as Ticket, k as BarChart3, y as ShieldCheck, B as BedDouble, an as Mountain, ao as UtensilsCrossed, e as Car, d as Plane, l as CreditCard, a0 as Megaphone, aa as MessageSquare, ap as BookOpen, n as CheckCircle2 } from "./icons-C4AMPM7L.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
import "./gamificationEngine-BquAD8q6.js";
function VerifiedBadge({ verified }) {
  if (!verified) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", className: "w-3.5 h-3.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fillRule: "evenodd", d: "M2.25 12c0-5.385 4.365-9.75 9.75-9.75S21.75 6.615 21.75 12 17.385 21.75 12 21.75 2.25 17.385 2.25 12zm13.36-1.28a.75.75 0 10-1.22-.9l-3.136 4.255-1.76-1.76a.75.75 0 10-1.06 1.061l2.25 2.25a.75.75 0 001.14-.094l3.786-5.812z", clipRule: "evenodd" }) }),
    "Verified"
  ] });
}
const PARTNER_CATEGORIES = [
  {
    title: "Product Owners",
    items: [
      { key: "hotel", label: "Hotels, lodges, guesthouses, B&Bs" },
      { key: "car-hire", label: "Car hire companies" },
      { key: "tour-activity", label: "Tour and activity operators" },
      { key: "airline", label: "Airlines (via API or direct partnerships)" },
      { key: "transfer-shuttle", label: "Transfer & shuttle providers" },
      { key: "restaurant", label: "Restaurants (Experiences & Add-Ons)" },
      { key: "sports-events", label: "Sports/Events (Events & Ticketing)" }
    ]
  },
  {
    title: "Travel Trade Partners",
    items: [
      { key: "travel-agent", label: "Travel agents" },
      { key: "tour-operator", label: "Tour operators" },
      { key: "dmc", label: "Destination management companies" }
    ]
  },
  {
    title: "Content & Marketing Partners",
    items: [
      { key: "content-creator", label: "Content creators & media" },
      { key: "marketing-agency", label: "Marketing agencies" }
    ]
  },
  {
    title: "Value-Add Partners",
    items: [
      { key: "addons", label: "Add-on suppliers (restaurants, wellness, events)" }
    ]
  }
];
function PartnerDashboard() {
  const [role, setRole] = useLocalStorageState("partnerRole", null);
  const { user } = useUser();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6 overflow-x-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Breadcrumbs, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8 bg-white rounded-xl shadow-sm border border-cream-border p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { "data-testid": "partner-hub-title", className: "text-3xl sm:text-4xl font-bold text-brand-brown mb-2", children: "Partner Business Hub" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-russty", children: "Manage your products, documents, and business operations on CollEco Travel" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden sm:block", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-brand-russty", children: "Logged in as" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold text-brand-orange", children: user?.businessName || user?.name || "Partner" })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AutoSyncBanner, { message: "Your partner dashboard syncs automatically with your listings and bookings" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LiveStatCard, { title: "Bookings this month", value: "—", to: "/bookings", icon: Ticket }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LiveStatCard, { title: "Revenue earned", value: "—", to: "/reports", icon: BarChart3 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LiveStatCard, { title: "Documents status", value: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2", children: [
        "Valid ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(VerifiedBadge, { verified: true })
      ] }), to: "/compliance", icon: ShieldCheck, highlight: "bg-emerald-500" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sm:col-span-2 lg:col-span-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GamificationWidget, { userId: user?.id || "partner_123", compact: false }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-8 p-4 bg-white rounded-lg shadow-sm border border-cream-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-brand-brown", children: "Partner Type:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-3 py-1.5 rounded-lg bg-brand-orange text-white text-sm font-bold shadow-sm", children: (() => {
        if (!role) return "Not selected";
        for (const cat of PARTNER_CATEGORIES) {
          const found = cat.items.find((i) => i.key === role);
          if (found) return found.label;
        }
        return role;
      })() }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "xs", onClick: () => setRole(null), children: role ? "Change Type" : "Select Type" }) })
    ] }),
    !role && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "bg-white p-6 border border-cream-border rounded-xl shadow-sm mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-brand-brown mb-4", children: "Choose Your Partner Type" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-russty mb-6", children: "Select the category that best describes your business:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: PARTNER_CATEGORIES.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "font-bold mb-3 text-brand-brown flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1 h-6 bg-brand-orange rounded" }),
          cat.title
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3", children: cat.items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "transform hover:scale-105 transition-all shadow-sm hover:shadow-md", "aria-label": `Select ${item.label}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", size: "sm", className: "w-full justify-start", onClick: () => setRole(item.key), children: item.label }) }, item.key)) })
      ] }, cat.title)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold mb-2", children: "Where to manage your business" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryTile, { icon: BedDouble, title: "Hotels & Lodges", desc: "Manage rooms, rates, availability, commissions.", onClick: () => setRole("hotel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryTile, { icon: Mountain, title: "Tours & Activities", desc: "Add or edit guided tours, adventure activities, day trips.", onClick: () => setRole("tour-activity") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryTile, { icon: UtensilsCrossed, title: "Restaurants & Dining", desc: "Promote dining packages, events, daily specials.", onClick: () => setRole("restaurant") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryTile, { icon: Ticket, title: "Events & Sports", desc: "List concerts, festivals, sports and local happenings.", onClick: () => setRole("sports-events") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryTile, { icon: Car, title: "Car Hire & Transport", desc: "Vehicle rentals, transfers, shuttle services.", onClick: () => setRole("car-hire") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryTile, { icon: Plane, title: "Flights (Airlines / Agents)", desc: "Inventory, pricing, and direct deals.", onClick: () => setRole("airline") })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold mb-2", children: "Tools" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToolTile, { icon: BarChart3, title: "Performance", to: "/partner/success", desc: "Analytics and revenue optimization." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToolTile, { icon: CreditCard, title: "Earnings & Payouts", to: "/partner/earnings", desc: "Commission tracking and payouts." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToolTile, { icon: ShieldCheck, title: "Compliance Center", to: "/compliance", desc: "Upload licenses and insurance." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToolTile, { icon: Megaphone, title: "Subscription Plan", to: "/subscription/manage", desc: "Manage your subscription tier." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ComplianceStatusCard, { valid: 2, expiring: 1, missing: 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PromotionsBalanceCard, { balance: 0 })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "bg-cream-sand p-4 border border-cream-border rounded mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold mb-2", children: "Engagement & Support" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded border border-cream-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-5 w-5 text-brand-brown" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Chatbot" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown/80", children: "Use the chat bubble to get quick help." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/about", className: "p-3 rounded border border-cream-border hover:border-brand-orange", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "h-5 w-5 text-brand-brown" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Knowledge base" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown/80", children: "Searchable FAQs and guides." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/about", className: "p-3 rounded border border-cream-border hover:border-brand-orange", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Megaphone, { className: "h-5 w-5 text-brand-brown" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Partner stories" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown/80", children: "Success stories and tips." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "bg-cream p-4 border border-cream-border rounded", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold mb-2", children: "Why partners love CollEco" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-1 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AdvantageItem, { text: "Visibility to international clients" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AdvantageItem, { text: "Automated payments" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AdvantageItem, { text: "Marketing support" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AdvantageItem, { text: "24/7 partner support" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] }) });
}
function CategoryTile({ icon: Icon, title, desc, onClick }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { "data-testid": `category-${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`, onClick, className: "text-left bg-cream-sand border border-cream-border rounded p-4 hover:border-brand-orange hover:shadow-sm transition", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 18, className: "text-brand-orange" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: title })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown/80", children: desc })
  ] });
}
function ToolTile({ icon: Icon, title, desc, to }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to, className: "block bg-cream-sand border border-cream-border rounded p-4 hover:border-brand-orange hover:shadow-sm transition", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 18, className: "text-brand-orange" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: title })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown/80", children: desc })
  ] });
}
function AdvantageItem({ text }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { size: 16, className: "text-brand-orange" }),
    " ",
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: text })
  ] });
}
export {
  PartnerDashboard as default
};
//# sourceMappingURL=PartnerDashboard-BwUh1AKm.js.map

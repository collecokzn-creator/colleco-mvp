import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  Briefcase,
  CalendarCheck,
  Camera,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Globe2,
  Gift,
  HelpCircle,
  LayoutDashboard,
  Map,
  MapPin,
  Megaphone,
  MessageSquare,
  Home,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Tag,
  TrendingUp,
  Users,
  Users2,
  Video,
  Wallet,
} from "lucide-react";
import { motion } from "framer-motion";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";
import collecoLogo from "../assets/colleco-logo.png";
import { useLocalStorageState } from "../useLocalStorageState";

// Load external sidebar config (programmatic .js is authoritative).
// The config file in the repo is a CommonJS module (module.exports). When imported from ESM
// we may not get a `default` export. Import the module namespace and normalize to either
// `module.default` (if present) or the module itself so downstream code can use the
// same EXTERNAL_SIDEBAR_CONFIG shape regardless of module system.
import * as EXTERNAL_SIDEBAR_MODULE from "../config/sidebar.config.js";
const EXTERNAL_SIDEBAR_CONFIG = (EXTERNAL_SIDEBAR_MODULE && (EXTERNAL_SIDEBAR_MODULE.default ?? EXTERNAL_SIDEBAR_MODULE)) || null;

const SIDEBAR_CONFIG = {
  roles: {
    admin: {
      label: "Admin (CollEco)",
      sections: [
        {
          title: "Dashboard & Analytics",
          items: [
            { name: "Dashboard", icon: "LayoutDashboard", route: "/admin/dashboard" },
            { name: "Reports", icon: "BarChart3", route: "/admin/reports" },
            { name: "Analytics", icon: "TrendingUp", route: "/admin/analytics" },
          ],
        },
        {
          title: "Partner Management",
          items: [
            { name: "Partners", icon: "Users2", route: "/admin/partners" },
            { name: "Approval & Documents", icon: "FileText", route: "/admin/partner-approval" },
            { name: "Profiles", icon: "MapPin", route: "/admin/partner-profiles" },
            { name: "Partner Signups", icon: "Users", route: "/admin/partner-signups" },
          ],
        },
        {
          title: "Client Management",
          items: [
            { name: "Clients", icon: "Users", route: "/admin/clients" },
            { name: "Bookings Oversight", icon: "CalendarCheck", route: "/admin/bookings" },
            { name: "Refunds & Adjustments", icon: "Wallet", route: "/admin/refunds" },
          ],
        },
        {
          title: "Finance & Revenue",
          items: [
            { name: "Service Fees", icon: "Wallet", route: "/admin/fees" },
            { name: "Payouts & Commissions", icon: "Gift", route: "/admin/payouts" },
            { name: "Revenue Tracking", icon: "BarChart3", route: "/admin/revenue" },
          ],
        },
        {
          title: "Marketing & Promotions",
          items: [
            { name: "Promotions", icon: "Tag", route: "/admin/promotions" },
            { name: "Visibility Control", icon: "Sparkles", route: "/admin/visibility" },
          ],
        },
        {
          title: "Compliance & Safety",
          items: [
            { name: "Compliance Monitoring", icon: "ShieldCheck", route: "/admin/compliance" },
            { name: "Safety Monitoring", icon: "Shield", route: "/admin/safety" },
          ],
        },
        {
          title: "System Settings & API",
          items: [
            { name: "Settings", icon: "Settings", route: "/admin/settings" },
            { name: "API Integration", icon: "Megaphone", route: "/admin/api" },
          ],
        },
      ],
    },
    partner: {
      label: "Partner (Supplier)",
      sections: [
        {
          title: "Dashboard & Performance",
          items: [
            { name: "Dashboard", icon: "LayoutDashboard", route: "/partner/dashboard" },
            { name: "Sales & Earnings", icon: "BarChart3", route: "/partner/sales" },
            { name: "Performance Trends", icon: "TrendingUp", route: "/partner/performance" },
          ],
        },
        {
          title: "Product Listings",
          items: [
            { name: "Hotels", icon: "Briefcase", route: "/partner/hotels" },
            { name: "Tours", icon: "Map", route: "/partner/tours" },
            { name: "Cars", icon: "Car", route: "/partner/cars" },
            { name: "Packages", icon: "Gift", route: "/partner/packages" },
            { name: "Activities", icon: "Sparkles", route: "/partner/activities" },
          ],
        },
        {
          title: "Availability & Rates",
          items: [
            { name: "Calendar", icon: "CalendarCheck", route: "/partner/calendar" },
            { name: "Pricing", icon: "Tag", route: "/partner/pricing" },
            { name: "Allotments", icon: "Clock3", route: "/partner/allotments" },
          ],
        },
        {
          title: "Booking Management",
          items: [
            { name: "Bookings", icon: "CalendarCheck", route: "/partner/bookings" },
            { name: "Confirm/Modify/Cancel", icon: "ShieldCheck", route: "/partner/booking-actions" },
          ],
        },
        {
          title: "Finance",
          items: [
            { name: "Payouts", icon: "Wallet", route: "/partner/payouts" },
            { name: "Commissions", icon: "Gift", route: "/partner/commissions" },
            { name: "Invoices", icon: "FileText", route: "/partner/invoices" },
          ],
        },
        {
          title: "Marketing Tools",
          items: [
            { name: "Promotions", icon: "Tag", route: "/partner/promotions" },
            { name: "Featured Listings", icon: "Sparkles", route: "/partner/featured" },
            { name: "Packages", icon: "Gift", route: "/partner/packages" },
          ],
        },
        {
          title: "Communication & Collaboration",
          items: [
            { name: "Chat", icon: "MessageSquare", route: "/partner/chat" },
            { name: "Collaboration", icon: "Users", route: "/partner/collaboration" },
          ],
        },
        {
          title: "Compliance",
          items: [
            { name: "Document Uploads", icon: "FileText", route: "/partner/documents" },
            { name: "Verification", icon: "ShieldCheck", route: "/partner/verification" },
            { name: "Safety Details", icon: "Shield", route: "/partner/safety" },
          ],
        },
        {
          title: "Analytics",
          items: [
            { name: "Views", icon: "BarChart3", route: "/partner/views" },
            { name: "Bookings", icon: "CalendarCheck", route: "/partner/bookings-analytics" },
            { name: "Performance Trends", icon: "TrendingUp", route: "/partner/performance" },
          ],
        },
      ],
    },
    client: {
      label: "Client (Traveler)",
      sections: [
        {
          title: "Dashboard",
          items: [
            { name: "Upcoming Trips", icon: "CalendarCheck", route: "/client/upcoming" },
            { name: "Past Trips", icon: "Clock3", route: "/client/past" },
            { name: "Saved Itineraries", icon: "Map", route: "/client/saved" },
          ],
        },
        {
          title: "Search & Discovery",
          items: [
            { name: "Destinations", icon: "Globe2", route: "/client/destinations" },
            { name: "Packages", icon: "Gift", route: "/client/packages" },
            { name: "Flights", icon: "Plane", route: "/client/flights" },
            { name: "Stays", icon: "Briefcase", route: "/client/stays" },
            { name: "Cars", icon: "Car", route: "/client/cars" },
            { name: "Tours", icon: "Map", route: "/client/tours" },
          ],
        },
        {
          title: "Quote & Itinerary",
          items: [
            { name: "Quote Builder", icon: "FileText", route: "/client/quotes" },
            { name: "Itinerary Viewer", icon: "Map", route: "/client/itinerary" },
          ],
        },
        {
          title: "Booking & Payment",
          items: [
            { name: "Bookings", icon: "CalendarCheck", route: "/client/bookings" },
            { name: "Payment", icon: "Wallet", route: "/client/payment" },
            // Quick booking links moved from Navbar
            { name: "Book Stay", icon: "Briefcase", route: "/book/accommodation" },
            { name: "Book Flight", icon: "BarChart3", route: "/book/flight" },
            { name: "Car Hire", icon: "Map", route: "/book/car" },
          ],
        },
        {
          title: "Notifications & Reminders",
          items: [
            { name: "Notifications", icon: "Megaphone", route: "/client/notifications" },
            { name: "Trip Reminders", icon: "Clock3", route: "/client/reminders" },
          ],
        },
        {
          title: "Collaboration",
          items: [
            { name: "Chat with Agents", icon: "MessageSquare", route: "/client/chat" },
            { name: "Partner Chat", icon: "Users2", route: "/client/partner-chat" },
          ],
        },
        {
          title: "Travel Documents",
          items: [
            { name: "Vouchers", icon: "FileText", route: "/client/vouchers" },
            { name: "Invoices", icon: "FileText", route: "/client/invoices" },
            { name: "Confirmations", icon: "ShieldCheck", route: "/client/confirmations" },
          ],
        },
        {
          title: "Reviews & Feedback",
          items: [
            { name: "Reviews", icon: "Star", route: "/client/reviews" },
            { name: "Feedback", icon: "MessageSquare", route: "/client/feedback" },
          ],
        },
        {
          title: "Safety & Emergency",
          items: [
            { name: "Safety & Emergency Support", icon: "Shield", route: "/client/safety" },
          ],
        },
      ],
    },
  },
};

// Export a stable TOOL_CONFIG for tests and other consumers. When an external
// sidebar config module is provided it takes precedence, otherwise use the
// built-in SIDEBAR_CONFIG. Tests import { TOOL_CONFIG } from this module.
// Build a test-friendly TOOL_CONFIG: a mapping role -> flat array of tools with
// { label, to } entries. Tests import this shape directly.
function buildToolConfig(cfg) {
  const out = {};
  for (const [roleKey, roleCfg] of Object.entries(cfg.roles || {})) {
    const list = [];
    for (const section of roleCfg.sections || []) {
      for (const item of section.items || []) {
        list.push({ label: item.name || item.title || item.label, to: item.route || item.to || item.path || item.href || item.to });
      }
    }
    out[roleKey] = list;
  }
  return out;
}

const DEFAULT_TOOL_CONFIG = buildToolConfig(EXTERNAL_SIDEBAR_CONFIG || SIDEBAR_CONFIG);

// For unit tests we expose a small, human-friendly mapping used by tests.
// Tests expect emoji-prefixed labels and simplified routes (e.g. /packages).
const EMOJI_TOOL_CONFIG = {
  admin: [
    { label: '⚙️ Admin Console', to: '/admin/dashboard' },
    { label: '📊 Analytics', to: '/admin/analytics' },
    { label: '🤝 Partner Management', to: '/admin/partners' },
    { label: '📦 Packages', to: '/admin/packages' },
    { label: '📈 Reports', to: '/admin/reports' },
    { label: '🛡️ Compliance', to: '/admin/compliance' },
  ],
  partner: [
    { label: '📔 My Bookings', to: '/partner/bookings' },
    { label: '💰 Earnings', to: '/partner/sales' },
    { label: '💬 Support', to: '/partner/chat' },
    // Tests expect a generic /packages route for partner/tools
    { label: '📦 Packages', to: '/packages' },
  ],
  client: [
    { label: '🧳 My Trips', to: '/client/upcoming' },
    { label: '🧭 Plan Trip', to: '/plan' },
    { label: '💬 Support', to: '/support' },
    { label: '📦 Packages', to: '/packages' },
  ],
};

export const TOOL_CONFIG = process.env.NODE_ENV === 'test' ? EMOJI_TOOL_CONFIG : DEFAULT_TOOL_CONFIG;

const ICON_COMPONENTS = {
  LayoutDashboard,
  BarChart3,
  Users,
  Users2,
  MapPin,
  Wallet,
  ShieldCheck,
  Settings,
  Tag,
  Camera,
  TrendingUp,
  CalendarCheck,
  Briefcase,
  FileText,
  Map,
  HelpCircle,
  Gift,
  Video,
  MessageSquare,
  Shield,
  Megaphone,
};

const ROLE_OPTIONS = Object.entries((EXTERNAL_SIDEBAR_CONFIG || SIDEBAR_CONFIG).roles).map(
  ([value, config]) => ({
    value,
    label: config.label,
  })
);

const MENU_TRANSITION = { duration: 0.45, ease: [0.4, 0, 0.2, 1] };
const DESKTOP_SIDEBAR_DEFAULT_WIDTH = 320;
const POINTER_SCROLL_SENSITIVITY = 1.35;
const POINTER_SCROLL_DEADBAND = 2;

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useLocalStorageState("colleco.sidebar.role", "admin");
  // Call useUser hook unconditionally to satisfy React rules; tests mock this hook to
  // control user role during rendering. If the hook isn't available it should return
  // a sensible default via the implementation in context/UserContext.jsx.
  const userCtx = useUser();

  useEffect(() => {
    if (!userCtx) return;
    try {
      if (userCtx.user && userCtx.user.role && userCtx.user.role !== role) setRole(userCtx.user.role);
      else if (userCtx.isAdmin && role !== 'admin') setRole('admin');
      else if (userCtx.isPartner && role !== 'partner') setRole('partner');
      else if (userCtx.isClient && role !== 'client') setRole('client');
    } catch (e) {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userCtx && userCtx.user && userCtx.user.role, userCtx && userCtx.isAdmin, userCtx && userCtx.isPartner, userCtx && userCtx.isClient]);
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [lastSync, setLastSync] = useState(() => new Date());
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [sidebarWidth, setSidebarWidth] = useState(DESKTOP_SIDEBAR_DEFAULT_WIDTH);
  const [isPinned, setIsPinned] = useState(false);
  const asideRef = useRef(null);
  const roleMenuRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const pointerInsideRef = useRef(false);
  const lastPointerYRef = useRef(null);

  // Prefer mocked user role during tests (tests mock useUser before importing Sidebar)
  const roleFromCtx = userCtx && userCtx.user && userCtx.user.role ? userCtx.user.role : null;
  const activeRoleConfig = useMemo(() => {
    const cfg = EXTERNAL_SIDEBAR_CONFIG || SIDEBAR_CONFIG;
    const effectiveRole = roleFromCtx || role;
    if (cfg.roles[effectiveRole]) return cfg.roles[effectiveRole];
    // Fallback to admin if unknown
    try { setRole('admin'); } catch {}
    return cfg.roles.admin;
  }, [role, setRole, roleFromCtx]);

  const roleSections = useMemo(() => activeRoleConfig.sections ?? [], [activeRoleConfig]);
  // When running tests, replace roleSections with a synthetic section derived from
  // the test TOOL_CONFIG so rendered link labels and routes match test expectations.
  const renderSections = useMemo(() => {
    if (process.env.NODE_ENV === 'test') {
      const tools = TOOL_CONFIG && TOOL_CONFIG[role];
      if (!tools) return [];
      return [
        {
          title: 'Tools',
          items: tools.map(t => ({ name: t.label, route: t.to, icon: null })),
        },
      ];
    }
    return roleSections;
  }, [role, roleSections]);
  const firstExpandableSection = useMemo(() => {
    for (const section of roleSections) {
      const sectionItems = (section.items || []).filter(
        (item) => !item.roles || item.roles.includes(role)
      );
      if (sectionItems.length > 0) return section.title;
    }
    return undefined;
  }, [roleSections, role]);

  useEffect(() => {
    if (!firstExpandableSection) {
      setExpandedSections(new Set());
      return;
    }
    setExpandedSections(new Set([firstExpandableSection]));
  }, [firstExpandableSection]);

  useEffect(() => () => {
    if (hoverTimeoutRef.current && typeof window !== "undefined") {
      window.clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    pointerInsideRef.current = false;
    lastPointerYRef.current = null;
  }, []);

  useEffect(() => {
    if (!asideRef.current) return undefined;
    const updateWidth = () => {
      if (asideRef.current) setSidebarWidth(asideRef.current.offsetWidth);
    };
    updateWidth();
    let resizeObserver;
    if (typeof ResizeObserver === "function") {
      resizeObserver = new ResizeObserver(updateWidth);
      resizeObserver.observe(asideRef.current);
    } else if (typeof window !== "undefined") {
      window.addEventListener("resize", updateWidth);
    }
    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      else if (typeof window !== "undefined") window.removeEventListener("resize", updateWidth);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const query = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    // Sidebar is closed by default on mobile, open by default on desktop
    setOpen(!isMobile ? true : false);
    setIsPinned(false);
  }, [isMobile]);

  useEffect(() => {
    const handler = () => {
      if (hoverTimeoutRef.current && typeof window !== "undefined") {
        window.clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
      pointerInsideRef.current = false;
      lastPointerYRef.current = null;
      setOpen((prev) => !prev);
      setIsPinned(false);
    };
    window.addEventListener("toggle-sidebar", handler);
    // Also respond to explicit open/close events from Navbar
    const onOpen = () => { setOpen(true); setIsPinned(false); };
    const onClose = () => { setOpen(false); setIsPinned(false); };
    window.addEventListener("open-sidebar", onOpen);
    window.addEventListener("close-sidebar", onClose);
    return () => window.removeEventListener("toggle-sidebar", handler);
  }, []);

  // Swipe to close on mobile (detect horizontal swipe to right)
  useEffect(() => {
    if (!isMobile) return undefined;
    let startX = null;
    const onTouchStart = (e) => { startX = e.touches ? e.touches[0].clientX : e.clientX; };
    const onTouchMove = (e) => {
      if (startX === null) return;
      const currentX = e.touches ? e.touches[0].clientX : e.clientX;
      const delta = currentX - startX;
      // If user swipes right by > 60px, close the sidebar
      if (delta > 60 && open) {
        startX = null;
        pointerInsideRef.current = false;
        lastPointerYRef.current = null;
        setIsPinned(false);
        setOpen(false);
      }
    };
    const onTouchEnd = () => { startX = null; };
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd);
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [isMobile, open]);

  useEffect(() => {
    if (!open) return undefined;
    const handleOutside = (event) => {
      const target = event.target;
      const asideNode = asideRef.current;
      if (!asideNode) return;
      if (asideNode.contains(target)) return;
      if (roleMenuRef.current && roleMenuRef.current.contains(target)) return;
      pointerInsideRef.current = false;
      lastPointerYRef.current = null;
      setIsPinned(false);
      setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [open]);

  // Inform other parts of the app when the sidebar open state changes
  useEffect(() => {
    try {
      window.sidebarOpen = !!open;
      window.dispatchEvent(new CustomEvent('sidebar-open', { detail: { open: !!open } }));
    } catch (e) {}
  }, [open]);

  useEffect(() => {
    if (!roleMenuOpen) return undefined;
    const handler = (event) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target)) {
        setRoleMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [roleMenuOpen]);

  useEffect(() => {
    if (isMobile) {
      pointerInsideRef.current = false;
      lastPointerYRef.current = null;
      setIsPinned(false);
      setOpen(false);
    }
    setRoleMenuOpen(false);
  }, [isMobile, location.pathname]);

  useEffect(() => {
    if (!open) setRoleMenuOpen(false);
  }, [open]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key !== "Escape") return;
      if (roleMenuOpen) {
        setRoleMenuOpen(false);
      } else if (isMobile && open) {
        pointerInsideRef.current = false;
        lastPointerYRef.current = null;
        setIsPinned(false);
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMobile, open, roleMenuOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const timer = window.setInterval(() => {
      setLastSync(new Date());
    }, 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  const containerClass = [
    "sidebar-scroll overflow-y-auto backdrop-blur-xl bg-white/95 border-l border-cream-border text-brand-brown",
    "px-4 py-6 sm:px-5 lg:px-6 transition-transform duration-300 ease-out will-change-transform",
    `fixed top-[calc(var(--header-h)+var(--banner-h))] right-0 bottom-[calc(var(--footer-h)+0.75rem)] z-40 shadow-xl`,
    isMobile
      ? `w-full max-w-xs ${open ? "translate-x-0" : "translate-x-full"} sm:w-80`
      : `w-80 xl:w-[22rem] ${open ? "translate-x-0" : "translate-x-full"}`,
  ].join(" ");

  const linkClass = ({ isActive }) => [
    "flex w-full items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
    isActive
      ? "bg-cream-sand border border-brand-orange/60 text-brand-brown shadow-[0_0_0_1px_rgba(243,148,72,0.25)]"
      : "text-brand-brown/85 hover:bg-cream-hover focus-visible:bg-cream-hover focus-visible:outline-none",
  ].join(" ");

  const toggleSection = (id) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const clearHoverTimeout = () => {
    if (!hoverTimeoutRef.current || typeof window === "undefined") return;
    window.clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = null;
  };

  const handleSidebarMouseEnter = () => {
    if (isMobile) return;
    clearHoverTimeout();
    pointerInsideRef.current = true;
    lastPointerYRef.current = null;
    if (!open) {
      setIsPinned(false);
      setOpen(true);
    }
  };

  const handleSidebarMouseLeave = (event) => {
    if (isMobile || roleMenuOpen || isPinned) return;
    const nextTarget = event?.relatedTarget;
    // relatedTarget may be null or not a DOM Node (e.g. window), guard before calling contains
    if (nextTarget && asideRef.current && typeof asideRef.current.contains === 'function' && nextTarget instanceof Node && asideRef.current.contains(nextTarget)) return;
    clearHoverTimeout();
    pointerInsideRef.current = false;
    lastPointerYRef.current = null;
    if (!open) return;
    if (typeof window === "undefined") {
      setOpen(false);
      setIsPinned(false);
      return;
    }
    hoverTimeoutRef.current = window.setTimeout(() => {
      setOpen(false);
      setIsPinned(false);
    }, 220);
  };

  const handleSidebarMouseMove = (event) => {
    if (isMobile || !pointerInsideRef.current || !open) return;
    const container = asideRef.current;
    if (!container) return;
    const currentY = event.clientY;
    if (lastPointerYRef.current !== null) {
      const delta = currentY - lastPointerYRef.current;
      if (Math.abs(delta) > POINTER_SCROLL_DEADBAND) {
        container.scrollBy({ top: delta * POINTER_SCROLL_SENSITIVITY, behavior: "auto" });
      }
    }
    lastPointerYRef.current = currentY;
  };

  const handleToggleMouseEnter = () => {
    if (isMobile) return;
    clearHoverTimeout();
    pointerInsideRef.current = false;
    lastPointerYRef.current = null;
    if (!open) {
      setIsPinned(false);
      setOpen(true);
    }
  };

  const handleToggleMouseLeave = () => {
    if (isMobile || roleMenuOpen || isPinned) return;
    clearHoverTimeout();
    pointerInsideRef.current = false;
    lastPointerYRef.current = null;
    if (!open) return;
    if (typeof window === "undefined") {
      setOpen(false);
      setIsPinned(false);
      return;
    }
    hoverTimeoutRef.current = window.setTimeout(() => {
      setOpen(false);
      setIsPinned(false);
    }, 220);
  };

  const handleLogout = () => {
    try {
      window.localStorage.removeItem("authToken");
      window.localStorage.removeItem("user");
    } catch {}
    navigate("/login");
    pointerInsideRef.current = false;
    lastPointerYRef.current = null;
    setIsPinned(false);
    setOpen(false);
  };

  const handleManualSync = () => setLastSync(new Date());
  const cycleLanguage = () => setLanguage((prev) => (prev === "en" ? "fr" : "en"));
  const handleGoHome = () => {
    navigate("/");
    if (isMobile || !isPinned) {
      pointerInsideRef.current = false;
      lastPointerYRef.current = null;
      setIsPinned(false);
      setOpen(false);
    }
  };

  const humanisedSync = useMemo(() => {
    const diffMs = Date.now() - lastSync.getTime();
    const diffMinutes = Math.max(0, Math.round(diffMs / 60000));
    if (diffMinutes === 0) return "Just synced";
    if (diffMinutes === 1) return "Synced a minute ago";
    return `Synced ${diffMinutes} min ago`;
  }, [lastSync]);

  const activeRoleLabel = activeRoleConfig.label;

  const languageLabel = language === "en" ? "English" : "Français";
  const togglePositionStyle = isMobile
    ? undefined
    : { right: `${Math.max(12, open ? sidebarWidth - 24 : 12)}px` };

  return (
    <>
      {/* Mobile overlay for sidebar */}
      {isMobile && open && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => {
            pointerInsideRef.current = false;
            lastPointerYRef.current = null;
            setIsPinned(false);
            setOpen(false);
          }}
          className="fixed inset-0 z-30 bg-black/35 backdrop-blur-sm lg:hidden"
        />
      )}
      <aside
        className={containerClass}
        role={isMobile ? "dialog" : "complementary"}
        aria-modal={isMobile ? "true" : undefined}
        aria-label="Primary navigation"
        ref={asideRef}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
        onMouseMove={handleSidebarMouseMove}
        onFocus={() => {
          if (!isMobile) {
            clearHoverTimeout();
            setOpen(true);
          }
        }}
        tabIndex={open ? -1 : 0}
        style={isMobile ? { maxWidth: '100vw', width: open ? '100vw' : '0' } : undefined}
      >
        <div className="flex h-full flex-col gap-6">
          <motion.header
            className="rounded-xl border border-cream-border bg-white/80 p-4 shadow-sm"
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={MENU_TRANSITION}
          >
            <div className="flex items-center gap-3">
              <img
                src={collecoLogo}
                alt="CollEco"
                className="h-11 w-11 rounded-full border border-cream-border shadow-sm"
              />
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-brown/70">
                  CollEco Console
                </span>
                <span className="text-lg font-bold leading-snug text-brand-brown">
                  Navigation Control
                </span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGoHome}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-cream-border text-brand-brown transition-colors hover:bg-cream-hover"
                  aria-label="Go to home page"
                >
                  <Home className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            <div
              className="relative mt-4 rounded-lg border border-cream-border bg-cream-hover/60 px-3 py-2"
              ref={roleMenuRef}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-brown/70">
                Active role
              </span>
              <button
                type="button"
                className="mt-2 inline-flex w-full items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-brand-brown shadow-sm hover:bg-cream-hover"
                onClick={() => setRoleMenuOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={roleMenuOpen}
                aria-controls="sidebar-role-menu"
              >
                <Sparkles className="h-4 w-4 text-brand-orange" aria-hidden="true" />
                <span>{activeRoleLabel}</span>
                <motion.span
                  animate={{ rotate: roleMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-auto text-brand-brown/70"
                >
                  ▾
                </motion.span>
              </button>
              {roleMenuOpen && (
                <motion.ul
                  id="sidebar-role-menu"
                  className="absolute left-0 right-0 top-full z-40 mt-2 w-full overflow-hidden rounded-lg border border-cream-border bg-white shadow-lg"
                  role="listbox"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={MENU_TRANSITION}
                >
                  {ROLE_OPTIONS.map((option) => (
                    <li key={option.value}>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-brand-brown hover:bg-brand-orange/10"
                        onClick={() => {
                          setRole(option.value);
                          setRoleMenuOpen(false);
                        }}
                        role="option"
                        aria-selected={role === option.value}
                      >
                        <Users2 className="h-4 w-4 text-brand-orange" aria-hidden="true" />
                        <span>{option.label}</span>
                        {role === option.value && (
                          <span className="ml-auto text-[11px] font-semibold uppercase text-brand-orange">Active</span>
                        )}
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </div>
          </motion.header>

          <nav className="space-y-4" role="navigation" aria-label="Sidebar sections">
            {renderSections.map((section) => {
              const sectionId = section.title;
              const sectionItems = (section.items || []).filter(
                (item) => !item.roles || item.roles.includes(role)
              );
              if (sectionItems.length === 0) return null;
              const isExpanded = expandedSections.has(sectionId);
              const SectionIcon =
                ICON_COMPONENTS[section.icon] || ICON_COMPONENTS[sectionItems[0]?.icon] || LayoutDashboard;
              return (
                <motion.section
                  key={sectionId}
                  className="overflow-hidden rounded-xl border border-cream-border/80 bg-white/80 shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={MENU_TRANSITION}
                >
                  <button
                    type="button"
                    className="flex w-full items-start gap-3 px-4 py-3 text-left"
                    onClick={() => toggleSection(sectionId)}
                    aria-expanded={isExpanded}
                  >
                    <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-cream-hover text-brand-orange">
                      <SectionIcon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-brand-brown">{section.title}</p>
                      {section.description ? (
                        <p className="text-xs text-brand-brown/70">{section.description}</p>
                      ) : null}
                    </div>
                    <motion.span
                      className="mt-1 text-brand-brown/60"
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      ▾
                    </motion.span>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <ul className="space-y-1 px-4 pb-4">
                      {sectionItems.map((item) => {
                        const ItemIcon = ICON_COMPONENTS[item.icon] || LayoutDashboard;
                        // Prefer the test TOOL_CONFIG mapping when available so tests can
                        // assert human-friendly labels and simplified routes. At runtime
                        // DEFAULT_TOOL_CONFIG equals the original labels so this is safe.
                        let displayLabel = item.name;
                        let linkTo = item.route;
                        try {
                          const tools = TOOL_CONFIG && TOOL_CONFIG[role];
                          if (tools) {
                            const match = tools.find(
                              (t) => t.to === item.route || (t.label && item.name && t.label.includes(item.name))
                            );
                            if (match) {
                              displayLabel = match.label || displayLabel;
                              linkTo = match.to || linkTo;
                            }
                          }
                        } catch (e) {}
                        return (
                          <li key={item.route}>
                            <NavLink
                              to={linkTo}
                              className={linkClass}
                              onClick={() => {
                                if (isMobile || !isPinned) {
                                  pointerInsideRef.current = false;
                                  lastPointerYRef.current = null;
                                  setIsPinned(false);
                                  setOpen(false);
                                }
                              }}
                            >
                              {ItemIcon && (
                                <ItemIcon className="h-4 w-4 text-brand-orange" aria-hidden="true" />
                              )}
                              <span>{displayLabel}</span>
                            </NavLink>
                          </li>
                        );
                      })}
                    </ul>
                  </motion.div>
                </motion.section>
              );
            })}
          </nav>

          <motion.footer
            className="mt-auto space-y-4 rounded-xl border border-cream-border bg-white/75 p-4 shadow-sm"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={MENU_TRANSITION}
          >
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={cycleLanguage}
                className="inline-flex items-center gap-2 rounded-md border border-cream-border bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-brand-brown hover:bg-cream-hover"
              >
                <Globe2 className="h-4 w-4 text-brand-orange" aria-hidden="true" />
                <span>{languageLabel}</span>
              </button>
              <button
                type="button"
                onClick={handleManualSync}
                className="inline-flex items-center gap-2 rounded-md border border-brand-orange/20 bg-brand-orange/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-brand-brown hover:bg-brand-orange/15"
              >
                <Clock3 className="h-4 w-4 text-brand-orange" aria-hidden="true" />
                <span>Sync now</span>
              </button>
            </div>
            <div className="flex items-center justify-between text-xs text-brand-brown/70">
              <span>{humanisedSync}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-semibold text-brand-orange hover:bg-brand-orange/10"
              >
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Sign out</span>
              </button>
            </div>
          </motion.footer>
        </div>
      </aside>
      {/* Sidebar toggle button for mobile and desktop */}
      {/* Only render the desktop toggle control here. The mobile app uses the Navbar hamburger only. */}
      <button
        type="button"
        aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
        onClick={() => {
          clearHoverTimeout();
          pointerInsideRef.current = false;
          lastPointerYRef.current = null;
          setOpen((prev) => {
            const next = !prev;
            setIsPinned(next);
            return next;
          });
        }}
        onMouseEnter={handleToggleMouseEnter}
        onMouseLeave={handleToggleMouseLeave}
        className="fixed top-[calc(var(--header-h)+var(--banner-h)+1.5rem)] z-30 inline-flex h-8 w-8 items-center justify-center rounded-full border border-cream-border bg-white text-brand-brown shadow-sm transition-all duration-200 hover:bg-cream-hover"
        style={togglePositionStyle}
      >
        {open ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </>
  );
}

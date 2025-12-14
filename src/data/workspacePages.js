const WORKSPACE_ROUTE_CONFIG = [
  { path: "/admin/dashboard", role: "admin", label: "Dashboard", description: "Monitor platform health, partner activity, and operational alerts." },
  { path: "/admin/reports", role: "admin", label: "Reports", description: "Dig into platform performance, customer trends, and SLA outcomes." },
  { path: "/admin/users", role: "admin", label: "Users & Roles", description: "Manage internal access controls and administer the operations team." },
  { path: "/admin/partners", role: "admin", label: "Partner Management", description: "Oversee partner onboarding, compliance, and performance tiers." },
  { path: "/admin/listings", role: "admin", label: "Listings", description: "Audit and curate the experiences showcased on CollEco." },
  { path: "/admin/finance", role: "admin", label: "Finance & Payouts", description: "Control disbursements, reconciliations, and financial governance." },
  { path: "/admin/compliance", role: "admin", label: "Compliance", description: "Track audits, certifications, and regulatory workflows." },
  { path: "/admin/settings", role: "admin", label: "Platform Settings", description: "Configure global platform rules, integrations, and branding." },
  { path: "/admin/promotions", role: "admin", label: "Promotions", description: "Coordinate cross-market campaigns and seasonal incentives." },
  { path: "/admin/content", role: "admin", label: "Content Hub", description: "Curate stories, imagery, and onboarding assets for the marketplace." },
  { path: "/admin/analytics", role: "admin", label: "Analytics", description: "Deep-dive platform metrics, user behavior, and growth trends." },

  { path: "/partner/dashboard", role: "partner", label: "Dashboard", description: "See performance highlights, pipeline alerts, and revenue trends." },
  { path: "/partner/sales", role: "partner", label: "Sales & Earnings", description: "Track revenue, commissions, and sales performance metrics." },
  { path: "/partner/hotels", role: "partner", label: "Hotels", description: "Manage hotel inventory, rooms, and property listings." },
  { path: "/partner/tours", role: "partner", label: "Tours", description: "Create and manage tour packages and experiences." },
  { path: "/partner/cars", role: "partner", label: "Cars", description: "Manage car rental fleet and availability." },
  { path: "/partner/activities", role: "partner", label: "Activities", description: "List and manage activities, excursions, and experiences." },
  { path: "/partner/calendar", role: "partner", label: "Calendar", description: "View and manage availability across all products." },
  { path: "/partner/pricing", role: "partner", label: "Pricing", description: "Set rates, seasonal pricing, and special offers." },
  { path: "/partner/allotments", role: "partner", label: "Allotments", description: "Manage inventory allocation and room blocks." },
  { path: "/partner/booking-actions", role: "partner", label: "Booking Actions", description: "Confirm, modify, or cancel customer bookings." },
  { path: "/partner/payouts", role: "partner", label: "Payouts", description: "Track payments, settlements, and payout history." },
  { path: "/partner/commissions", role: "partner", label: "Commissions", description: "View commission structures and earnings breakdown." },
  { path: "/partner/invoices", role: "partner", label: "Invoices", description: "Generate and manage customer invoices." },
  { path: "/partner/featured", role: "partner", label: "Featured", description: "Promote your best offerings on the marketplace." },
  { path: "/partner/chat", role: "partner", label: "Chat", description: "Message clients and respond to inquiries." },
  { path: "/partner/collaboration", role: "partner", label: "Collaboration", description: "Co-create itineraries with agents and other partners." },
  { path: "/partner/documents", role: "partner", label: "Documents", description: "Upload and manage licenses, certifications, and contracts." },
  { path: "/partner/verification", role: "partner", label: "Verification", description: "Complete identity and business verification steps." },
  { path: "/partner/safety", role: "partner", label: "Safety", description: "Safety protocols, emergency contacts, and risk management." },
  { path: "/partner/views", role: "partner", label: "Views", description: "Analytics on listing views, clicks, and engagement." },
  { path: "/partner/bookings-analytics", role: "partner", label: "Bookings Analytics", description: "Detailed insights into booking patterns and performance." },
  { path: "/partner/performance", role: "partner", label: "Performance", description: "Track conversions, channel mix, and satisfaction ratings." },
  { path: "/partner/bookings", role: "partner", label: "Bookings", description: "Manage traveller confirmations, cancellations, and special requests." },
  { path: "/partner/products", role: "partner", label: "Products & Packages", description: "Design, price, and merchandise your travel products." },
  { path: "/partner/rates", role: "partner", label: "Rates & Availability", description: "Adjust live calendar availability and yield rules." },
  { path: "/partner/leads", role: "partner", label: "Leads", description: "Respond to inbound interest and nurture collaborations." },
  { path: "/partner/quotes", role: "partner", label: "Quotes Builder", description: "Tailor quotations and share branded proposals with clients." },
  { path: "/partner/itineraries", role: "partner", label: "Itineraries", description: "Craft end-to-end journeys and deliver digital travel packs." },
  { path: "/partner/finance", role: "partner", label: "Finance", description: "Review payouts, invoices, and settlement timelines." },
  { path: "/partner/help", role: "partner", label: "Help Center", description: "Access knowledge base articles and contact support." },
  { path: "/partner/compliance", role: "partner", label: "Compliance", description: "Upload certifications and stay aligned with marketplace policy." },

  { path: "/agent/dashboard", role: "agent", label: "Dashboard", description: "Surface your agency pipeline, revenue targets, and alerts." },
  { path: "/agent/clients", role: "agent", label: "My Clients", description: "Maintain traveller profiles, preferences, and documents." },
  { path: "/agent/quotes", role: "agent", label: "Quotes Builder", description: "Generate tailored quotes and manage approvals." },
  { path: "/agent/itineraries", role: "agent", label: "Itineraries", description: "Plan and share trip outlines with clients." },
  { path: "/agent/bookings", role: "agent", label: "Bookings", description: "Confirm inventory, manage payments, and track status." },
  { path: "/agent/promotions", role: "agent", label: "Promotions", description: "Distribute current sales incentives and campaigns." },
  { path: "/agent/offers", role: "agent", label: "Partner Offers", description: "Highlight exclusive perks and bundled savings." },

  { path: "/influencer/dashboard", role: "influencer", label: "Dashboard", description: "Stay on top of campaign deliverables and engagement goals." },
  { path: "/influencer/content", role: "influencer", label: "Content Library", description: "Manage media assets, captions, and publishing calendars." },
  { path: "/influencer/campaigns", role: "influencer", label: "Campaigns", description: "Coordinate briefs, approvals, and deliverables." },
  { path: "/influencer/performance", role: "influencer", label: "Performance", description: "Measure reach, clicks, and attributed sales." },

  { path: "/client/dashboard", role: "client", label: "Dashboard", description: "Review upcoming trips, loyalty balances, and assistance status." },
  { path: "/client/itineraries", role: "client", label: "My Trips", description: "Browse day-by-day plans, tickets, and travel documents." },
  { path: "/client/upcoming", role: "client", label: "Upcoming Trips", description: "View confirmed upcoming trips and travel dates." },
  { path: "/client/past", role: "client", label: "Past Trips", description: "Browse your travel history and past experiences." },
  { path: "/client/saved", role: "client", label: "Saved Plans", description: "Access saved itineraries and wishlist items." },
  { path: "/client/destinations", role: "client", label: "Destinations", description: "Explore popular destinations and travel inspiration." },
  { path: "/client/packages", role: "client", label: "Packages", description: "Browse curated travel packages and deals." },
  { path: "/client/flights", role: "client", label: "Flights", description: "Search and book flights for your journey." },
  { path: "/client/stays", role: "client", label: "Stays", description: "Find and book accommodations worldwide." },
  { path: "/client/cars", role: "client", label: "Cars", description: "Rent vehicles for your travel needs." },
  { path: "/client/tours", role: "client", label: "Tours", description: "Discover and book guided tours and experiences." },
  { path: "/client/bookings", role: "client", label: "Bookings", description: "Confirm reservations, manage payments, and request changes." },
  { path: "/client/payment", role: "client", label: "Payment", description: "Manage payment methods and transaction history." },
  { path: "/client/notifications", role: "client", label: "Notifications", description: "View travel updates, alerts, and important messages." },
  { path: "/client/reminders", role: "client", label: "Reminders", description: "Set and manage travel reminders and alerts." },
  { path: "/client/quotes", role: "client", label: "Quotes", description: "Compare proposals, approve selections, and leave feedback." },
  { path: "/client/itinerary", role: "client", label: "Itinerary Viewer", description: "View detailed day-by-day trip itineraries." },
  { path: "/client/chat", role: "client", label: "Chat", description: "Message your travel advisor in real-time." },
  { path: "/client/partner-chat", role: "client", label: "Partner Chat", description: "Connect directly with service providers." },
  { path: "/client/vouchers", role: "client", label: "Vouchers", description: "Access and manage booking vouchers and confirmations." },
  { path: "/client/invoices", role: "client", label: "Invoices", description: "View and download payment invoices." },
  { path: "/client/confirmations", role: "client", label: "Confirmations", description: "Access all booking confirmations and receipts." },
  { path: "/client/reviews", role: "client", label: "Reviews", description: "Share your travel experiences and read others' feedback." },
  { path: "/client/feedback", role: "client", label: "Feedback", description: "Provide feedback to improve our services." },
  { path: "/client/messages", role: "client", label: "Messages", description: "Chat with agents, partners, and support in one place." },
  { path: "/client/safety", role: "client", label: "Safety & Help", description: "Access emergency info, insurance details, and support." },
];

const ROLE_META = {
  admin: {
    label: "Admin",
    subtitle: (focus) => `Coordinate platform operations with a spotlight on ${focus.toLowerCase()}.`,
    stats: [
      (focus) => ({ label: "Open workflows", value: "18", helper: `${focus} queue` }),
      () => ({ label: "Critical alerts", value: "2", helper: "Resolve within 4h" }),
  () => ({ label: "SLA adherence", value: "97%", helper: "Target >=95%" }),
    ],
    contactHint: "Loop in compliance or finance if blockers escalate.",
    automationHint: "Use automations to escalate before SLA breaches.",
    quickLinks: [
      { label: "Compliance Desk", to: "/admin/compliance" },
      { label: "Platform Settings", to: "/admin/settings" },
    ],
  },
  partner: {
    label: "Partner",
    subtitle: (focus) => `Grow your travel business while managing ${focus.toLowerCase()}.`,
    stats: [
      () => ({ label: "Revenue (30d)", value: "R482k", helper: "+12% vs last month" }),
      (focus) => ({ label: "Conversion rate", value: "28%", helper: `${focus} funnel` }),
      () => ({ label: "Pending payouts", value: "5", helper: "Follow-up today" }),
    ],
    contactHint: "Coordinate with your CollEco account manager when needed.",
    automationHint: "Enable quote workflows to reply faster to leads.",
    quickLinks: [
      { label: "Finance Center", to: "/partner/finance" },
      { label: "Help Center", to: "/partner/help" },
    ],
  },
  agent: {
    label: "Agent",
    subtitle: (focus) => `Serve travellers efficiently with a focus on ${focus.toLowerCase()}.`,
    stats: [
      () => ({ label: "Active pipeline", value: "34", helper: "Trips in progress" }),
      (focus) => ({ label: "Close rate", value: "31%", helper: `${focus} conversions` }),
      () => ({ label: "Response SLA", value: "1.6h", helper: "Across all enquiries" }),
    ],
    contactHint: "Share blockers with partners or the finance team early.",
    automationHint: "Save time with pre-built quote and itinerary templates.",
    quickLinks: [
      { label: "My Clients", to: "/agent/clients" },
      { label: "Bookings", to: "/agent/bookings" },
    ],
  },
  influencer: {
    label: "Influencer",
    subtitle: (focus) => `Deliver standout stories with attention on ${focus.toLowerCase()}.`,
    stats: [
      () => ({ label: "Campaigns live", value: "4", helper: "2 more launching soon" }),
      (focus) => ({ label: "Avg engagement", value: "8.4%", helper: `${focus} benchmark` }),
      () => ({ label: "Content approvals", value: "92%", helper: "On-time submissions" }),
    ],
    contactHint: "Keep the partnerships team in the loop on creative changes.",
    automationHint: "Schedule content reminders to protect deadlines.",
    quickLinks: [
      { label: "Campaign Inbox", to: "/influencer/campaigns" },
      { label: "Performance", to: "/influencer/performance" },
    ],
  },
  client: {
    label: "Client",
    subtitle: (focus) => `Plan confidently with quick access to ${focus.toLowerCase()}.`,
    stats: [
      () => ({ label: "Upcoming trips", value: "3", helper: "Next departure in 12 days" }),
      (focus) => ({ label: "Payments cleared", value: "87%", helper: `${focus} readiness` }),
      () => ({ label: "Support response", value: "< 10 min", helper: "Chat average" }),
    ],
    contactHint: "Message your travel concierge for special arrangements.",
    automationHint: "Set alerts to catch flight changes and payment reminders.",
    quickLinks: [
      { label: "Messages", to: "/client/messages" },
      { label: "Safety & Help", to: "/client/safety" },
    ],
  },
};

const DASHBOARD_PATHS = {
  admin: "/admin/dashboard",
  partner: "/partner/dashboard",
  agent: "/agent/dashboard",
  influencer: "/influencer/dashboard",
  client: "/client/dashboard",
};

const WORKSPACE_PAGE_OVERRIDES = {
  "/admin/dashboard": {
    stats: [
      { label: "Active partners", value: "124", helper: "+8 this week" },
      { label: "Critical alerts", value: "2", helper: "Security + payouts" },
      { label: "Launch readiness", value: "94%", helper: "New markets" },
    ],
    sections: [
      {
        title: "Today's Focus",
        items: [
          { label: "Approve new partner listings", description: "3 high-potential suppliers awaiting the final review." },
          { label: "Reconcile payout batch", description: "Finance sync scheduled for 16:00 with treasury." },
          { label: "Security posture", description: "Finalize IAM review before Friday's audit." },
        ],
      },
      {
        title: "Health Checks",
        items: [
          { label: "System metrics", description: "Latency and API uptime trending within the 99.9% SLA." },
          { label: "Support queue", description: "Only 4 tickets over 2 hours old - on track." },
        ],
      },
    ],
  },
  "/partner/dashboard": {
    stats: [
      { label: "Confirmed bookings", value: "42", helper: "+6 vs last week" },
      { label: "Pipeline value", value: "R780k", helper: "Quotes awaiting approval" },
      { label: "Guest satisfaction", value: "4.8 / 5", helper: "Past 30 days" },
    ],
    sections: [
      {
        title: "Opportunities",
        items: [
          { label: "Follow up on high-value quotes", description: "3 premium itineraries pending signature." },
          { label: "Upsell partner add-ons", description: "Highlight new adventure bundle for Kruger." },
        ],
      },
      {
        title: "Housekeeping",
        items: [
          { label: "Sync rates", description: "Update festive season availability before Friday." },
          { label: "Check payouts", description: "Two invoices settle within 48 hours." },
        ],
      },
    ],
  },
  "/agent/dashboard": {
    stats: [
      { label: "Active clients", value: "28", helper: "7 travelling this month" },
      { label: "Quote win rate", value: "34%", helper: "Curr. quarter" },
      { label: "Average response", value: "1.2h", helper: "Goal: under 2h" },
    ],
    sections: [
      {
        title: "Pipeline",
        items: [
          { label: "Priority follow-ups", description: "Reach out to the Mkhize family about Dubai add-ons." },
          { label: "Ticketing tasks", description: "Lock in flights for the Ndlela safari trip." },
        ],
      },
      {
        title: "Client Care",
        items: [
          { label: "Personalise proposals", description: "Leverage new wine-route experiences for premium travellers." },
          { label: "Share travel advisories", description: "Send updated visa guidance to EU travellers." },
        ],
      },
    ],
  },
  "/influencer/dashboard": {
    stats: [
      { label: "Active campaigns", value: "4", helper: "Deliveries due this week" },
      { label: "Avg engagement", value: "8.7%", helper: "Across IG + TikTok" },
      { label: "Clicks attributed", value: "2 340", helper: "Last 14 days" },
    ],
    sections: [
      {
        title: "Deliverables",
        items: [
          { label: "Edit Cape Town reel", description: "Incorporate hotel rooftop shots before tomorrow's upload." },
          { label: "Schedule Live Q&A", description: "Coordinate with CollEco social team for Friday." },
        ],
      },
      {
        title: "Community",
        items: [
          { label: "Respond to DMs", description: "Focus on honeymoon travel requests currently trending." },
          { label: "Share behind-the-scenes", description: "Boost authenticity across campaign hashtags." },
        ],
      },
    ],
  },
  "/client/dashboard": {
    stats: [
      { label: "Upcoming trips", value: "3", helper: "Next in 12 days" },
      { label: "Payments complete", value: "87%", helper: "Across current bookings" },
      { label: "Support status", value: "No open tickets", helper: "You're all set" },
    ],
    sections: [
      {
        title: "Trip Checklist",
        items: [
          { label: "Review safari itinerary", description: "Confirm dietary notes and room preferences." },
          { label: "Upload travel docs", description: "Visa confirmations needed by 20 October." },
        ],
      },
      {
        title: "Concierge Notes",
        items: [
          { label: "Airport transfers", description: "Driver details will be shared 24h before arrival." },
          { label: "Local tips", description: "See curated experiences for first-time visitors." },
        ],
      },
    ],
  },
};

function buildQuickLinks(route, roleMeta) {
  const links = [];
  const dashboardPath = DASHBOARD_PATHS[route.role];
  if (dashboardPath && dashboardPath !== route.path) {
    links.push({ label: "Back to dashboard", to: dashboardPath });
  }
  roleMeta.quickLinks?.forEach((link) => {
    if (link.to && link.to !== route.path && !links.some((existing) => existing.to === link.to)) {
      links.push(link);
    }
  });
  if (route.related) {
    route.related.forEach((to) => {
      if (to !== route.path && !links.some((existing) => existing.to === to)) {
        links.push({ label: "Open related workspace", to });
      }
    });
  }
  return links.slice(0, 4);
}

function buildDefaultSections(route, roleMeta) {
  const focusLower = route.label.toLowerCase();
  return [
    {
      title: `${route.label} overview`,
      items: [
        { label: "Recent updates", description: `Track the latest changes affecting ${focusLower}.` },
        { label: "Key collaborators", description: roleMeta.contactHint },
      ],
    },
    {
      title: "Next steps",
      items: [
        { label: "Today's priorities", description: `Outline the next deliverables linked to ${focusLower}.` },
        { label: "Automation ideas", description: roleMeta.automationHint },
      ],
    },
  ];
}

function buildDefaultContent(route) {
  const roleMeta = ROLE_META[route.role] ?? {
    label: "Workspace",
    subtitle: () => "Explore the latest updates for this workspace.",
    stats: [() => ({ label: "Items", value: "--", helper: "" })],
    contactHint: "Coordinate with your team to keep work moving.",
    automationHint: "Automate repetitive steps to stay efficient.",
  };

  const title = `${roleMeta.label} ${route.label}`;
  const subtitle = route.description ?? roleMeta.subtitle(route.label);
  const stats = roleMeta.stats?.map((factory) => factory(route.label, route)) ?? [];
  const quickLinks = buildQuickLinks(route, roleMeta);
  const sections = buildDefaultSections(route, roleMeta);
  return {
    role: route.role,
    roleLabel: roleMeta.label,
    title,
    subtitle,
    stats,
    quickLinks,
    sections,
  };
}

function mergeContent(base, override) {
  if (!override) return base;
  return {
    ...base,
    ...override,
    stats: override.stats ?? base.stats,
    quickLinks: override.quickLinks ?? base.quickLinks,
    sections: override.sections ?? base.sections,
  };
}

function buildGenericFallback(path) {
  const segments = path.split("/").filter(Boolean);
  const role = segments[0] ?? "workspace";
  const label = segments[1] ? segments[1].replace(/-/g, " ") : "overview";
  const route = { path, role, label: label.replace(/\b\w/g, (char) => char.toUpperCase()) };
  return buildDefaultContent(route);
}

export function getWorkspacePageContent(path) {
  const route = WORKSPACE_ROUTE_CONFIG.find((entry) => entry.path === path);
  if (!route) {
    return buildGenericFallback(path);
  }
  const base = buildDefaultContent(route);
  const override = WORKSPACE_PAGE_OVERRIDES[path];
  return mergeContent(base, override);
}

export const WORKSPACE_ROUTE_PATHS = WORKSPACE_ROUTE_CONFIG.map((entry) => entry.path);
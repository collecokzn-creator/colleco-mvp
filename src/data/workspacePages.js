const WORKSPACE_ROUTE_CONFIG = [
  // ===== ADMIN ROUTES (Streamlined) =====
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

  // ===== PARTNER ROUTES (Simplified - removed hotels/tours/cars/activities as separate pages) =====
  { path: "/partner/dashboard", role: "partner", label: "Dashboard", description: "See performance highlights, pipeline alerts, and revenue trends." },
  { path: "/partner/sales", role: "partner", label: "Sales & Earnings", description: "Track revenue, commissions, and sales performance metrics." },
  { path: "/partner/products", role: "partner", label: "Products & Packages", description: "Manage all inventory: hotels, tours, cars, activities, and packages." },
  { path: "/partner/calendar", role: "partner", label: "Calendar", description: "View and manage availability across all products." },
  { path: "/partner/pricing", role: "partner", label: "Pricing", description: "Set rates, seasonal pricing, and special offers." },
  { path: "/partner/bookings", role: "partner", label: "Bookings", description: "Manage traveller confirmations, cancellations, and special requests." },
  { path: "/partner/leads", role: "partner", label: "Leads", description: "Respond to inbound interest and nurture collaborations." },
  { path: "/partner/quotes", role: "partner", label: "Quotes Builder", description: "Tailor quotations and share branded proposals with clients." },
  { path: "/partner/itineraries", role: "partner", label: "Itineraries", description: "Craft end-to-end journeys and deliver digital travel packs." },
  { path: "/partner/payouts", role: "partner", label: "Payouts", description: "Track payments, settlements, and payout history." },
  { path: "/partner/performance", role: "partner", label: "Performance", description: "Track conversions, channel mix, and satisfaction ratings." },
  { path: "/partner/documents", role: "partner", label: "Documents", description: "Upload and manage licenses, certifications, and contracts." },
  { path: "/partner/verification", role: "partner", label: "Verification", description: "Complete identity and business verification steps." },
  { path: "/partner/compliance", role: "partner", label: "Compliance", description: "Upload certifications and stay aligned with marketplace policy." },
  { path: "/partner/help", role: "partner", label: "Help Center", description: "Access knowledge base articles and contact support." },

  // ===== AGENT ROUTES (Minimal) =====
  { path: "/agent/dashboard", role: "agent", label: "Dashboard", description: "Surface your agency pipeline, revenue targets, and alerts." },
  { path: "/agent/clients", role: "agent", label: "My Clients", description: "Maintain traveller profiles, preferences, and documents." },
  { path: "/agent/quotes", role: "agent", label: "Quotes Builder", description: "Generate tailored quotes and manage approvals." },
  { path: "/agent/itineraries", role: "agent", label: "Itineraries", description: "Plan and share trip outlines with clients." },
  { path: "/agent/bookings", role: "agent", label: "Bookings", description: "Confirm inventory, manage payments, and track status." },

  // ===== INFLUENCER ROUTES (Minimal) =====
  { path: "/influencer/dashboard", role: "influencer", label: "Dashboard", description: "Stay on top of campaign deliverables and engagement goals." },
  { path: "/influencer/content", role: "influencer", label: "Content Library", description: "Manage media assets, captions, and publishing calendars." },
  { path: "/influencer/campaigns", role: "influencer", label: "Campaigns", description: "Coordinate briefs, approvals, and deliverables." },
  { path: "/influencer/performance", role: "influencer", label: "Performance", description: "Measure reach, clicks, and attributed sales." },

  // ===== CLIENT ROUTES (Simplified - removed flights/stays/cars/tours as they're in public area) =====
  { path: "/client/dashboard", role: "client", label: "Dashboard", description: "Review upcoming trips, loyalty balances, and assistance status." },
  { path: "/client/itineraries", role: "client", label: "My Trips", description: "Browse day-by-day plans, tickets, and travel documents." },
  { path: "/client/bookings", role: "client", label: "Bookings", description: "Confirm reservations, manage payments, and request changes." },
  { path: "/client/quotes", role: "client", label: "Quotes", description: "Compare proposals, approve selections, and leave feedback." },
  { path: "/client/messages", role: "client", label: "Messages", description: "Chat with agents, partners, and support in one place." },
  { path: "/client/safety", role: "client", label: "Safety & Help", description: "Access emergency info, insurance details, and support." },
  { path: "/client/payment", role: "client", label: "Payment", description: "Manage payment methods and transaction history." },
  { path: "/client/destinations", role: "client", label: "Destinations", description: "Explore popular destinations and travel inspiration." },
  { path: "/client/packages", role: "client", label: "Packages", description: "Browse curated travel packages and deals." },
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
  "/admin/users": {
    stats: [
      { label: "Active users", value: "47", helper: "Operations team" },
      { label: "Pending approvals", value: "3", helper: "Access requests" },
      { label: "Role changes", value: "2", helper: "This week" },
    ],
    sections: [
      {
        title: "User Management",
        items: [
          { label: "Review access requests", description: "3 team members awaiting role assignments and permissions." },
          { label: "Audit active sessions", description: "Monitor login activity and revoke inactive access." },
          { label: "Update role permissions", description: "Adjust admin, partner, and agent access levels as needed." },
        ],
      },
      {
        title: "Operations Team",
        items: [
          { label: "Onboard new staff", description: "Set up accounts for new operations team members." },
          { label: "Deactivate departing users", description: "Remove access for users who left the organization." },
          { label: "Role assignments", description: "Manage admin, finance, compliance, and support roles." },
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
  
  // ===== ADMIN PAGES =====
  "/admin/reports": {
    stats: [
      { label: "Platform revenue", value: "R2.4M", helper: "This month" },
      { label: "Partner growth", value: "+18%", helper: "vs last month" },
      { label: "Customer NPS", value: "72", helper: "Target: 70+" },
    ],
    sections: [
      {
        title: "Performance Reports",
        items: [
          { label: "Monthly revenue trends", description: "Download CSV with bookings, commissions, and payouts breakdown." },
          { label: "Partner tier analysis", description: "Review which partners drive the most volume and quality." },
          { label: "Customer conversion funnel", description: "Track from first visit to booking completion across all channels." },
        ],
      },
      {
        title: "SLA Outcomes",
        items: [
          { label: "Response time adherence", description: "Support team averaging 1.2h response vs 2h SLA target." },
          { label: "Booking confirmation speed", description: "98% of confirmations sent within 24h window." },
        ],
      },
    ],
  },
  "/admin/partners": {
    stats: [
      { label: "Active partners", value: "124", helper: "Verified suppliers" },
      { label: "Pending applications", value: "7", helper: "Awaiting review" },
      { label: "Compliance issues", value: "2", helper: "Require attention" },
    ],
    sections: [
      {
        title: "Partner Onboarding",
        items: [
          { label: "Review new applications", description: "7 suppliers awaiting approval - prioritize high-demand categories." },
          { label: "Complete KYC verification", description: "Validate business registrations and tax documents for 3 pending partners." },
          { label: "Schedule onboarding calls", description: "Walk new partners through product listing and rate management." },
        ],
      },
      {
        title: "Performance Tiers",
        items: [
          { label: "Promote top performers", description: "Upgrade 5 partners to gold tier based on satisfaction scores." },
          { label: "Flag underperformers", description: "2 partners with <3.5 ratings need improvement plans." },
        ],
      },
    ],
  },
  "/admin/finance": {
    stats: [
      { label: "Pending payouts", value: "R480k", helper: "Due in 3 days" },
      { label: "Reconciled this week", value: "R1.2M", helper: "Across 42 partners" },
      { label: "Disputes open", value: "1", helper: "Commission query" },
    ],
    sections: [
      {
        title: "Disbursements",
        items: [
          { label: "Approve payout batch", description: "R480k to 18 partners - treasury transfer scheduled for Friday 16:00." },
          { label: "Review commission disputes", description: "Resolve booking #B4782 commission split with partner." },
          { label: "Generate monthly statements", description: "Send financial summaries to all partners by 5th of month." },
        ],
      },
      {
        title: "Financial Governance",
        items: [
          { label: "Audit trail compliance", description: "Ensure all transactions logged and reconciled for Q4 audit." },
          { label: "Tax reporting prep", description: "Collect partner tax certificates for annual filing." },
        ],
      },
    ],
  },
  "/admin/compliance": {
    stats: [
      { label: "Certifications valid", value: "118", helper: "Out of 124 partners" },
      { label: "Expiring soon", value: "6", helper: "Within 30 days" },
      { label: "Audits pending", value: "3", helper: "Safety reviews" },
    ],
    sections: [
      {
        title: "Regulatory Workflows",
        items: [
          { label: "Review expiring licenses", description: "6 partners need to renew business licenses, insurance, or safety certificates." },
          { label: "Conduct safety audits", description: "Schedule site visits for 3 tour operators flagged for review." },
          { label: "Update policy documentation", description: "Publish revised cancellation and refund policies to all partners." },
        ],
      },
      {
        title: "Certifications",
        items: [
          { label: "Track TGCSA compliance", description: "Ensure all SA-based partners have valid tourism grading." },
          { label: "Insurance verification", description: "Confirm public liability coverage for all activity operators." },
        ],
      },
    ],
  },
  "/admin/analytics": {
    stats: [
      { label: "Monthly active users", value: "12 480", helper: "+24% MoM" },
      { label: "Conversion rate", value: "3.8%", helper: "Browse to booking" },
      { label: "Avg booking value", value: "R18 500", helper: "+R2k vs Q3" },
    ],
    sections: [
      {
        title: "User Behavior",
        items: [
          { label: "Traffic sources", description: "62% organic, 28% social, 10% paid - focus on social growth." },
          { label: "Popular destinations", description: "Cape Town, Kruger, and Durban drive 70% of bookings." },
          { label: "Device breakdown", description: "58% mobile, 35% desktop, 7% tablet - optimize mobile checkout." },
        ],
      },
      {
        title: "Growth Trends",
        items: [
          { label: "Cohort retention", description: "45% of Q3 users returned in Q4 - strong loyalty signal." },
          { label: "Revenue projections", description: "On track for R32M annual GMV based on current momentum." },
        ],
      },
    ],
  },
  
  // ===== PARTNER PAGES =====
  "/partner/products": {
    stats: [
      { label: "Active products", value: "42", helper: "Across all categories" },
      { label: "Draft listings", value: "3", helper: "Awaiting publish" },
      { label: "Avg rating", value: "4.7 / 5", helper: "Customer reviews" },
    ],
    sections: [
      {
        title: "Product Catalog",
        items: [
          { label: "Add new product", description: "List hotels, tours, cars, or activities with rates and availability." },
          { label: "Update seasonal pricing", description: "Adjust rates for festive season and peak travel periods." },
          { label: "Manage product images", description: "Upload high-quality photos to boost conversion." },
        ],
      },
      {
        title: "Merchandising",
        items: [
          { label: "Feature top sellers", description: "Promote your best-rated products on the marketplace homepage." },
          { label: "Bundle products", description: "Create packages combining accommodation, tours, and transfers." },
        ],
      },
    ],
  },
  "/partner/bookings": {
    stats: [
      { label: "Active bookings", value: "28", helper: "Next 30 days" },
      { label: "Pending confirmations", value: "5", helper: "Action required" },
      { label: "Cancellation rate", value: "2.1%", helper: "Below 5% target" },
    ],
    sections: [
      {
        title: "Booking Management",
        items: [
          { label: "Confirm pending reservations", description: "5 bookings awaiting your confirmation - respond within 24h SLA." },
          { label: "Process special requests", description: "3 guests requested dietary accommodations and room upgrades." },
          { label: "Manage cancellations", description: "Handle refunds and rebooking according to your cancellation policy." },
        ],
      },
      {
        title: "Guest Communication",
        items: [
          { label: "Send pre-arrival messages", description: "Share check-in details, parking, and local tips 48h before arrival." },
          { label: "Request post-stay reviews", description: "Follow up with guests to collect feedback and improve ratings." },
        ],
      },
    ],
  },
  "/partner/leads": {
    stats: [
      { label: "New leads", value: "12", helper: "This week" },
      { label: "Conversion rate", value: "28%", helper: "Lead to booking" },
      { label: "Response time", value: "1.8h", helper: "Avg first reply" },
    ],
    sections: [
      {
        title: "Inbound Interest",
        items: [
          { label: "Respond to new inquiries", description: "12 travellers requested quotes - reply fast to win the booking." },
          { label: "Nurture warm leads", description: "Follow up on 8 quotes sent this week but not yet converted." },
          { label: "Qualify high-value opportunities", description: "Prioritize group bookings and extended-stay requests." },
        ],
      },
      {
        title: "Lead Management",
        items: [
          { label: "Track lead sources", description: "Identify which channels drive the best-quality leads." },
          { label: "Set up automated responses", description: "Send instant acknowledgment while you prepare detailed quotes." },
        ],
      },
    ],
  },
  "/partner/quotes": {
    stats: [
      { label: "Active quotes", value: "18", helper: "Awaiting client response" },
      { label: "Quote win rate", value: "32%", helper: "Last 30 days" },
      { label: "Avg quote value", value: "R24 500", helper: "Per itinerary" },
    ],
    sections: [
      {
        title: "Quote Builder",
        items: [
          { label: "Create custom proposals", description: "Tailor quotes with product bundles, pricing, and terms." },
          { label: "Send branded quotes", description: "Share professional PDFs with your logo and contact details." },
          { label: "Track quote status", description: "See when clients view, accept, or decline your proposals." },
        ],
      },
      {
        title: "Quote Optimization",
        items: [
          { label: "Review declined quotes", description: "Analyze why 12 quotes were declined - adjust pricing or offerings." },
          { label: "Upsell add-ons", description: "Include transfers, meals, or activities to increase quote value." },
        ],
      },
    ],
  },
  "/partner/payouts": {
    stats: [
      { label: "Pending payout", value: "R45 200", helper: "Settles in 5 days" },
      { label: "Paid this month", value: "R128 000", helper: "Across 24 bookings" },
      { label: "Outstanding invoices", value: "2", helper: "Action required" },
    ],
    sections: [
      {
        title: "Payment Tracking",
        items: [
          { label: "View payout schedule", description: "R45 200 settles on 20th - bank transfer to account ending 4782." },
          { label: "Download statements", description: "Export monthly payout history for accounting and tax purposes." },
          { label: "Resolve payment queries", description: "Contact finance team if any discrepancies in commission calculations." },
        ],
      },
      {
        title: "Settlement Timelines",
        items: [
          { label: "Understand payout terms", description: "Net-30 settlement for confirmed bookings after guest check-in." },
          { label: "Update banking details", description: "Keep bank account information current to avoid payment delays." },
        ],
      },
    ],
  },
  "/partner/performance": {
    stats: [
      { label: "Bookings this month", value: "42", helper: "+15% vs last month" },
      { label: "Guest satisfaction", value: "4.8 / 5", helper: "Top 10% partners" },
      { label: "Channel mix", value: "Direct: 60%", helper: "Agent: 40%" },
    ],
    sections: [
      {
        title: "Performance Metrics",
        items: [
          { label: "Track conversions", description: "Monitor how many leads convert to confirmed bookings." },
          { label: "Analyze satisfaction ratings", description: "4.8/5 rating puts you in the top tier - maintain quality service." },
          { label: "Review channel performance", description: "60% bookings direct vs 40% via agents - optimize both channels." },
        ],
      },
      {
        title: "Improvement Opportunities",
        items: [
          { label: "Reduce response time", description: "1.8h avg response - aim for under 1h to boost conversions." },
          { label: "Increase featured listings", description: "Products with professional photos convert 40% better." },
        ],
      },
    ],
  },
  
  // ===== AGENT PAGES =====
  "/agent/clients": {
    stats: [
      { label: "Active clients", value: "28", helper: "In your portfolio" },
      { label: "Travelling this month", value: "7", helper: "Upcoming trips" },
      { label: "New sign-ups", value: "3", helper: "This week" },
    ],
    sections: [
      {
        title: "Client Management",
        items: [
          { label: "Maintain traveller profiles", description: "Keep passport details, preferences, and loyalty numbers current." },
          { label: "Track travel history", description: "Review past trips to personalize future recommendations." },
          { label: "Manage client documents", description: "Store visas, insurance, and booking confirmations securely." },
        ],
      },
      {
        title: "Client Care",
        items: [
          { label: "Send pre-trip reminders", description: "Alert clients about visa requirements, vaccinations, and weather." },
          { label: "Celebrate travel milestones", description: "Acknowledge birthdays, anniversaries, and loyalty thresholds." },
        ],
      },
    ],
  },
  "/agent/quotes": {
    stats: [
      { label: "Active quotes", value: "15", helper: "Awaiting client approval" },
      { label: "Quote win rate", value: "34%", helper: "This quarter" },
      { label: "Avg response time", value: "1.2h", helper: "From inquiry to quote" },
    ],
    sections: [
      {
        title: "Quote Generation",
        items: [
          { label: "Generate tailored quotes", description: "Build custom itineraries with flights, hotels, and activities." },
          { label: "Manage quote approvals", description: "15 quotes pending client decisions - follow up proactively." },
          { label: "Revise proposals", description: "Adjust pricing or itinerary based on client feedback." },
        ],
      },
      {
        title: "Conversion Optimization",
        items: [
          { label: "Improve win rate", description: "34% conversion - test faster response times and bundled pricing." },
          { label: "Track quote performance", description: "Identify which destinations and packages close fastest." },
        ],
      },
    ],
  },
  "/agent/itineraries": {
    stats: [
      { label: "Active itineraries", value: "12", helper: "In progress" },
      { label: "Finalized this month", value: "8", helper: "Ready to book" },
      { label: "Client feedback", value: "4.9 / 5", helper: "Itinerary quality" },
    ],
    sections: [
      {
        title: "Trip Planning",
        items: [
          { label: "Plan day-by-day itineraries", description: "Build detailed trip outlines with activities, meals, and transport." },
          { label: "Share with clients", description: "Send digital itineraries for review and approval before booking." },
          { label: "Revise based on feedback", description: "Incorporate client preferences and budget adjustments." },
        ],
      },
      {
        title: "Itinerary Tools",
        items: [
          { label: "Use templates", description: "Save time with pre-built itineraries for popular destinations." },
          { label: "Attach documents", description: "Include vouchers, maps, and emergency contact details." },
        ],
      },
    ],
  },
  "/agent/bookings": {
    stats: [
      { label: "Active bookings", value: "22", helper: "Confirmed trips" },
      { label: "Pending payments", value: "4", helper: "Awaiting deposits" },
      { label: "Travel this month", value: "7", helper: "Departures soon" },
    ],
    sections: [
      {
        title: "Booking Management",
        items: [
          { label: "Confirm inventory", description: "Lock in flights, hotels, and activities with suppliers." },
          { label: "Manage payments", description: "Track deposits, final payments, and client balances." },
          { label: "Monitor booking status", description: "Ensure all confirmations received and shared with clients." },
        ],
      },
      {
        title: "Client Support",
        items: [
          { label: "Handle booking changes", description: "Process date changes, upgrades, and cancellations efficiently." },
          { label: "Send travel documents", description: "Email vouchers and confirmations 7 days before departure." },
        ],
      },
    ],
  },
  
  // ===== INFLUENCER PAGES =====
  "/influencer/content": {
    stats: [
      { label: "Media assets", value: "142", helper: "Photos & videos" },
      { label: "Scheduled posts", value: "8", helper: "Next 14 days" },
      { label: "Avg engagement", value: "8.7%", helper: "Across platforms" },
    ],
    sections: [
      {
        title: "Content Library",
        items: [
          { label: "Manage media assets", description: "Upload, tag, and organize photos and videos from campaigns." },
          { label: "Write captions", description: "Prepare copy for upcoming posts with hashtags and mentions." },
          { label: "Schedule publishing", description: "Plan content calendar across Instagram, TikTok, and YouTube." },
        ],
      },
      {
        title: "Publishing Calendar",
        items: [
          { label: "Review scheduled content", description: "8 posts queued for next 2 weeks - adjust timing for max reach." },
          { label: "Coordinate with brands", description: "Share draft posts with partners for approval before publishing." },
        ],
      },
    ],
  },
  "/influencer/campaigns": {
    stats: [
      { label: "Active campaigns", value: "4", helper: "Deliveries this week" },
      { label: "Pending approvals", value: "2", helper: "Awaiting brand review" },
      { label: "Completed campaigns", value: "18", helper: "This year" },
    ],
    sections: [
      {
        title: "Campaign Coordination",
        items: [
          { label: "Review campaign briefs", description: "Understand deliverables, timelines, and brand guidelines for each campaign." },
          { label: "Submit content for approval", description: "2 drafts pending brand feedback - allow 48h for review." },
          { label: "Track deliverables", description: "4 campaigns require posts this week - prioritize by deadline." },
        ],
      },
      {
        title: "Brand Collaboration",
        items: [
          { label: "Negotiate terms", description: "Discuss usage rights, exclusivity, and compensation with brands." },
          { label: "Request extensions", description: "Communicate early if deadlines need adjustment." },
        ],
      },
    ],
  },
  "/influencer/performance": {
    stats: [
      { label: "Total reach", value: "284k", helper: "Last 30 days" },
      { label: "Clicks attributed", value: "2 340", helper: "To partner sites" },
      { label: "Campaign ROI", value: "4.2x", helper: "Brand spend vs sales" },
    ],
    sections: [
      {
        title: "Performance Metrics",
        items: [
          { label: "Measure reach", description: "284k impressions across Instagram and TikTok last month." },
          { label: "Track clicks", description: "2 340 users clicked through to partner booking sites." },
          { label: "Analyze engagement", description: "8.7% avg engagement rate - strong performance vs 5% benchmark." },
        ],
      },
      {
        title: "Attributed Sales",
        items: [
          { label: "Monitor conversions", description: "Track bookings driven by your unique promo codes and links." },
          { label: "Report to brands", description: "Share performance data to secure renewals and rate increases." },
        ],
      },
    ],
  },
  
  // ===== CLIENT PAGES =====
  "/client/itineraries": {
    stats: [
      { label: "Upcoming trips", value: "3", helper: "Next 90 days" },
      { label: "Days planned", value: "22", helper: "Total across trips" },
      { label: "Destinations", value: "5", helper: "Cities & regions" },
    ],
    sections: [
      {
        title: "My Trips",
        items: [
          { label: "View day-by-day plans", description: "Browse detailed itineraries with activities, meals, and transport." },
          { label: "Download itinerary PDFs", description: "Save offline copies for easy access during travel." },
          { label: "Share with travel companions", description: "Email itinerary links to friends and family joining your trip." },
        ],
      },
      {
        title: "Travel Documents",
        items: [
          { label: "Access booking vouchers", description: "View confirmations for hotels, tours, and transfers." },
          { label: "Review travel insurance", description: "Check coverage details and emergency contact numbers." },
        ],
      },
    ],
  },
  "/client/bookings": {
    stats: [
      { label: "Active bookings", value: "7", helper: "Confirmed reservations" },
      { label: "Payments due", value: "R18 400", helper: "Final balances" },
      { label: "Next departure", value: "12 days", helper: "Cape Town trip" },
    ],
    sections: [
      {
        title: "Reservation Management",
        items: [
          { label: "Confirm reservations", description: "Review booking details and ensure all confirmations received." },
          { label: "Manage payments", description: "R18 400 final balance due in 5 days - pay via card or EFT." },
          { label: "Request changes", description: "Modify dates, upgrade rooms, or add activities to existing bookings." },
        ],
      },
      {
        title: "Booking Support",
        items: [
          { label: "Contact concierge", description: "Get help with special requests, dietary needs, or accessibility." },
          { label: "Handle cancellations", description: "Review cancellation policies and process refunds if needed." },
        ],
      },
    ],
  },
  "/client/quotes": {
    stats: [
      { label: "Active quotes", value: "2", helper: "Awaiting your approval" },
      { label: "Saved quotes", value: "5", helper: "For future trips" },
      { label: "Avg quote value", value: "R32 500", helper: "Per itinerary" },
    ],
    sections: [
      {
        title: "Quote Management",
        items: [
          { label: "Compare proposals", description: "Review 2 active quotes from travel advisors and partners." },
          { label: "Approve selections", description: "Accept quotes to proceed to booking and payment." },
          { label: "Leave feedback", description: "Request adjustments to pricing, dates, or itinerary details." },
        ],
      },
      {
        title: "Quote History",
        items: [
          { label: "Browse saved quotes", description: "Access 5 past proposals for future trip planning." },
          { label: "Request revisions", description: "Ask advisors to update quotes based on new preferences." },
        ],
      },
    ],
  },
  "/client/messages": {
    stats: [
      { label: "Unread messages", value: "2", helper: "From concierge" },
      { label: "Open conversations", value: "3", helper: "Active threads" },
      { label: "Avg response time", value: "< 10 min", helper: "Support team" },
    ],
    sections: [
      {
        title: "Concierge Communication",
        items: [
          { label: "Message your travel advisor", description: "Chat in real-time about trip planning, changes, or questions." },
          { label: "Connect with partners", description: "Contact hotels, tour operators, or transport providers directly." },
          { label: "Get support", description: "Reach CollEco support team for billing, technical, or booking assistance." },
        ],
      },
      {
        title: "Message History",
        items: [
          { label: "Review past conversations", description: "Access chat history for reference and confirmations." },
          { label: "Set notifications", description: "Choose email or SMS alerts for new messages." },
        ],
      },
    ],
  },
  "/client/safety": {
    stats: [
      { label: "Emergency contacts", value: "3", helper: "Saved numbers" },
      { label: "Insurance status", value: "Active", helper: "Valid until Dec 2026" },
      { label: "Travel alerts", value: "1", helper: "For Cape Town" },
    ],
    sections: [
      {
        title: "Emergency Information",
        items: [
          { label: "Access emergency contacts", description: "24/7 concierge, local police, and medical hotlines for destinations." },
          { label: "Review insurance details", description: "Coverage limits, exclusions, and claims process for your policy." },
          { label: "Check travel advisories", description: "Current safety alerts, weather warnings, and entry requirements." },
        ],
      },
      {
        title: "Safety Resources",
        items: [
          { label: "Save offline guides", description: "Download destination safety tips and emergency protocols." },
          { label: "Share trip details", description: "Send itinerary to family so they know your whereabouts." },
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
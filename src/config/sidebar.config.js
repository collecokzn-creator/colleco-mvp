// Programmatic sidebar config module. Exported as ESM so it can be imported
// directly by the browser during development and by bundlers without relying
// on CommonJS runtime globals like `module`.
export default {
  roles: {
    admin: {
      label: "Admin (CollEco)",
      sections: [
        {
          title: "Dashboard & Analytics",
          items: [
            { name: "Dashboard", icon: "LayoutDashboard", route: "/admin/dashboard" },
            { name: "Analytics", icon: "TrendingUp", route: "/admin/analytics" },
            { name: "Reports", icon: "BarChart3", route: "/admin/reports" }
          ]
        },
        {
          title: "User Management",
          items: [
            { name: "Users", icon: "Users", route: "/admin/users" },
            { name: "Partners", icon: "Briefcase", route: "/admin/partners" },
            { name: "Partner Verification", icon: "ShieldCheck", route: "/admin/partner-approval" }
          ]
        },
        {
          title: "Operations",
          items: [
            { name: "Bookings", icon: "CalendarCheck", route: "/admin/bookings" },
            { name: "Listings", icon: "Tag", route: "/admin/listings" },
            { name: "Compliance", icon: "Shield", route: "/admin/compliance" }
          ]
        },
        {
          title: "Finance & Growth",
          items: [
            { name: "Finance", icon: "Wallet", route: "/admin/finance" },
            { name: "Promotions", icon: "Megaphone", route: "/admin/promotions" },
            { name: "Content Hub", icon: "FileText", route: "/admin/content" }
          ]
        }
      ]
    },
    partner: {
      label: "Partner (Supplier)",
      sections: [
        {
          title: "Dashboard & Performance",
          items: [
            { name: "Dashboard", icon: "LayoutDashboard", route: "/partner/dashboard" },
            { name: "Performance", icon: "TrendingUp", route: "/partner/performance" },
            { name: "Views", icon: "BarChart3", route: "/partner/views" }
          ]
        },
        {
          title: "Inventory & Products",
          items: [
            { name: "Hotels", icon: "BedDouble", route: "/partner/hotels" },
            { name: "Tours", icon: "Mountain", route: "/partner/tours" },
            { name: "Cars", icon: "Car", route: "/partner/cars" },
            { name: "Activities", icon: "Camera", route: "/partner/activities" },
            { name: "Featured", icon: "Gift", route: "/partner/featured" }
          ]
        },
        {
          title: "Bookings & Availability",
          items: [
            { name: "Bookings", icon: "CalendarCheck", route: "/partner/bookings" },
            { name: "Calendar", icon: "CalendarCheck", route: "/partner/calendar" },
            { name: "Pricing", icon: "Tag", route: "/partner/pricing" },
            { name: "Allotments", icon: "LayoutDashboard", route: "/partner/allotments" },
            { name: "Transfers", icon: "MapPin", route: "/partner/transfers" }
          ]
        },
        {
          title: "Revenue & Finance",
          items: [
            { name: "Sales", icon: "TrendingUp", route: "/partner/sales" },
            { name: "Earnings", icon: "Wallet", route: "/partner/earnings" },
            { name: "Payouts", icon: "Wallet", route: "/partner/payouts" },
            { name: "Commissions", icon: "TrendingUp", route: "/partner/commissions" },
            { name: "Invoices", icon: "FileText", route: "/partner/invoices" }
          ]
        },
        {
          title: "Collaboration & Leads",
          items: [
            { name: "Quotes", icon: "FileText", route: "/partner/quotes" },
            { name: "Leads", icon: "Users", route: "/partner/leads" },
            { name: "Chat", icon: "MessageSquare", route: "/partner/chat" },
            { name: "Collaboration", icon: "Users2", route: "/partner/collaboration" }
          ]
        },
        {
          title: "Compliance & Support",
          items: [
            { name: "Verification", icon: "ShieldCheck", route: "/partner/verification" },
            { name: "Documents", icon: "FileText", route: "/partner/documents" },
            { name: "Safety", icon: "Shield", route: "/partner/safety" },
            { name: "Help", icon: "HelpCircle", route: "/partner/help" }
          ]
        }
      ]
    },
    client: {
      label: "Client (Traveler)",
      sections: [
        {
          title: "My Trips",
          items: [
            { name: "Upcoming", icon: "CalendarCheck", route: "/client/upcoming" },
            { name: "Past Trips", icon: "Map", route: "/client/past" },
            { name: "Saved Plans", icon: "Bookmark", route: "/client/saved" }
          ]
        },
        {
          title: "Plan & Book",
          items: [
            { name: "Destinations", icon: "MapPin", route: "/client/destinations" },
            { name: "Packages", icon: "Gift", route: "/client/packages" },
            { name: "Flights", icon: "Plane", route: "/client/flights" },
            { name: "Stays", icon: "BedDouble", route: "/client/stays" },
            { name: "Cars", icon: "Car", route: "/client/cars" },
            { name: "Tours", icon: "Mountain", route: "/client/tours" }
          ]
        },
        {
          title: "Collaborate & Quote",
          items: [
            { name: "Quote Builder", icon: "FileText", route: "/client/quotes" },
            { name: "Itinerary", icon: "Map", route: "/client/itinerary" },
            { name: "Chat", icon: "MessageSquare", route: "/client/chat" },
            { name: "Partner Chat", icon: "Users2", route: "/client/partner-chat" }
          ]
        },
        {
          title: "Manage Bookings",
          items: [
            { name: "Bookings", icon: "CalendarCheck", route: "/client/bookings" },
            { name: "Payment", icon: "Wallet", route: "/client/payment" },
            { name: "Vouchers", icon: "Tag", route: "/client/vouchers" },
            { name: "Invoices", icon: "FileText", route: "/client/invoices" },
            { name: "Confirmations", icon: "CheckCircle2", route: "/client/confirmations" }
          ]
        },
        {
          title: "Notifications & Help",
          items: [
            { name: "Notifications", icon: "MessageSquare", route: "/client/notifications" },
            { name: "Reminders", icon: "Clock3", route: "/client/reminders" },
            { name: "Messages", icon: "MessageSquare", route: "/client/messages" },
            { name: "Safety", icon: "Shield", route: "/client/safety" }
          ]
        },
        {
          title: "Reviews & Feedback",
          items: [
            { name: "Reviews", icon: "MessageSquare", route: "/client/reviews" },
            { name: "Feedback", icon: "MessageSquare", route: "/client/feedback" }
          ]
        }
      ]
    }
  }
};

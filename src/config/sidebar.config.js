// Programmatic sidebar config module. This mirrors the in-file SIDEBAR_CONFIG and
// can be required safely by Sidebar.jsx. Using .js avoids JSON-parse issues while
// editing the repo.
module.exports = {
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
      ],
    },
    partner: {
      label: "Partner (Supplier)",
      sections: [
        {
          title: "Dashboard & Performance",
          items: [{ name: "Dashboard", icon: "LayoutDashboard", route: "/partner/dashboard" }],
        },
      ],
    },
    client: {
      label: "Client (Traveler)",
      sections: [
        {
          title: "Dashboard",
          items: [{ name: "Upcoming Trips", icon: "CalendarCheck", route: "/client/upcoming" }],
        },
      ],
    },
  },
};

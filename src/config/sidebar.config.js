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
            { name: "Reports", icon: "BarChart3", route: "/admin/reports" },
            { name: "Analytics", icon: "TrendingUp", route: "/admin/analytics" }
          ]
        }
      ]
    },
    partner: {
      label: "Partner (Supplier)",
      sections: [
        {
          title: "Dashboard & Performance",
          items: [ { name: "Dashboard", icon: "LayoutDashboard", route: "/partner/dashboard" } ]
        }
      ]
    },
    client: {
      label: "Client (Traveler)",
      sections: [
        {
          title: "Dashboard",
          items: [ { name: "Upcoming Trips", icon: "CalendarCheck", route: "/client/upcoming" } ]
        }
      ]
    }
  }
};

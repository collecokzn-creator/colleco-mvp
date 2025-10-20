import { http, HttpResponse } from "msw";

export const handlers = [
  // Admin Dashboard Data
  http.get("/api/admin/overview", () => {
    return HttpResponse.json({
      totalUsers: 245,
      totalPartners: 28,
      activeBookings: 74,
      revenue: 583000,
      pendingApprovals: 3,
      recentActivities: [
        { id: 1, type: "Booking", user: "Nomsa Dlamini", item: "Umhlanga Sands", status: "Confirmed" },
        { id: 2, type: "Partner", user: "Beekman Holidays", item: "API Integration", status: "Active" },
        { id: 3, type: "User", user: "Thabo Mkhize", item: "Profile Updated", status: "Complete" },
      ],
    });
  }),

  // Partner Dashboard
  http.get("/api/partner/overview", () => {
    return HttpResponse.json({
      partnerName: "Beekman Holidays",
      activeProducts: 42,
      totalBookings: 189,
      monthlyRevenue: 127000,
      upcomingExpiries: 2,
    });
  }),

  // Users List
  http.get("/api/admin/users", () => {
    return HttpResponse.json([
      { id: 1, name: "Collin Mkhize", email: "plantrip@travelcolleco.com", role: "admin" },
      { id: 2, name: "Nomsa Dlamini", email: "nomsa@partner.com", role: "partner" },
      { id: 3, name: "Thabo Mkhize", email: "thabo@client.com", role: "client" },
    ]);
  }),
];
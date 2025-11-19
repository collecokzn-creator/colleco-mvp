// CollEco Travel MVP Enhancement Stubs
// React component skeletons and utilities to support the new MVP features.

import React from 'react';

// ==========================================================
// 1. GLOBAL UNIFIED SEARCH BAR COMPONENT
// ==========================================================
export const GlobalSearchBar = () => {
  return (
    <div className="w-full flex flex-col items-center p-4">
      <input
        type="text"
        placeholder="Search flights, hotels, cars, tours..."
        className="w-full max-w-3xl p-3 rounded-xl shadow-md border border-gray-200"
      />
      {/* TODO: Implement autosuggest + quick categories */}
    </div>
  );
};

// ==========================================================
// 2. HOME SCREEN LAYOUT (HERO + FEATURED SECTIONS) - stubs
// ==========================================================
export const HomeScreen = () => {
  return (
    <div className="space-y-10 p-4">
      <HeroBanner />
      <FeaturedDestinations />
    </div>
  );
};

export const HeroBanner = () => (
  <div className="w-full h-56 rounded-xl bg-gray-300 flex items-center justify-center">
    <h2 className="text-xl font-bold">Explore the world with CollEco Travel</h2>
  </div>
);

export const FeaturedDestinations = () => (
  <section>
    <h3 className="text-lg font-semibold mb-3">Featured Destinations</h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="h-32 bg-gray-200 rounded-xl"></div>
      <div className="h-32 bg-gray-200 rounded-xl"></div>
      <div className="h-32 bg-gray-200 rounded-xl"></div>
      <div className="h-32 bg-gray-200 rounded-xl"></div>
    </div>
  </section>
);

// ==========================================================
// 3. QUICK BOOK BUTTON ON PRODUCT CARDS
// ==========================================================
export const ProductCard = ({ title }) => (
  <div className="rounded-xl border shadow-sm p-4 bg-white">
    <h4 className="font-bold mb-2">{title}</h4>
    <button className="bg-green-600 text-white p-2 rounded-lg w-full mt-3">
      Quick Book
    </button>
  </div>
);

// ==========================================================
// 4. SUPPLIER DYNAMIC PRICING ENGINE STUB
// ==========================================================
export const PricingRulesForm = () => (
  <div className="space-y-4 p-4 border rounded-xl">
    <h3 className="text-lg font-semibold">Rate Rules</h3>
    <input type="date" className="border p-2 rounded w-full" />
    <input type="date" className="border p-2 rounded w-full" />
    <input
      type="number"
      placeholder="Set price"
      className="border p-2 rounded w-full"
    />
    <button className="bg-blue-600 text-white p-2 rounded-lg w-full">
      Save Rule
    </button>
  </div>
);

// ==========================================================
// 5. SUPPLIER PAYOUT DASHBOARD
// ==========================================================
export const SupplierPayoutDashboard = () => (
  <div className="space-y-6 p-4">
    <h2 className="text-xl font-bold">Earnings & Payouts</h2>
    <DashboardTile label="Total Earnings" value="R 0.00" />
    <DashboardTile label="Pending Payouts" value="R 0.00" />
    <DashboardTile label="Completed Payouts" value="R 0.00" />
    <button className="bg-blue-700 text-white p-3 rounded-xl w-full">Request Payout</button>
  </div>
);

const DashboardTile = ({ label, value }) => (
  <div className="p-4 bg-gray-100 rounded-xl shadow-sm flex justify-between">
    <span>{label}</span>
    <span className="font-bold">{value}</span>
  </div>
);

// ==========================================================
// 6. TRIP HISTORY + REBOOK
// ==========================================================
export const TripHistoryCard = ({ trip }) => (
  <div className="border rounded-xl p-4 shadow-sm bg-white">
    <h4 className="font-semibold">{trip?.title || 'Trip Title'}</h4>
    <button className="bg-orange-500 text-white p-2 rounded w-full mt-3">
      Rebook Trip
    </button>
  </div>
);

// ==========================================================
// 7. LITE MESSAGING SYSTEM
// ==========================================================
export const ChatBox = () => (
  <div className="flex flex-col h-96 border rounded-xl p-4">
    <div className="flex-1 overflow-y-auto bg-gray-100 p-2 rounded"></div>
    <input
      type="text"
      placeholder="Type a message..."
      className="border p-2 rounded mt-2"
    />
  </div>
);

// ==========================================================
// 8. SUPPORT TICKETS
// ==========================================================
export const SupportTicketForm = () => (
  <div className="p-4 border rounded-xl">
    <h3 className="text-lg font-semibold mb-3">Submit a Support Ticket</h3>
    <textarea className="w-full border rounded p-2 h-32"></textarea>
    <button className="mt-3 bg-blue-600 text-white p-2 rounded-xl w-full">Submit Ticket</button>
  </div>
);

// ==========================================================
// 9. REFUND TRACKING MODULE
// ==========================================================
export const RefundStatus = ({ status }) => (
  <div className="p-4 border rounded-xl bg-white">
    <h4 className="font-semibold">Refund Status</h4>
    <p className="text-blue-600 mt-2">Current: {status}</p>
  </div>
);

// ==========================================================
// 10. WISHLIST / FAVORITES
// ==========================================================
export const WishlistButton = () => (
  <button className="p-2 bg-red-500 text-white rounded-lg">❤ Add to Favorites</button>
);

// ==========================================================
// 11. SUPPLIER COMPLIANCE MANAGEMENT
// ==========================================================
export const ComplianceUpload = () => (
  <div className="p-4 border rounded-xl space-y-4">
    <h3 className="font-semibold">Upload Compliance Documents</h3>
    <input type="file" className="border p-2 rounded w-full" />
    <button className="bg-blue-600 text-white p-2 rounded w-full">Upload</button>
  </div>
);

// ==========================================================
// 12. BOOKING PROGRESS TRACKER
// ==========================================================
export const BookingStatusBar = ({ stage }) => {
  const stages = ["Requested", "Quoted", "Confirmed", "Active", "Completed", "Cancelled"];
  return (
    <div className="flex space-x-2 p-4">
      {stages.map((s, i) => (
        <div
          key={i}
          className={`flex-1 p-2 text-center rounded-lg text-xs ${stage === s ? "bg-green-500 text-white" : "bg-gray-200"}`}
        >
          {s}
        </div>
      ))}
    </div>
  );
};

// ==========================================================
// 13. BULK INVENTORY UPLOAD (CSV IMPORT)
// ==========================================================
export const BulkCSVUploader = () => (
  <div className="p-4 rounded-xl border">
    <h3 className="text-lg font-semibold mb-3">Upload Inventory CSV</h3>
    <input type="file" accept=".csv" className="border p-2 rounded w-full" />
    <button className="mt-3 bg-green-600 text-white p-2 rounded w-full">Upload CSV</button>
  </div>
);

// ==========================================================
// 14. AUTO-SUGGEST SEARCH API ENDPOINT (client helper)
// ==========================================================
export const getAutoSuggest = async (query) => {
  const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(query)}`);
  return res.json();
};

// ==========================================================
// 15. TRIP ALERTS / NOTIFICATIONS
// ==========================================================
export const TripAlertCard = ({ message }) => (
  <div className="p-3 bg-yellow-200 border rounded-xl mb-2">
    {message}
  </div>
);

// ==========================================================
// 16. PWA SUPPORT (service-worker placeholder)
// ==========================================================
export const serviceWorkerCode = `
self.addEventListener('install', (event) => {
  console.log('CollEco PWA Installed');
});
`;

// ==========================================================
// 17. MULTI-PAYMENT WALLET (BASIC UI)
// ==========================================================
export const PaymentMethods = () => (
  <div className="space-y-4 p-4">
    <h3 className="text-lg font-semibold">Stored Payment Methods</h3>
    <button className="p-3 bg-blue-600 text-white rounded-xl w-full">Add New Card</button>
  </div>
);

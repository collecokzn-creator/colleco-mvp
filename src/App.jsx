import React, { Suspense, lazy, useEffect, useState } from "react";
// import { UserProvider } from "./context/UserContext.jsx";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import RootLayout from "./layouts/RootLayout.jsx";
import AdminConsoleEnhanced from "./pages/AdminConsoleEnhanced.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";
const Home = lazy(() => import("./pages/Home.jsx"));
const Quotes = lazy(() => import("./pages/Quotes.jsx"));
const NewQuote = lazy(() => import("./pages/NewQuote.jsx"));
const Itinerary = lazy(() => import("./pages/Itinerary.jsx"));
const Bookings = lazy(() => import("./pages/Bookings.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const Safety = lazy(() => import("./pages/Safety.jsx"));
const Terms = lazy(() => import("./pages/Terms.jsx"));
const PlanTrip = lazy(() => import("./pages/PlanTrip.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const PartnerDashboard = lazy(() => import("./pages/PartnerDashboard.jsx"));
const AdminConsole = lazy(() => import("./pages/AdminConsole.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const Analytics = lazy(() => import("./pages/Analytics.jsx"));
const Partners = lazy(() => import("./pages/Partners.jsx"));
const Support = lazy(() => import("./pages/Support.jsx"));
const Trips = lazy(() => import("./pages/Trips.jsx"));
const Settings = lazy(() => import("./pages/Settings.jsx"));
const Compliance = lazy(() => import("./pages/Compliance.jsx"));
const Reports = lazy(() => import("./pages/Reports.jsx"));
const Promotions = lazy(() => import("./pages/Promotions.jsx"));
const Payouts = lazy(() => import("./pages/Payouts.jsx"));
const Collaboration = lazy(() => import("./pages/Collaboration.jsx"));
const CollabAnalytics = lazy(() => import("./pages/CollabAnalytics.jsx"));
const Transfers = lazy(() => import("./pages/Transfers.jsx"));
const TransportDispatch = lazy(() => import("./pages/TransportDispatch.jsx"));

const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess.jsx"));
const AIGeneratorPage = lazy(() => import("./pages/AIGeneratorPage.jsx"));
const AIMetricsPage = lazy(() => import("./pages/AIMetricsPage.jsx"));
const DirectBooking = lazy(() => import("./pages/DirectBooking.jsx"));

// UserContext for global user state
// Remove local UserContext, use UserProvider from context/UserContext.jsx

export default function App() {
  // Scroll to top on route change for clear view
  useEffect(() => {
    const unlisten = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('popstate', unlisten);
    return () => window.removeEventListener('popstate', unlisten);
  }, []);
  const [_user, setUser] = useState(null);

  useEffect(() => {
    // Persistent user detection
    const stored = localStorage.getItem("currentUser");
    if (stored) setUser(JSON.parse(stored));
    const idle = (cb) => ('requestIdleCallback' in window ? requestIdleCallback(cb, { timeout: 2000 }) : setTimeout(cb, 800));
    idle(() => {
      // Preload frequently demoed routes
      import("./pages/Bookings.jsx");
      import("./pages/Itinerary.jsx");
    });
  }, []);

  const useHash = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_USE_HASH === '1');
  const RouterComponent = useHash ? HashRouter : BrowserRouter;
  const basename = (!useHash && typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) ? import.meta.env.BASE_URL : undefined;
  return (
    <RouterComponent basename={basename}>
      <Suspense fallback={<div className="p-6 text-brand-russty">Loading…</div>}>
        <Routes>
          <Route element={<RootLayout />}> 
            <Route index element={<Home />} />
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/safety" element={<Safety />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />

            {/* Existing app routes */}
            <Route path="/quotes" element={<Quotes />} />
            <Route path="/quote/new" element={<NewQuote />} />
            <Route path="/itinerary" element={<Itinerary />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/partner-dashboard" element={<PartnerDashboard />} />
            <Route path="/admin-console" element={<AdminConsole />} />
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminConsoleEnhanced />
                </ProtectedRoute>
              } />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/direct-booking" element={<DirectBooking />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/promotions" element={<Promotions />} />
            <Route path="/payouts" element={<Payouts />} />
            <Route path="/collaboration" element={<Collaboration />} />
            <Route path="/collab-analytics" element={<CollabAnalytics />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/ai" element={<AIGeneratorPage />} />
            <Route path="/ai/metrics" element={<AIMetricsPage />} />

            {/* New menu routes */}
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/support" element={<Support />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/plan-trip" element={<PlanTrip />} />
            <Route path="/login" element={<Login />} />
              {/* Transport requester and dispatch */}
              <Route path="/transfers" element={<Transfers />} />
              <Route path="/transport-dispatch" element={<TransportDispatch />} />
          </Route>
        </Routes>
      </Suspense>
    </RouterComponent>
  );
}

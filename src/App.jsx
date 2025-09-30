import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import RootLayout from "./layouts/RootLayout.jsx";
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
const Settings = lazy(() => import("./pages/Settings.jsx"));
const Compliance = lazy(() => import("./pages/Compliance.jsx"));
const Reports = lazy(() => import("./pages/Reports.jsx"));
const Promotions = lazy(() => import("./pages/Promotions.jsx"));
const Payouts = lazy(() => import("./pages/Payouts.jsx"));
const Collaboration = lazy(() => import("./pages/Collaboration.jsx"));
const CollabAnalytics = lazy(() => import("./pages/CollabAnalytics.jsx"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess.jsx"));
const AIGeneratorPage = lazy(() => import("./pages/AIGeneratorPage.jsx"));
const AIMetricsPage = lazy(() => import("./pages/AIMetricsPage.jsx"));

export default function App() {
  useEffect(() => {
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
      <Suspense fallback={<div className="p-6 text-brand-brown">Loading…</div>}>
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
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/reports" element={<Reports />} />
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
            <Route path="/plan-trip" element={<PlanTrip />} />
            <Route path="/login" element={<Login />} />
          </Route>
        </Routes>
      </Suspense>
    </RouterComponent>
  );
}

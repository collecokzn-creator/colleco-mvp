import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import MobileNav from "../components/MobileNav.jsx";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import AutoFocus from "../components/AutoFocus.jsx";
import KeyboardShortcutsHelp from "../components/KeyboardShortcutsHelp.jsx";
import { Outlet } from "react-router-dom";
import globePng from "../assets/Globeicon.png";
import AIAgent from "../components/AIAgent.jsx";

export default function RootLayout() {
  // Feature flag: when deploying as a static site (GitHub Pages), there's no backend to ping.
  // Set VITE_HAS_BACKEND=1 to enable API health polling in environments with a server.
  const hasBackend = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_HAS_BACKEND === '1');
  const [showBackTop, setShowBackTop] = useState(false);
  const [apiOk, setApiOk] = useState(true);
  const [offline, setOffline] = useState(false);
  const [lastPingMs, setLastPingMs] = useState(0);
  const [toastDraft, setToastDraft] = useState(false);

  // Listen for pricing phase draft readiness from AI stream
  useEffect(() => {
    const onDraftPricing = () => {
      setToastDraft(true);
      // Auto dismiss after 12s
      const t = setTimeout(()=>setToastDraft(false), 12000);
      return () => clearTimeout(t);
    };
    window.addEventListener('colleco:draftPricing', onDraftPricing);
    return () => window.removeEventListener('colleco:draftPricing', onDraftPricing);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setShowBackTop(window.scrollY > 300);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Connectivity + API health poller
  useEffect(() => {
    let timer;
    const ping = async () => {
      const t0 = performance.now();
      const on = navigator.onLine;
      setOffline(!on);
      if (hasBackend) {
        try {
          const r = await fetch('/health', { cache: 'no-store' });
          setLastPingMs(Math.round(performance.now() - t0));
          setApiOk(r.ok);
        } catch {
          setApiOk(false);
        }
      } else {
        // No backend expected in static hosting: treat API as OK and avoid noisy console 404s.
        setLastPingMs(0);
        setApiOk(true);
      }
      timer = setTimeout(ping, 8000);
    };
    ping();
    return () => { if (timer) clearTimeout(timer); };
  }, [hasBackend]);

  const scrollToTop = () => {
    const prefersReduced = (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) || false;
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    }
  };
  return (
  <div className="min-h-screen bg-cream">
      <AutoFocus />
      {/* Connectivity bar - Hidden in development for better UX */}
      {false && (offline || (hasBackend && !apiOk)) && (
        <div role="status" aria-live="polite" className="fixed top-0 left-0 right-0 z-[70] bg-red-50 text-red-700 border-b border-red-200 text-xs px-3 py-1.5 flex items-center justify-between"
             style={{ ['--banner-h']: '28px' }}>
          <span>{offline ? 'You appear to be offline.' : 'API unavailable. Some features may not work.'}</span>
          {hasBackend && lastPingMs ? <span className="text-red-600/70">last ping {lastPingMs} ms</span> : null}
        </div>
      )}
      {/* Skip to content (accessibility) */}
      <a href="#main-content" className="sr-only focus:not-sr-only fixed top-2 left-2 z-[60] px-3 py-2 bg-white border border-cream-border shadow text-brand-brown rounded">Skip to content</a>
      {/* Top Navbar (fixed) */}
  <Navbar />

      {/* Main content area: body scroll; reserve space for fixed header/footer */}
      <div className="pb-24" style={{ paddingTop: 'calc(var(--header-h) + var(--banner-h))' }}>
        <div className="flex flex-row-reverse">
          <Sidebar />
          <main id="main-content" className="flex-1 min-w-0 focus:outline-none focus:ring-0" tabIndex="-1">
            <section className="px-6 py-6">
              <Breadcrumbs />
              <Outlet />
            </section>
          </main>
        </div>
      </div>

    {/* Footer (hidden on mobile, only white MobileNav shows) */}
    <AIAgent />

      {/* Mobile Bottom Navigation - White footer with Home, Packages, Bookings, Alerts, Account */}
      <MobileNav />

      {/* Keyboard Shortcuts Help - Global ? key trigger */}
      <KeyboardShortcutsHelp />

      {/* Back to Top button */}
      {showBackTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="hidden sm:inline-flex fixed bottom-[calc(var(--footer-h)+0.5rem)] right-4 z-50 px-3 py-2 rounded-full bg-brand-brown text-white shadow-lg border border-cream-border text-sm hover:bg-brand-brown/90 focus:outline-none focus:ring-2 focus:ring-brand-brown/40 focus:ring-offset-2 focus:ring-offset-cream"
          aria-label="Back to top"
        >
          ↑ Top
        </button>
      )}
      {toastDraft && (
        <div className="fixed bottom-[calc(var(--footer-h)+4.5rem)] right-4 z-[95] bg-white border border-brand-orange/30 shadow-lg rounded-md px-4 py-3 w-64 animate-fade-in">
          <div className="text-sm font-semibold text-brand-brown mb-1 flex items-center gap-2">
            <span className="text-brand-orange">✨</span> Draft Ready
          </div>
          <p className="text-[11px] text-brand-brown/70 mb-3">Pricing phase received. Import or refine itinerary now.</p>
          <div className="flex gap-2">
            <a href="/itinerary" className="flex-1 text-center px-2 py-1 rounded bg-brand-orange text-white text-xs font-semibold hover:bg-brand-highlight">Import</a>
            <a href="/plan-trip" className="flex-1 text-center px-2 py-1 rounded border border-brand-brown text-brand-brown text-xs font-semibold hover:bg-cream-hover">Planner</a>
          </div>
          <button onClick={()=>setToastDraft(false)} className="absolute top-1 right-1 text-[10px] text-brand-brown/60 hover:text-brand-brown">✕</button>
        </div>
      )}
    </div>
  );
}

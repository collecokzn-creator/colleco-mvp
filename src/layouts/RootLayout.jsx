import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { Outlet } from "react-router-dom";
import globePng from "../assets/Globeicon.png";

export default function RootLayout() {
  const [showBackTop, setShowBackTop] = useState(false);
  const [apiOk, setApiOk] = useState(true);
  const [offline, setOffline] = useState(false);
  const [lastPingMs, setLastPingMs] = useState(0);

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
      try {
        const r = await fetch('/health', { cache: 'no-store' });
        setLastPingMs(Math.round(performance.now() - t0));
        setApiOk(r.ok);
      } catch {
        setApiOk(false);
      }
      timer = setTimeout(ping, 8000);
    };
    ping();
    return () => { if (timer) clearTimeout(timer); };
  }, []);

  const scrollToTop = () => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  };
  return (
  <div className="min-h-screen bg-cream">
      {/* Connectivity bar */}
      {(!apiOk || offline) && (
        <div role="status" aria-live="polite" className="fixed top-0 left-0 right-0 z-[70] bg-red-50 text-red-700 border-b border-red-200 text-xs px-3 py-1.5 flex items-center justify-between"
             style={{ ['--banner-h']: '28px' }}>
          <span>{offline ? 'You appear to be offline.' : 'API unavailable. Some features may not work.'}</span>
          {lastPingMs ? <span className="text-red-600/70">last ping {lastPingMs} ms</span> : null}
        </div>
      )}
      {/* Skip to content (accessibility) */}
      <a href="#main-content" className="sr-only focus:not-sr-only fixed top-2 left-2 z-[60] px-3 py-2 bg-white border border-cream-border shadow text-brand-brown rounded">Skip to content</a>
      {/* Top Navbar (fixed) */}
  <Navbar />

      {/* Main content area: body scroll; reserve space for fixed header/footer */}
      <div className="pb-24" style={{ paddingTop: 'calc(var(--header-h) + var(--banner-h))' }}>
        <div className="flex">
          <Sidebar />
          <main id="main-content" className="flex-1 min-w-0 focus:outline-none focus:ring-0" tabIndex="-1">
            <section className="px-6 py-6">
              <Outlet />
            </section>
          </main>
        </div>
      </div>

      {/* Footer (fixed) */}
  <footer className="fixed bottom-0 left-0 right-0 bg-brand-brown text-white text-center py-4 text-sm border-t border-cream-border font-semibold tracking-wide flex flex-col items-center gap-1 z-40">
        <span>© {new Date().getFullYear()} CollEco Travel — All rights reserved.</span>
        <span className="flex items-center gap-2 text-white text-sm font-normal">
          <span className="inline-flex h-5 w-5 rounded-full overflow-hidden mr-1 align-text-bottom ring-[0.5px] ring-white/40 shrink-0 bg-white/10">
            <img src={globePng} alt="CollEco globe" className="h-full w-full object-cover object-center rounded-full" width="20" height="20" />
          </span>
          <a href="https://www.collecotravel.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-highlight">www.collecotravel.com</a>
        </span>
      </footer>

      {/* Back to Top button */}
      {showBackTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-[calc(var(--footer-h)+0.5rem)] right-4 z-50 px-3 py-2 rounded-full bg-brand-brown text-white shadow-lg border border-cream-border text-sm hover:bg-brand-brown/90 focus:outline-none focus:ring-2 focus:ring-brand-brown/40 focus:ring-offset-2 focus:ring-offset-cream"
          aria-label="Back to top"
        >
          ↑ Top
        </button>
      )}
    </div>
  );
}

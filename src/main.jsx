import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { UserProvider } from "./context/UserContext.jsx";
import "./index.css"; // Tailwind styles
import appIconPng from "./assets/colleco-logo.png";

function ensureLink(rel, attrs) {
  let link = document.querySelector(`link[rel="${rel}"]${attrs.sizes ? `[sizes="${attrs.sizes}"]` : ""}${attrs.type ? `[type="${attrs.type}"]` : ""}`);
  if (!link) {
    link = document.createElement('link');
    link.rel = rel;
    if (attrs.type) link.type = attrs.type;
    if (attrs.sizes) link.sizes = attrs.sizes;
    document.head.appendChild(link);
  }
  link.href = attrs.href;
}

function InstallBanner() {
  const [deferred, setDeferred] = useState(null);
  const [show, setShow] = useState(() => {
    // Show banner by default on first load, unless user has dismissed it
    try {
      return localStorage.getItem('colleco.installBannerDismissed') !== 'true';
    } catch {
      return true;
    }
  });
  useEffect(() => {
    const onPrompt = (e) => {
      // Prevent default to show our custom banner UI (gives better UX control)
      e.preventDefault();
      try { console.debug('beforeinstallprompt received - storing deferred prompt'); } catch {}
      setDeferred(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);
  const handleDismiss = () => {
    try { localStorage.setItem('colleco.installBannerDismissed', 'true'); } catch {}
    setShow(false);
  };
  if (!show) return null;
  return (
    <div style={{position:'fixed',left:12,right:12,bottom:12,background:'#fff7ee',border:'1px solid #eadfd2',borderRadius:10,padding:12,display:'flex',gap:8,alignItems:'center',boxShadow:'0 1px 6px rgba(0,0,0,.06)',zIndex:50}}>
      <span style={{color:'#4a3a2a'}}>Install CollEco for a faster app experience.</span>
      <div style={{marginLeft:'auto',display:'flex',gap:8}}>
        <button onClick={handleDismiss} style={{padding:'6px 10px',borderRadius:8,border:'1px solid #eadfd2',background:'#fff',color:'#4a3a2a'}}>Not now</button>
  <button onClick={async () => { if (!deferred) return; deferred.prompt(); const { outcome: _outcome } = await deferred.userChoice; setDeferred(null); handleDismiss(); }} style={{padding:'6px 10px',borderRadius:8,border:'none',background:'#ff7a00',color:'#fff'}}>Install</button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UserProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
      <InstallBanner />
    </UserProvider>
  </React.StrictMode>
);

// E2E mounted signal: when tests are running, expose a simple flag that
// indicates React has completed the initial render. Tests can wait on this
// to avoid mount races where DOM snapshots are taken before React mounts.
try {
  if (window && window.__E2E__) {
    try { window.__E2E_MOUNTED__ = true; } catch (e) {}
  }
} catch (e) {}

// Register service worker for PWA (disabled during local dev to avoid cache clashes)
if ('serviceWorker' in navigator && import.meta.env.PROD && !window.Cypress) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(async (reg) => {
      try {
        // Nudge SW to check for updated assets and refresh caches
        const send = (sw) => { try { sw.postMessage({ type: 'CHECK_FOR_UPDATE' }); } catch {} };
        if (reg.active) send(reg.active);
        reg.addEventListener('updatefound', () => {
          const nw = reg.installing; if (!nw) return;
          nw.addEventListener('statechange', () => { if (nw.state === 'activated') send(nw); });
        });
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          // New SW took control; optional gentle reload to ditch stale HTML if necessary
          // Only reload once per session
          try {
            if (!sessionStorage.getItem('reloadedAfterSW')) {
              sessionStorage.setItem('reloadedAfterSW', '1');
              location.reload();
            }
          } catch {}
        });
      } catch {}
    }).catch(() => {});
  });
}

// Ensure correct PNG icon is used as favicon and apple-touch-icon
try {
  ensureLink('icon', { type: 'image/png', href: appIconPng });
  ensureLink('apple-touch-icon', { href: appIconPng });
} catch {}

// E2E helper: when tests set window.__E2E__ we disable animations/transitions to avoid flakiness
try {
  if (window && window.__E2E__) {
    const s = document.createElement('style');
    s.setAttribute('data-e2e-disable-animations', 'true');
    s.textContent = `
      *, *::before, *::after { transition: none !important; animation: none !important; }
      [data-modal-root] { opacity: 1 !important; transform: none !important; }
    `;
    document.head.appendChild(s);
      // Ensure a modal root exists immediately for E2E tests and expose a readiness attribute
    try {
      let mr = document.querySelector('[data-modal-root]');
      if (!mr) {
        mr = document.createElement('div');
        mr.setAttribute('data-modal-root', 'true');
        // make the root occupy the viewport during E2E so elements inside are visible to Cypress
  mr.style.position = 'fixed';
  mr.style.top = '0';
  mr.style.left = '0';
  mr.style.width = '100%';
  mr.style.height = '100%';
  mr.style.minHeight = '100vh';
  mr.style.display = 'block';
  // Make the modal root non-blocking by default so it doesn't cover or intercept
  // interactions with the page underneath. Individual modal instances will opt-in
  // to pointer events when rendered into the root.
  mr.style.pointerEvents = 'none';
  // Use a very large z-index so the modal root is above any app content for E2E.
  mr.style.zIndex = String(2147483646);
        document.body.appendChild(mr);
      } else {
        // if it exists, ensure it has enough size to be considered visible in tests
        mr.style.display = mr.style.display || 'block';
        mr.style.minHeight = mr.style.minHeight || '100vh';
      }
      // mark ready for Cypress to wait on
      mr.setAttribute('data-e2e-ready', 'true');
    } catch (ee) { /* best-effort for E2E */ }
  }
} catch (e) {}

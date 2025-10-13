import React, { useEffect, useState } from "react";
import { worker } from "./mocks/browser";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { UserProvider } from "./context/UserContext.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
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
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);
  if (!show) return null;
  return (
    <div style={{position:'fixed',left:12,right:12,bottom:12,background:'#fff7ee',border:'1px solid #eadfd2',borderRadius:10,padding:12,display:'flex',gap:8,alignItems:'center',boxShadow:'0 1px 6px rgba(0,0,0,.06)',zIndex:50}}>
      <span style={{color:'#4a3a2a'}}>Install CollEco for a faster app experience.</span>
      <div style={{marginLeft:'auto',display:'flex',gap:8}}>
        <button onClick={() => setShow(false)} style={{padding:'6px 10px',borderRadius:8,border:'1px solid #eadfd2',background:'#fff',color:'#4a3a2a'}}>Not now</button>
  <button onClick={async () => { if (!deferred) return; deferred.prompt(); const { outcome: _outcome } = await deferred.userChoice; setDeferred(null); setShow(false); }} style={{padding:'6px 10px',borderRadius:8,border:'none',background:'#ff7a00',color:'#fff'}}>Install</button>
      </div>
    </div>
  );
}


async function enableMocking() {
  if (import.meta.env.DEV) {
    await worker.start({
      onUnhandledRequest: "bypass",
    });
  }
}

const mountApp = () => {
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
};

// Mount the app even if MSW fails to start (do not block the UI)
enableMocking().then(mountApp).catch(() => {
  try { mountApp(); } catch {}
});

// Register service worker for PWA
// Only register service worker in production builds to avoid dev caching issues
// Allow bypassing SW via URL param ?nosw=1 to avoid stale caches on mobile preview
const urlParams = new URLSearchParams(window.location.search);
const disableSW = urlParams.has('nosw');
if ('serviceWorker' in navigator && !window.Cypress && import.meta.env.PROD && !disableSW) {
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

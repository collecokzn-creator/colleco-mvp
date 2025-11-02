import React, { Suspense, lazy, useEffect } from "react";
import {
  BrowserRouter,
  HashRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import RootLayout from "./layouts/RootLayout.jsx";
import pagesConfig from "./config/pages.json";
import { useLocalStorageState } from "./useLocalStorageState";
import { resolveTemplateForRoute } from "./data/pageTemplates";

const fallbackComponentKey = "WorkspacePage";
const pageModules = import.meta.glob("./pages/*.jsx");
const componentRegistry = Object.entries(pageModules).reduce(
  (acc, [path, loader]) => {
    const componentName = path.replace("./pages/", "").replace(".jsx", "");
    acc[componentName] = lazy(loader);
    return acc;
  },
  {}
);
const fallbackComponent = componentRegistry[fallbackComponentKey];

if (!fallbackComponent) {
  throw new Error(
    `[router] Unable to locate ${fallbackComponentKey}. Ensure pages/${fallbackComponentKey}.jsx exists.`
  );
}

function extractRoutesFromConfig(config) {
  const categories = config?.layout?.main?.categories ?? [];
  return categories.flatMap(({ group, routes = [] }) =>
    routes
      .filter((route) => route?.path)
      .map((route) => ({
        ...route,
        component: route.component ?? fallbackComponentKey,
        meta: { ...(route.meta ?? {}) },
        group,
      }))
  );
}

const CONFIG_ROUTES = extractRoutesFromConfig(pagesConfig);
const ROUTE_LOOKUP = new Map(CONFIG_ROUTES.map((route) => [route.path, route]));
const HOME_ROUTE = ROUTE_LOOKUP.get("/") ?? null;
const ROUTES_EXCLUDING_HOME = CONFIG_ROUTES.filter((route) => route.path !== "/");

function createRouteElement(route) {
  const componentKey = route.component ?? fallbackComponentKey;
  const Component = componentRegistry[componentKey] ?? fallbackComponent;
  const templateConfig = resolveTemplateForRoute(route);

  if (!componentRegistry[componentKey]) {
    console.warn(
      `[router] Component "${componentKey}" missing; defaulting to ${fallbackComponentKey} for path "${route.path}".`
    );
  }

  const isWorkspaceView =
    componentKey === fallbackComponentKey || Component === fallbackComponent;
  const elementProps = isWorkspaceView
    ? { pageKey: route.path, template: templateConfig, route }
    : { template: templateConfig, route };

  return <Component {...elementProps} />;
}

function GuardedRoute({ route }) {
  const [activeRole] = useLocalStorageState("colleco.sidebar.role", null);
  // Under Cypress E2E there is a small race where the React hook may initialize
  // before the test's onBeforeLoad sets localStorage. If we're in E2E mode and
  // activeRole is not present yet, read localStorage directly as a fallback so
  // guarded routes don't prematurely redirect to '/'. This keeps production
  // behavior unchanged while stabilizing tests.
  let effectiveRole = activeRole;
  if (!effectiveRole && typeof window !== 'undefined' && window.__E2E__) {
    try {
      const raw = localStorage.getItem('colleco.sidebar.role');
      if (raw) effectiveRole = JSON.parse(raw);
    } catch (e) {
      // ignore parse errors
    }
  }
  const isAuthenticated = Boolean(effectiveRole);
  const meta = route.meta ?? {};
  const requiredRoles = Array.isArray(meta.roles)
    ? meta.roles
    : meta.role
    ? [meta.role]
    : [];

  if (meta.requiresAuth && !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: route.path }} />;
  }

  if (
    requiredRoles.length > 0 &&
    (!effectiveRole || !requiredRoles.includes(effectiveRole))
  ) {
    const fallback = meta.redirectFallback ?? "/";
    return <Navigate to={fallback} replace />;
  }

  return createRouteElement(route);
}

function RouteMetadataSync() {
  const location = useLocation();

  useEffect(() => {
    const currentRoute = ROUTE_LOOKUP.get(location.pathname);
    if (currentRoute?.meta?.title) {
      document.title = currentRoute.meta.title;
    }
  }, [location.pathname]);

  return null;
}

const NotFoundElement = (
  <div className="p-6 text-brand-brown">
    We couldn&apos;t find the page you were looking for.
  </div>
);

export default function App() {
  useEffect(() => {
    const idle = (cb) =>
      "requestIdleCallback" in window
        ? requestIdleCallback(cb, { timeout: 2000 })
        : setTimeout(cb, 800);

    idle(() => {
      import("./pages/Bookings.jsx");
      import("./pages/Itinerary.jsx");
    });
  }, []);

  // E2E authoritative mounted/readiness marker.
  // Set this after the root app mounts so Cypress can wait on a reliable
  // flag instead of fragile DOM timing. We use a short idle to let initial
  // synchronous layout complete before signalling mounted.
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.__E2E__) {
        const mark = () => {
          try {
            window.__E2E_MOUNTED__ = true;
          } catch (e) {}
          try {
            document && document.body && document.body.setAttribute && document.body.setAttribute('data-e2e-ready', 'true');
          } catch (e) {}
        };
        if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(mark);
        else setTimeout(mark, 0);
      }
    } catch (e) {}
  }, []);

  // Prefer HashRouter when explicitly requested via VITE_USE_HASH, or when
  // the app is served from a non-root base (BASE_URL) which can cause
  // 404s on deep links on static hosts. Hash routing avoids server-side
  // fallback requirements and is safer for GitHub Pages or subpath hosts.
  const useHash = (() => {
    try {
      const env = import.meta.env || {};
      if (env.VITE_USE_HASH === "1") return true;
      const baseUrl = env.BASE_URL || env.VITE_BASE_PATH || '/';
      // If the base is not root, prefer hash routing by default
      if (typeof baseUrl === 'string' && baseUrl !== '/' && baseUrl !== '') return true;
    } catch (e) {}
    return false;
  })();
  const RouterComponent = useHash ? HashRouter : BrowserRouter;
  const basename =
    !useHash &&
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.BASE_URL
      ? import.meta.env.BASE_URL
      : undefined;

  return (
    <RouterComponent basename={basename}>
      <RouteMetadataSync />
      <Suspense fallback={<div className="p-6 text-brand-brown">Loading…</div>}>
        <Routes>
          <Route element={<RootLayout />}>
            {HOME_ROUTE && <Route index element={<GuardedRoute route={HOME_ROUTE} />} />}
            {HOME_ROUTE && (
              <Route path="/" element={<GuardedRoute route={HOME_ROUTE} />} />
            )}
            {ROUTES_EXCLUDING_HOME.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<GuardedRoute route={route} />}
              />
            ))}
            <Route path="*" element={NotFoundElement} />
          </Route>
        </Routes>
      </Suspense>
    </RouterComponent>
  );
}

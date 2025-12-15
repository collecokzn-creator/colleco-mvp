// Lightweight route prefetching to speed up perceived navigation.
// Prefetches lazily-loaded page modules on hover/focus or when links enter the viewport.
import pagesConfig from "../config/pages.json";

const pageModules = import.meta.glob("../pages/*.jsx");
const prefetched = new Set();

function extractRoutesFromConfig(config) {
  const categories = config?.layout?.main?.categories ?? [];
  return categories.flatMap(({ group, routes = [] }) =>
    routes
      .filter((route) => route?.path)
      .map((route) => ({
        ...route,
        component: route.component ?? "WorkspacePage",
        meta: { ...(route.meta ?? {}) },
        group,
      }))
  );
}

const CONFIG_ROUTES = extractRoutesFromConfig(pagesConfig);
const ROUTE_BY_PATH = new Map(CONFIG_ROUTES.map((r) => [r.path, r]));

export async function prefetchRouteByPath(path) {
  try {
    if (!path) return;
    const route = ROUTE_BY_PATH.get(path);
    if (!route) return;
    const componentKey = route.component || "WorkspacePage";
    const modulePath = `../pages/${componentKey}.jsx`;
    if (prefetched.has(modulePath)) return;
    const loader = pageModules[modulePath];
    if (typeof loader === "function") {
      await loader();
      prefetched.add(modulePath);
    }
  } catch (e) {
    // Swallow prefetch errors; never block navigation
  }
}

export function observeAndPrefetchLinks(linkNodes = []) {
  if (typeof IntersectionObserver === "undefined") return () => {};
  const toUnobserve = [];
  const obs = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const el = entry.target;
        const path = el?.getAttribute?.("href") || el?.dataset?.to;
        if (path) prefetchRouteByPath(path);
        obs.unobserve(el);
      }
    }
  }, { rootMargin: "120px" });
  for (const n of linkNodes) {
    if (n) {
      obs.observe(n);
      toUnobserve.push(n);
    }
  }
  return () => {
    try { for (const n of toUnobserve) obs.unobserve(n); } catch {}
    try { obs.disconnect(); } catch {}
  };
}

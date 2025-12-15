import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { s as loadCustomAliases, t as saveCustomAliases } from "./index-DlOecmR0.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
import "./icons-C4AMPM7L.js";
function ApiStatusCard() {
  const [health, setHealth] = reactExports.useState(null);
  const [providers, setProviders] = reactExports.useState(null);
  const [events, setEvents] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [latency, setLatency] = reactExports.useState({ health: 0, providers: 0, events: 0 });
  const [lastError, setLastError] = reactExports.useState(null);
  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const t0 = performance.now();
      const h = await fetch("/health").then((r) => r.ok ? r.json() : Promise.reject(new Error("health failed")));
      setLatency((l) => ({ ...l, health: Math.round(performance.now() - t0) }));
      setHealth(h);
    } catch (e) {
      setHealth(null);
      setError(e.message || "health failed");
      setLastError({ at: Date.now(), message: e.message });
    }
    try {
      const t0 = performance.now();
      const p = await fetch("/api/providers").then((r) => r.ok ? r.json() : Promise.reject(new Error("providers failed")));
      setLatency((l) => ({ ...l, providers: Math.round(performance.now() - t0) }));
      setProviders(p);
    } catch (e) {
      setProviders(null);
      setError((prev) => prev || e.message || "providers failed");
      setLastError((prev) => prev || { at: Date.now(), message: e.message });
    }
    try {
      const t0 = performance.now();
      const ev = await fetch("/api/events/search?country=ZA&demo=1").then((r) => r.ok ? r.json() : Promise.reject(new Error("events failed")));
      setLatency((l) => ({ ...l, events: Math.round(performance.now() - t0) }));
      setEvents(ev);
    } catch (e) {
      setEvents(null);
      setError((prev) => prev || e.message || "events failed");
      setLastError((prev) => prev || { at: Date.now(), message: e.message });
    }
    setLoading(false);
  }
  reactExports.useEffect(() => {
    refresh();
  }, []);
  const ok = (val) => !!val;
  const providerList = Array.isArray(providers?.providers) ? providers.providers : Array.isArray(providers) ? providers : [];
  const eventsCount = Array.isArray(events?.events) ? events.events.length : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border border-cream-border bg-white rounded mb-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-brand-brown", children: "API Status" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: refresh, disabled: loading, className: "text-xs px-2 py-1 border border-cream-border rounded bg-cream hover:bg-cream-hover disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed", children: loading ? "Refreshing…" : "Refresh" })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-red-600 mb-2", children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "text-sm text-brand-brown/80 space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Health:" }),
        " ",
        ok(health) ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-700", children: "OK" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-600", children: "Unavailable" }),
        health?.service ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-brand-brown/60", children: health.service }) : null,
        latency.health ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-brand-brown/50", children: [
          latency.health,
          " ms"
        ] }) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Providers API:" }),
        " ",
        ok(providers) ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-700", children: "OK" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-600", children: "Unavailable" }),
        providerList?.length >= 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-brand-brown/60", children: [
          providerList.length,
          " configured"
        ] }) : null,
        latency.providers ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-brand-brown/50", children: [
          latency.providers,
          " ms"
        ] }) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Events (demo):" }),
        " ",
        ok(events) ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-700", children: "OK" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-600", children: "Unavailable" }),
        ok(events) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-brand-brown/60", children: [
          eventsCount,
          " found"
        ] }) : null,
        latency.events ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-brand-brown/50", children: [
          latency.events,
          " ms"
        ] }) : null
      ] })
    ] }),
    lastError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-brand-brown/60 mt-2", children: [
      "Last error at ",
      new Date(lastError.at).toLocaleTimeString(),
      ": ",
      lastError.message
    ] })
  ] });
}
function authHeaders() {
  return {};
}
async function getProviderToggles() {
  const res = await fetch(`/api/providers`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch provider toggles (${res.status})`);
  const j = await res.json();
  const list = Array.isArray(j) ? j : Array.isArray(j.providers) ? j.providers : [];
  return list.map((p) => ({ name: String(p.name || "").toLowerCase(), enabled: !!p.enabled }));
}
async function updateProviderToggles(list) {
  const payload = list.map((p) => ({ name: String(p.name || "").toLowerCase(), enabled: !!p.enabled }));
  const res = await fetch(`/api/providers`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Failed to update provider toggles (${res.status})`);
  const j = await res.json();
  const listOut = Array.isArray(j) ? j : Array.isArray(j.providers) ? j.providers : [];
  return listOut.map((p) => ({ name: String(p.name || "").toLowerCase(), enabled: !!p.enabled }));
}
function Settings() {
  const [loading, setLoading] = reactExports.useState(true);
  const [saving, setSaving] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [success, setSuccess] = reactExports.useState("");
  const [toggles, setToggles] = reactExports.useState([
    { name: "ticketmaster", enabled: true },
    { name: "seatgeek", enabled: true }
  ]);
  const [demoEvents, setDemoEvents] = reactExports.useState(() => localStorage.getItem("demoEvents") === "1");
  const [smartAliases, setSmartAliases] = reactExports.useState(() => localStorage.getItem("smartAliases") !== "0");
  const [customAliases, setCustomAliases] = reactExports.useState(() => loadCustomAliases());
  const [newAlias, setNewAlias] = reactExports.useState({ key: "", kind: "city", value: "" });
  const [showWeather, setShowWeather] = reactExports.useState(() => localStorage.getItem("showWeather") !== "0");
  async function refresh() {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const list = await getProviderToggles();
      if (Array.isArray(list) && list.length) setToggles(list);
    } catch (e) {
      setError(e.message || "Failed to load provider toggles");
    } finally {
      setLoading(false);
    }
  }
  reactExports.useEffect(() => {
    refresh();
  }, []);
  async function save() {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await updateProviderToggles(toggles);
      setToggles(updated);
      setSuccess("Provider settings saved");
    } catch (e) {
      setError(e.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }
  function toggleProvider(name) {
    setToggles((prev) => prev.map((p) => p.name === name ? { ...p, enabled: !p.enabled } : p));
  }
  function onDemoToggle() {
    const next = !demoEvents;
    setDemoEvents(next);
    localStorage.setItem("demoEvents", next ? "1" : "0");
  }
  function onSmartAliasesToggle() {
    const next = !smartAliases;
    setSmartAliases(next);
    localStorage.setItem("smartAliases", next ? "1" : "0");
  }
  function onShowWeatherToggle() {
    const next = !showWeather;
    setShowWeather(next);
    localStorage.setItem("showWeather", next ? "1" : "0");
    try {
      window.dispatchEvent(new StorageEvent("storage", { key: "showWeather", newValue: next ? "1" : "0" }));
    } catch {
    }
  }
  function addCustomAlias() {
    const key = (newAlias.key || "").trim().toLowerCase();
    const value = (newAlias.value || "").trim();
    const kind = newAlias.kind;
    if (!key || !value) {
      setError("Alias key and value are required");
      return;
    }
    const next = customAliases.filter((a) => (a && a.key) !== key);
    const record = { key };
    if (kind === "area") record.area = value;
    else if (kind === "city") record.city = value;
    else if (kind === "province") record.province = value;
    else if (kind === "country") record.country = value;
    else if (kind === "continent") record.continent = value;
    next.push(record);
    setCustomAliases(next);
    saveCustomAliases(next);
    setNewAlias({ key: "", kind, value: "" });
    setSuccess("Custom alias added");
    setTimeout(() => setSuccess(""), 1200);
  }
  function removeCustomAlias(key) {
    const next = customAliases.filter((a) => a.key !== key);
    setCustomAliases(next);
    saveCustomAliases(next);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-hidden min-h-screen flex items-start justify-center px-4 py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-3xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold mb-3 text-brand-orange", children: "Settings" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ApiStatusCard, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-cream-sand p-4 border border-cream-border space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-brand-brown mb-2", children: "Events Providers" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown/80 mb-3", children: "Enable or disable trusted sources for events aggregation." }),
        loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-brand-brown", children: "Loading…" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-cream-border", children: toggles.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "py-2 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize text-brand-brown", children: p.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "inline-flex items-center gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: p.enabled, onChange: () => toggleProvider(p.name) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: p.enabled ? "Enabled" : "Disabled" })
          ] })
        ] }, p.name)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: refresh, className: "px-3 py-1.5 bg-white border border-cream-border text-brand-brown hover:bg-cream-sand/70", children: "Refresh" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: save, disabled: saving, className: "px-3 py-1.5 bg-brand-orange text-white disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed", children: saving ? "Saving…" : "Save" })
        ] }),
        error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-red-600", children: error }),
        success && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-green-700", children: success })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "pt-4 border-t border-cream-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-brand-brown mb-2", children: "Demo Data" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "inline-flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: demoEvents, onChange: onDemoToggle }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Show demo events (force demo results in Events UI)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-brand-brown/70 mt-1", children: "This sets a local flag only. The server also auto-falls back to demo when no provider keys are configured." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "pt-4 border-t border-cream-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-brand-brown mb-2", children: "Weather" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "inline-flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: showWeather, onChange: onShowWeatherToggle }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Show live weather in Planner" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "pt-4 border-t border-cream-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-brand-brown mb-2", children: "Smart Search" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "inline-flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: smartAliases, onChange: onSmartAliasesToggle }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Use location aliases (CPT, JHB, KZN…)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-brand-brown/70 mt-1", children: "When enabled, common shorthand codes and nicknames are recognized in search (e.g., CPT → Cape Town, JHB → Johannesburg, KZN → KwaZulu-Natal)." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "pt-4 border-t border-cream-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-brand-brown mb-2", children: "Custom Location Aliases" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown/80 mb-3", children: 'Add your own shortcuts (e.g., "PSB" → Port Shepstone). These merge with built-ins and only apply on this device.' }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-2 items-start sm:items-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs text-brand-brown/70 mb-1", children: "Alias key" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: "w-full border border-cream-border px-2 py-1.5 bg-white", placeholder: "e.g., psb", value: newAlias.key, onChange: (e) => setNewAlias((v) => ({ ...v, key: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs text-brand-brown/70 mb-1", children: "Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "border border-cream-border px-2 py-1.5 bg-white", value: newAlias.kind, onChange: (e) => setNewAlias((v) => ({ ...v, kind: e.target.value })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "area", children: "Area" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "city", children: "City" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "province", children: "Province" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "country", children: "Country" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "continent", children: "Continent" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs text-brand-brown/70 mb-1", children: "Maps to" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: "w-full border border-cream-border px-2 py-1.5 bg-white", placeholder: "e.g., Port Shepstone", value: newAlias.value, onChange: (e) => setNewAlias((v) => ({ ...v, value: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: addCustomAlias, className: "px-3 py-1.5 bg-brand-orange text-white", children: "Add" }) })
        ] }),
        customAliases && customAliases.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-3 divide-y divide-cream-border", children: customAliases.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "py-2 flex items-center justify-between text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-brand-brown", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono bg-white border border-cream-border px-1 py-0.5 mr-2", children: a.key }),
            a.area ? `Area: ${a.area}` : a.city ? `City: ${a.city}` : a.province ? `Province: ${a.province}` : a.country ? `Country: ${a.country}` : a.continent ? `Continent: ${a.continent}` : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => removeCustomAlias(a.key), className: "px-2 py-1 border border-cream-border bg-white text-brand-brown", children: "Remove" })
        ] }, a.key)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-brand-brown/70 mt-2", children: "No custom aliases yet." })
      ] })
    ] })
  ] }) });
}
export {
  Settings as default
};
//# sourceMappingURL=Settings-BxFyJ7jf.js.map

import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import "./react-4gMnsuNC.js";
const API_BASE = "http://localhost:4000";
function usePolling(url, interval = 4e3) {
  const [data, setData] = reactExports.useState(null);
  const [error, setError] = reactExports.useState("");
  const timerRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    let mounted = true;
    async function fetchOnce() {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(await res.text() || "Request failed");
        }
        const j = await res.json();
        if (mounted) setData(j);
      } catch (e) {
        if (mounted) setError(e.message || "Error");
      }
    }
    fetchOnce();
    timerRef.current = setInterval(fetchOnce, interval);
    return () => {
      mounted = false;
      clearInterval(timerRef.current);
    };
  }, [url, interval]);
  return { data, error };
}
function AIMetricsPage() {
  const { data, error } = usePolling(`${API_BASE}/api/ai/metrics`, 5e3);
  const { data: history } = usePolling(`${API_BASE}/api/ai/metrics/history`, 1e4);
  const { data: cfg } = usePolling(`${API_BASE}/api/ai/config${""}`, 2e4);
  const [series, setSeries] = reactExports.useState([]);
  const [refineSeries, setRefineSeries] = reactExports.useState([]);
  const [cacheRatioSeries, setCacheRatioSeries] = reactExports.useState([]);
  const [tokenSeries, setTokenSeries] = reactExports.useState([]);
  reactExports.useEffect(() => {
    if (data) {
      setSeries((s) => [...s.slice(-49), { t: Date.now(), total: data.total, cacheHits: data.cacheHits, cacheMiss: data.cacheMiss }]);
      setRefineSeries((s) => [...s.slice(-49), { t: Date.now(), refine: data.refine }]);
      const denom = data.cacheHits + data.cacheMiss || 0;
      if (denom) {
        const ratio = data.cacheHits / denom * 100;
        setCacheRatioSeries((s) => [...s.slice(-49), { t: Date.now(), ratio }]);
      }
      if (data.tokens && typeof data.tokens.total === "number") {
        setTokenSeries((s) => [...s.slice(-49), { t: Date.now(), tokens: data.tokens.total }]);
      }
    }
  }, [data]);
  const historyLoadedRef = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (history && Array.isArray(history.samples) && history.samples.length && !historyLoadedRef.current) {
      historyLoadedRef.current = true;
      const snapshots = history.samples.slice(-100);
      const mappedTotal = snapshots.map((s) => ({ t: s.ts, total: s.total, cacheHits: s.cacheHits, cacheMiss: s.cacheMiss }));
      const mappedRefine = snapshots.map((s) => ({ t: s.ts, refine: s.refine }));
      const mappedRatio = snapshots.filter((s) => s.cacheHits + s.cacheMiss > 0).map((s) => ({ t: s.ts, ratio: s.cacheHits / (s.cacheHits + s.cacheMiss) * 100 }));
      const mappedTokens = snapshots.filter((s) => s.tokens && typeof s.tokens.total === "number").map((s) => ({ t: s.ts, tokens: s.tokens.total }));
      setSeries(mappedTotal);
      setRefineSeries(mappedRefine);
      setCacheRatioSeries(mappedRatio);
      if (mappedTokens.length) setTokenSeries(mappedTokens);
    }
  }, [history]);
  function spark(values, key = "total", color = "#c2410c") {
    if (!values.length) return null;
    const max = Math.max(...values.map((v) => v[key]));
    const min = Math.min(...values.map((v) => v[key]));
    const range = max - min || 1;
    const pts = values.map((v, i) => {
      const x = i / (values.length - 1) * 100;
      const y = 100 - (v[key] - min) / range * 100;
      return `${x},${y}`;
    }).join(" ");
    return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 100 100", preserveAspectRatio: "none", className: "w-full h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { fill: "none", stroke: color, strokeWidth: "2", points: pts }) });
  }
  function latencyBadge(label, value, thresholds) {
    const { warn = 300, danger = 800 } = thresholds || {};
    let tone = "bg-emerald-200 text-emerald-900";
    if (value >= danger) tone = "bg-red-300 text-red-900";
    else if (value >= warn) tone = "bg-amber-300 text-amber-900";
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide ${tone}`, children: [
      label,
      " ",
      value,
      "ms"
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto p-6 flex flex-col gap-6", "aria-labelledby": "aiMetricsHeading", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { id: "aiMetricsHeading", className: "text-2xl font-bold text-brand-brown", children: "AI Metrics" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            window.open(`${API_BASE}/api/ai/metrics/history/download${""}`, "_blank");
          },
          className: "text-[11px] px-3 py-1 rounded bg-brand-brown text-cream-sand font-semibold hover:bg-brand-brown/90 focus:outline-none focus:ring-2 focus:ring-brand-brown/50",
          children: "Download History"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown/70 leading-snug", children: "Live heuristic AI usage counters (ephemeral, reset on server restart). Polls every 5s." }),
    cfg && cfg.llm && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] flex flex-wrap gap-2 items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 py-0.5 rounded bg-brand-brown/10 text-brand-brown uppercase tracking-wide", children: [
        "LLM: ",
        cfg.llm.provider
      ] }),
      cfg.llm.model && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 py-0.5 rounded bg-cream-sand border border-cream-border text-brand-brown", children: [
        "model: ",
        cfg.llm.model
      ] }),
      cfg.hybridLLM ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded bg-emerald-100 text-emerald-900", children: "hybrid on" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded bg-amber-100 text-amber-900", children: "hybrid off" })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded text-sm", children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-3 gap-4", children: data && [
      { label: "Total", value: data.total },
      { label: "Cache Hits", value: data.cacheHits },
      { label: "Cache Miss", value: data.cacheMiss },
      { label: "Refines", value: data.refine },
      { label: "Drafts", value: data.drafts },
      { label: "Rate Limited", value: data.rateLimited }
    ].map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded border border-cream-border bg-cream-sand/40 flex flex-col gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold text-brand-brown/80 uppercase tracking-wide", children: m.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold text-brand-brown", children: m.value })
    ] }, m.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-24 border border-cream-border rounded bg-cream-sand/40 p-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] font-semibold mb-1 text-brand-brown/70", children: [
          "Total Requests (",
          series.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-16", children: spark(series, "total", "#c2410c") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-24 border border-cream-border rounded bg-cream-sand/40 p-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] font-semibold mb-1 text-brand-brown/70", children: [
          "Refine Requests (",
          refineSeries.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-16", children: spark(refineSeries, "refine", "#92400e") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-24 border border-cream-border rounded bg-cream-sand/40 p-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-semibold mb-1 text-brand-brown/70", children: "Cache Hit Ratio (%)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-16", children: spark(cacheRatioSeries, "ratio", "#065f46") })
      ] })
    ] }),
    tokenSeries.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-24 border border-cream-border rounded bg-cream-sand/40 p-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] font-semibold mb-1 text-brand-brown/70", children: [
        "Total Tokens (",
        tokenSeries[tokenSeries.length - 1].tokens,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-16", children: spark(tokenSeries, "tokens", "#1d4ed8") })
    ] }),
    data && data.latencyPercentiles && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded border border-cream-border bg-cream-sand/40 text-[11px] flex flex-col gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Latency (gen)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-1", children: [
          latencyBadge("P50", data.latencyPercentiles.gen.p50, { warn: 300, danger: 800 }),
          latencyBadge("P95", data.latencyPercentiles.gen.p95, { warn: 500, danger: 1200 }),
          latencyBadge("P99", data.latencyPercentiles.gen.p99, { warn: 700, danger: 1500 }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] px-1.5 py-0.5 rounded bg-brand-brown/10 text-brand-brown font-semibold", children: [
            "Avg ",
            data.avgLatencyMs?.gen,
            "ms"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded border border-cream-border bg-cream-sand/40 text-[11px] flex flex-col gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Latency (refine)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-1", children: [
          latencyBadge("P50", data.latencyPercentiles.refine.p50, { warn: 300, danger: 800 }),
          latencyBadge("P95", data.latencyPercentiles.refine.p95, { warn: 500, danger: 1200 }),
          latencyBadge("P99", data.latencyPercentiles.refine.p99, { warn: 700, danger: 1500 }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] px-1.5 py-0.5 rounded bg-brand-brown/10 text-brand-brown font-semibold", children: [
            "Avg ",
            data.avgLatencyMs?.refine,
            "ms"
          ] })
        ] })
      ] })
    ] }),
    data && data.rateLimit && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded border border-cream-border bg-cream-sand/40 text-[11px] flex flex-col gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold mb-1", children: "Rate Limit" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 bg-brand-brown/10 rounded text-brand-brown text-[10px] uppercase tracking-wide", children: data.rateLimit.strategy }),
        data.rateLimit.strategy === "token_bucket" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "capacity ",
          data.rateLimit.capacity,
          " • refill ",
          data.rateLimit.refillMs,
          "ms"
        ] }),
        data.rateLimit.strategy === "sliding_window" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "window ",
          data.rateLimit.windowMs,
          "ms • max ",
          data.rateLimit.max
        ] })
      ] })
    ] }),
    history && Array.isArray(history.samples) && history.samples.length > 0 && (() => {
      const last = history.samples[history.samples.length - 1];
      if (!last) return null;
      const hasDeltas = last.tokensDelta || typeof last.costDelta === "number" || typeof last.totalDelta === "number";
      if (!hasDeltas) return null;
      const reqPerSec = typeof last.totalDelta === "number" ? (last.totalDelta / 10).toFixed(2) : "0.00";
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded border border-cream-border bg-cream-sand/40 text-[11px] grid sm:grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold mb-0.5", children: "Last Interval Requests" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold text-brand-brown text-sm", children: [
            last.totalDelta ?? 0 >= 0 ? "+" : "",
            last.totalDelta ?? 0
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-brand-brown/60", children: [
            "~10s window • ",
            reqPerSec,
            "/s"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold mb-0.5", children: "Token Delta (total)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-brand-brown text-sm", children: last.tokensDelta ? (last.tokensDelta.total >= 0 ? "+" : "") + last.tokensDelta.total : "0" }),
          last.tokensDelta && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-brand-brown/60", children: [
            "prompt ",
            last.tokensDelta.prompt >= 0 ? "+" : "",
            last.tokensDelta.prompt,
            " • completion ",
            last.tokensDelta.completion >= 0 ? "+" : "",
            last.tokensDelta.completion
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold mb-0.5", children: "Cost Δ (USD)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold text-brand-brown text-sm", children: [
            last.costDelta >= 0 ? "+" : "",
            last.costDelta?.toFixed ? last.costDelta.toFixed(6) : last.costDelta
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-brand-brown/60", children: [
            "cumulative ",
            data?.costUsd?.toFixed ? data.costUsd.toFixed(6) : data?.costUsd
          ] })
        ] })
      ] });
    })(),
    data && data.tokens && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-4 gap-4", children: [{ label: "Prompt Tokens", v: data.tokens.prompt }, { label: "Completion Tokens", v: data.tokens.completion }, { label: "Total Tokens", v: data.tokens.total }, { label: "Est. Cost (USD)", v: data.costUsd?.toFixed ? data.costUsd.toFixed(6) : data.costUsd }].map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded border border-cream-border bg-cream-sand/40 flex flex-col gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-semibold uppercase tracking-wide text-brand-brown/70", children: m.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold text-brand-brown break-all", children: m.v })
    ] }, m.label)) }),
    data && /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer font-semibold", children: "Raw JSON" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "bg-cream-sand border border-cream-border rounded p-2 overflow-auto max-h-64 whitespace-pre-wrap break-all", children: JSON.stringify(data, null, 2) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-brand-brown/60", children: "History-backed visualization (snapshots every ~10s). Includes latency percentiles & token/cost metrics when hybrid mode is active." })
  ] });
}
export {
  AIMetricsPage as default
};
//# sourceMappingURL=AIMetricsPage-C7EbhZyY.js.map

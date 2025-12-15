import { r as reactExports, j as jsxRuntimeExports, R as React } from "./motion-D9fZRtSt.js";
import { W as WorkflowPanel } from "./WorkflowPanel-DczOhPSj.js";
import { L as Link } from "./index-DlOecmR0.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
import "./icons-C4AMPM7L.js";
function dbg(...args) {
}
const BUILD_API_BASE = "http://localhost:4000";
function getApiBase() {
  try {
    if (typeof window !== "undefined" && window.__E2E__) {
      return window.__E2E_API_BASE != null ? window.__E2E_API_BASE : "";
    }
  } catch (e) {
  }
  return BUILD_API_BASE;
}
let API_BASE$1 = getApiBase();
try {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host && host !== "localhost" && /localhost:\d+$/i.test(API_BASE$1)) {
      API_BASE$1 = "";
    }
  }
} catch {
}
function withAuth$1(headers = {}) {
  const h = { ...headers };
  return h;
}
async function generateItinerary(prompt) {
  try {
    const res = await fetch(`${API_BASE$1}/api/ai/itinerary`, {
      method: "POST",
      headers: withAuth$1({ "Content-Type": "application/json" }),
      body: JSON.stringify({ prompt })
    });
    if (!res.ok) {
      let err = `Request failed (${res.status})`;
      try {
        const j = await res.json();
        err = j.error || err;
      } catch {
      }
      throw new Error(err);
    }
    const data = await res.json();
    return data.data;
  } catch (e) {
    if (e.name === "TypeError") {
      throw new Error("Network error – verify API is reachable");
    }
    throw e;
  }
}
function streamItinerary(prompt, { onEvent, onError, onDone, signal } = {}) {
  const url = new URL(`${API_BASE$1}/api/ai/itinerary/stream`);
  url.searchParams.set("prompt", prompt);
  const ctrl = new AbortController();
  if (signal) signal.addEventListener("abort", () => ctrl.abort(), { once: true });
  fetch(url.toString(), { signal: ctrl.signal, headers: withAuth$1({ "Accept": "text/event-stream" }) }).then(async (res) => {
    if (!res.ok) {
      let err = `Stream request failed (${res.status})`;
      try {
        const j = await res.json();
        err = j.error || err;
      } catch {
      }
      throw new Error(err);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx;
      while ((idx = buffer.indexOf("\n\n")) !== -1) {
        const chunk = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 2);
        if (!chunk) continue;
        const lines = chunk.split("\n");
        let event = "message";
        let data = "";
        for (const ln of lines) {
          if (ln.startsWith("event:")) event = ln.slice(6).trim();
          else if (ln.startsWith("data:")) data += ln.slice(5).trim();
        }
        if (data) {
          try {
            const parsed = JSON.parse(data);
            onEvent && onEvent({ event, data: parsed });
            if (event === "pricing") {
              try {
                window.dispatchEvent(new CustomEvent("colleco:draftPricing", { detail: { phase: "pricing" } }));
              } catch {
              }
            }
            if (event === "done") {
              onDone && onDone();
            }
          } catch (e) {
          }
        }
      }
    }
    onDone && onDone();
  }).catch((err) => {
    if (ctrl.signal.aborted) return;
    if (err && err.name === "TypeError") {
      onError && onError(new Error("Network error – streaming endpoint unreachable"));
    } else {
      onError && onError(err);
    }
  });
  return { cancel: () => ctrl.abort() };
}
async function refineItinerary(prompt, instructions) {
  const res = await fetch(`${API_BASE$1}/api/ai/itinerary/refine`, {
    method: "POST",
    headers: withAuth$1({ "Content-Type": "application/json" }),
    body: JSON.stringify({ prompt, instructions })
  });
  if (!res.ok) {
    let err = "Refine failed";
    try {
      const j = await res.json();
      err = j.error || err;
    } catch {
    }
    throw new Error(err);
  }
  const data = await res.json();
  return data.data;
}
async function parseFlightIntent(prompt) {
  const res = await fetch(`${API_BASE$1}/api/ai/flight`, {
    method: "POST",
    headers: withAuth$1({ "Content-Type": "application/json" }),
    body: JSON.stringify({ prompt })
  });
  if (!res.ok) {
    let err = "Flight intent failed";
    try {
      const j = await res.json();
      err = j.error || err;
    } catch {
    }
    throw new Error(err);
  }
  const data = await res.json();
  return data.data;
}
async function parseIntent(prompt) {
  const res = await fetch(`${API_BASE$1}/api/ai/intent`, {
    method: "POST",
    headers: withAuth$1({ "Content-Type": "application/json" }),
    body: JSON.stringify({ prompt })
  });
  if (!res.ok) {
    let err = "Intent parse failed";
    try {
      const j = await res.json();
      err = j.error || err;
    } catch {
    }
    throw new Error(err);
  }
  const data = await res.json();
  return data.data;
}
const API_BASE = "http://localhost:4000";
function withAuth(headers = {}) {
  const h = { ...headers };
  return h;
}
async function startSession(prompt) {
  const res = await fetch(`${API_BASE}/api/ai/session`, { method: "POST", headers: withAuth({ "Content-Type": "application/json" }), body: JSON.stringify({ prompt }) });
  if (!res.ok) {
    let e = "Session start failed";
    try {
      const j = await res.json();
      e = j.error || e;
    } catch {
    }
    throw new Error(e);
  }
  return res.json();
}
async function refineSession(id, instructions) {
  const res = await fetch(`${API_BASE}/api/ai/session/${id}/refine`, { method: "POST", headers: withAuth({ "Content-Type": "application/json" }), body: JSON.stringify({ instructions }) });
  if (!res.ok) {
    let e = "Session refine failed";
    try {
      const j = await res.json();
      e = j.error || e;
    } catch {
    }
    throw new Error(e);
  }
  const data = await res.json();
  return data.data;
}
async function uploadDraft(prompt, data) {
  const res = await fetch(`${API_BASE}/api/ai/draft`, { method: "POST", headers: withAuth({ "Content-Type": "application/json" }), body: JSON.stringify({ prompt, data }) });
  if (!res.ok) {
    let e = "Upload failed";
    try {
      const j = await res.json();
      e = j.error || e;
    } catch {
    }
    throw new Error(e);
  }
  return res.json();
}
async function fetchSession(id) {
  const res = await fetch(`${API_BASE}/api/ai/session/${id}`, { headers: withAuth() });
  if (!res.ok) {
    let e = "Fetch session failed";
    try {
      const j = await res.json();
      e = j.error || e;
    } catch {
    }
    throw new Error(e);
  }
  return res.json();
}
function AIGeneratorPanel() {
  const [prompt, setPrompt] = reactExports.useState(() => {
    try {
      const saved = localStorage.getItem("colleco.lastAIPrompt");
      return saved || "Family trip to Rome and Florence for 6 nights in June, 2 adults 1 child, budget $4000, love food and history";
    } catch {
      return "Family trip to Rome and Florence for 6 nights in June, 2 adults 1 child, budget $4000, love food and history";
    }
  });
  const [mode, setMode] = reactExports.useState("stream");
  const [phases, setPhases] = reactExports.useState({});
  const [fullData, setFullData] = reactExports.useState(null);
  const [error, setError] = reactExports.useState("");
  const [refineText, setRefineText] = reactExports.useState("");
  const [refining, setRefining] = reactExports.useState(false);
  const [applied, setApplied] = reactExports.useState(false);
  const [sessionId, setSessionId] = reactExports.useState(null);
  const [sessionMode, setSessionMode] = reactExports.useState(false);
  const [loading, setLoading] = reactExports.useState(false);
  const [active, setActive] = reactExports.useState(false);
  const [uploading, setUploading] = reactExports.useState(false);
  const [uploadedId, setUploadedId] = reactExports.useState(null);
  const [scoped, setScoped] = reactExports.useState(false);
  const [history, setHistory] = reactExports.useState([]);
  const [showDiff, setShowDiff] = reactExports.useState(false);
  const [flightIntent, setFlightIntent] = reactExports.useState(null);
  const [intents, setIntents] = reactExports.useState([]);
  const [, setLastOps] = reactExports.useState(null);
  const [opsUndo, setOpsUndo] = reactExports.useState([]);
  const abortRef = reactExports.useRef(null);
  const liveRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    try {
      if (prompt && prompt.trim()) localStorage.setItem("colleco.lastAIPrompt", prompt);
    } catch {
    }
  }, [prompt]);
  const liveMessage = reactExports.useCallback(() => {
    if (error) return `Error: ${error}`;
    if (loading && mode === "single") return "Generating draft";
    if (active && mode === "stream") {
      const done = phases.done;
      if (done) return "Generation complete";
      if (phases.pricing) return "Pricing phase received";
      if (phases.plan) return "Plan phase received";
      if (phases.parse) return "Parse phase received";
      return "Preparing draft…";
    }
    return "";
  }, [phases, error, loading, active, mode]);
  reactExports.useEffect(() => {
    if (liveRef.current) liveRef.current.textContent = liveMessage();
  }, [liveMessage]);
  function reset() {
    setPhases({});
    setFullData(null);
    setError("");
    setLoading(false);
    setActive(false);
    abortRef.current?.cancel();
    abortRef.current = null;
    setApplied(false);
    setSessionId(null);
    setUploadedId(null);
    setHistory([]);
    setShowDiff(false);
    setFlightIntent(null);
    setIntents([]);
    setLastOps(null);
    setOpsUndo([]);
  }
  async function handleSingle() {
    reset();
    if (!prompt.trim()) {
      setError("Prompt required");
      return;
    }
    setLoading(true);
    try {
      dbg("[AIGEN] handleSingle: sending generate request", { prompt: prompt && prompt.slice(0, 80) });
      const data = await generateItinerary(prompt.trim());
      dbg("[AIGEN] handleSingle: received data", data);
      setFullData(data);
      const parsePhase = baseFrom(data);
      dbg("[AIGEN] handleSingle: parsePhase", parsePhase);
      setPhases({ parse: parsePhase, plan: { itinerary: data.itinerary }, pricing: { pricing: data.pricing }, done: true });
      setActive(false);
    } catch (e) {
      setError(e.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  }
  function handleStream() {
    reset();
    if (!prompt.trim()) {
      setError("Prompt required");
      return;
    }
    parseIntent(prompt.trim()).then((r) => {
      if (r && Array.isArray(r.intents)) setIntents(r.intents);
    }).catch(() => {
    });
    parseFlightIntent(prompt.trim()).then(setFlightIntent).catch(() => {
    });
    setActive(true);
    const stream = streamItinerary(prompt.trim(), {
      onEvent: ({ event, data }) => {
        setPhases((prev) => {
          const next = { ...prev };
          if (event === "parse") next.parse = data;
          else if (event === "plan") next.plan = data;
          else if (event === "pricing") next.pricing = data;
          else if (event === "done") next.done = true;
          return next;
        });
        if (event === "done") setActive(false);
      },
      onError: (err) => {
        setError(err.message || "Stream failed");
        setActive(false);
      },
      onDone: () => {
        setActive(false);
      }
    });
    abortRef.current = stream;
  }
  function deepClonePhases(p) {
    try {
      return JSON.parse(JSON.stringify(p));
    } catch {
      return { ...p };
    }
  }
  function applyExtendShorten(nightsDelta) {
    setPhases((prev) => {
      if (!prev || !prev.plan || !prev.plan.itinerary) return prev;
      const snapshot = deepClonePhases(prev);
      setOpsUndo((stack) => [...stack, snapshot]);
      const next = deepClonePhases(prev);
      const currentNights = next.parse?.nights || next.plan.itinerary.length;
      let newNights = Math.max(1, currentNights + nightsDelta);
      if (next.parse) next.parse.nights = newNights;
      const days = [...next.plan.itinerary];
      if (newNights > days.length) {
        const toAdd = newNights - days.length;
        const last = days[days.length - 1] || { destination: next.parse?.destinations?.[0] || "Destination", activities: ["Leisure & exploration"] };
        for (let i = 0; i < toAdd; i++) {
          const dayNum = days.length + 1;
          const dest = last.destination || last.title?.replace(/^.*-\s*/, "") || "Destination";
          days.push({ day: dayNum, title: `Day ${dayNum} - ${dest}`, destination: dest, activities: [...last.activities || ["Leisure & exploration"]] });
        }
      } else if (newNights < days.length) {
        days.length = newNights;
      }
      next.plan.itinerary = days.map((d, idx) => ({ ...d, day: idx + 1, title: `Day ${idx + 1} - ${d.destination || d.title?.replace(/^.*-\s*/, "") || "Destination"}` }));
      return next;
    });
  }
  function applyBudgetAdjust(percent) {
    setPhases((prev) => {
      if (!prev || !prev.pricing || !prev.pricing.pricing) return prev;
      const snapshot = deepClonePhases(prev);
      setOpsUndo((stack) => [...stack, snapshot]);
      const next = deepClonePhases(prev);
      const scale = 1 + percent / 100;
      const p = next.pricing.pricing;
      if (p.total != null) p.total = Math.round(p.total * scale);
      if (p.breakdown) {
        Object.keys(p.breakdown).forEach((k) => {
          p.breakdown[k] = Math.round(p.breakdown[k] * scale);
        });
      }
      if (p.note) {
        p.note += percent >= 0 ? ` · increased by ${percent}%` : ` · decreased by ${Math.abs(percent)}%`;
      }
      return next;
    });
  }
  function applySwapDestination(from, to) {
    setPhases((prev) => {
      if (!prev || !prev.plan || !prev.plan.itinerary) return prev;
      const snapshot = deepClonePhases(prev);
      setOpsUndo((stack) => [...stack, snapshot]);
      const next = deepClonePhases(prev);
      if (next.parse && Array.isArray(next.parse.destinations)) {
        next.parse.destinations = next.parse.destinations.map((d) => d.toLowerCase() === String(from).toLowerCase() ? to : d);
      }
      const fromLc = String(from).toLowerCase();
      next.plan.itinerary = next.plan.itinerary.map((d, idx) => {
        const dest = (d.destination || d.title || "").toString();
        const isMatch = dest.toLowerCase() === fromLc || /-\s*.+$/.test(d.title || "") && d.title.replace(/^.*-\s*/, "").toLowerCase() === fromLc;
        const newDest = isMatch ? to : d.destination || d.title?.replace(/^.*-\s*/, "") || dest;
        return { ...d, day: idx + 1, destination: newDest, title: `Day ${idx + 1} - ${newDest}` };
      });
      return next;
    });
  }
  function applyItineraryOps(ops) {
    if (!ops || ops.length === 0) return;
    setLastOps(ops);
    for (const op of ops) {
      if (op.op === "extend") applyExtendShorten(+Math.abs(op.nightsDelta || 1));
      else if (op.op === "shorten") applyExtendShorten(-Math.abs(op.nightsDelta || 1));
      else if (op.op === "adjustBudget") applyBudgetAdjust(op.percent || 0);
      else if (op.op === "swapDestination" && op.from && op.to) applySwapDestination(op.from, op.to);
    }
    if (liveRef.current) {
      liveRef.current.textContent = `Applied ${ops.length} itinerary change${ops.length > 1 ? "s" : ""}.`;
      setTimeout(() => {
        if (liveRef.current) liveRef.current.textContent = "";
      }, 2500);
    }
  }
  function undoLastOps() {
    setOpsUndo((stack) => {
      if (!stack || stack.length === 0) return stack;
      const nextStack = stack.slice(0, -1);
      const snapshot = stack[stack.length - 1];
      setPhases(snapshot);
      if (liveRef.current) {
        liveRef.current.textContent = "Reverted last itinerary changes.";
        setTimeout(() => {
          if (liveRef.current) liveRef.current.textContent = "";
        }, 2e3);
      }
      return nextStack;
    });
  }
  function handleCancel() {
    abortRef.current?.cancel();
    setActive(false);
    setLoading(false);
  }
  async function handleRefine() {
    if (!fullData && !phases.parse) {
      setError("Generate first");
      return;
    }
    if (!refineText.trim()) {
      setError("Refine instructions required");
      return;
    }
    setRefining(true);
    setError("");
    try {
      let refined;
      if (sessionMode && sessionId) {
        refined = await refineSession(sessionId, refineText.trim());
        try {
          const full = await fetchSession(sessionId);
          setHistory(full.history || []);
        } catch {
        }
      } else {
        const basePrompt = prompt.trim();
        refined = await refineItinerary(basePrompt, refineText.trim());
      }
      setFullData(refined);
      setPhases({ parse: baseFrom(refined), plan: { itinerary: refined.itinerary }, pricing: { pricing: refined.pricing }, done: true });
      setRefineText("");
    } catch (e) {
      setError(e.message || "Refine failed");
    } finally {
      setRefining(false);
    }
  }
  async function handleStartSession() {
    if (!prompt.trim()) {
      setError("Prompt required");
      return;
    }
    try {
      const s = await startSession(prompt.trim());
      setSessionId(s.id);
      setSessionMode(true);
      setFullData(s.data);
      setPhases({ parse: baseFrom(s.data), plan: { itinerary: s.data.itinerary }, pricing: { pricing: s.data.pricing }, done: true });
      setScoped(!!s.scoped);
      setHistory([{ type: "parse", data: s.data, at: Date.now() }]);
      if (liveRef.current) {
        liveRef.current.textContent = "Session started";
        setTimeout(() => {
          if (liveRef.current) liveRef.current.textContent = "";
        }, 1500);
      }
    } catch (e) {
      setError(e.message || "Session failed");
    }
  }
  async function handleUploadDraft() {
    const data = fullData || phases.parse && phases.plan && phases.pricing && {
      ...phases.parse,
      itinerary: phases.plan.itinerary,
      pricing: phases.pricing.pricing
    };
    if (!data) {
      setError("Nothing to upload");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const r = await uploadDraft(prompt.trim(), data);
      setUploadedId(r.id);
      if (r.scoped) setScoped(true);
    } catch (e) {
      setError(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }
  function handleApply() {
    const data = fullData || phases.parse && phases.plan && phases.pricing && {
      ...phases.parse,
      itinerary: phases.plan.itinerary,
      pricing: phases.pricing.pricing
    };
    if (!data) {
      setError("Nothing to apply yet");
      return;
    }
    try {
      const draft = {
        appliedAt: Date.now(),
        sourcePrompt: prompt.trim(),
        itinerary: data.itinerary,
        meta: {
          nights: data.nights,
          destinations: data.destinations,
          interests: data.interests,
          budget: data.budget
        }
      };
      localStorage.setItem("aiItineraryDraft:v1", JSON.stringify(draft));
      setApplied(true);
      if (liveRef.current) {
        liveRef.current.textContent = "AI draft stored. Open Itinerary page to import.";
        setTimeout(() => {
          if (liveRef.current) liveRef.current.textContent = "";
        }, 3e3);
      }
    } catch (e) {
      setError("Failed to store draft");
    }
  }
  function formatCurrency(v, c) {
    return new Intl.NumberFormat(void 0, { style: "currency", currency: c || "USD" }).format(v);
  }
  function baseFrom(data) {
    if (!data || typeof data !== "object") return {};
    const nights = data.nights ?? (Array.isArray(data.itinerary) ? data.itinerary.length : void 0);
    const destinations = Array.isArray(data.destinations) ? data.destinations : Array.isArray(data.itinerary) ? data.itinerary.map((d) => d.destination || d.title?.replace(/^.*-\s*/, "")).filter(Boolean) : [];
    const interests = Array.isArray(data.interests) ? data.interests : [];
    const budget = data.budget ?? (data.pricing && data.pricing.total ? { amount: data.pricing.total, currency: data.pricing.currency || "USD" } : void 0);
    return { nights, destinations, interests, budget };
  }
  const parse = phases.parse;
  const plan = phases.plan;
  const pricing = phases.pricing;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ai-panel max-w-4xl mx-auto flex flex-col gap-4", "aria-labelledby": "aiGenHeading", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { id: "aiGenHeading", className: "text-2xl font-bold text-brand-brown", children: "Trip Assist" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-brown/80 leading-snug", children: "Describe your trip — budget, vibe, pace, must‑dos. You’ll get a draft with an outline and rough costs. See it build in steps or generate a single draft, then refine until it feels right." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(WorkflowPanel, { currentPage: "ai" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded border border-cream-border bg-cream p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold text-brand-brown mb-2", children: "Quick start ideas" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 overflow-x-auto pb-1 pr-1", children: [
        "Family-friendly Cape Town long weekend in June, 2 adults 2 kids, budget $2000, nature + beaches + penguins",
        "Romantic Italy 7 nights: Rome, Florence, Amalfi; foodie + history; mid-range; September",
        "Safari + beach 10 days: Kruger + Mauritius; 2 adults; July; budget $5000; photography + relaxation",
        "Backpacking Southeast Asia 14 days: Thailand + Vietnam; budget; nightlife + street food; hostels",
        "Wine and wildlife 5 nights: Stellenbosch + Cape Town; 4 adults; September; wineries + Table Mountain"
      ].map((s, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => setPrompt(s),
          className: "shrink-0 max-w-[22rem] text-left px-2 py-1 rounded border border-cream-border bg-cream-sand hover:bg-cream-hover text-[11px]",
          title: "Use this idea",
          children: s
        },
        idx
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex flex-col gap-1 text-sm font-medium text-brand-brown", children: [
      "Prompt",
      /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: prompt, onChange: (e) => setPrompt(e.target.value), rows: 4, className: "w-full p-2 rounded border border-cream-border bg-cream focus:outline-none focus:ring-2 focus:ring-brand-orange/40 text-sm resize-y" })
    ] }),
    intents && intents.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded border border-cream-border bg-cream-sand/60 p-3 text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold mb-1", children: [
        "Detected request",
        intents.length > 1 ? "s" : ""
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-2", children: intents.filter((i) => i.type !== "flight_search").map((i, idx) => {
        if (i.type === "hotel_search") {
          const href = `/plan-trip?category=Lodging${i.city ? `&city=${encodeURIComponent(i.city)}` : ""}${i.budget?.amount ? `&budget=${encodeURIComponent(i.budget.amount)}` : ""}${i.stars ? `&stars=${i.stars}` : ""}`;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Hotel search ",
              i.city ? `in ${i.city}` : "",
              " ",
              i.nights ? `· ${i.nights} nights` : ""
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href, className: "inline-flex items-center px-2 py-1 rounded bg-brand-orange text-white", children: "Find hotels" })
          ] }, idx);
        }
        if (i.type === "car_rental") {
          const href = `/plan-trip?category=Transport${i.pickupCity ? `&city=${encodeURIComponent(i.pickupCity)}` : ""}`;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Car hire ",
              i.pickupCity ? `in ${i.pickupCity}` : "",
              " ",
              i.pickupDate ? `· ${i.pickupDate}` : ""
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href, className: "inline-flex items-center px-2 py-1 rounded bg-brand-orange text-white", children: "Find cars" })
          ] }, idx);
        }
        if (i.type === "activity_search") {
          const href = `/plan-trip?category=Activity${i.city ? `&city=${encodeURIComponent(i.city)}` : ""}`;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Activities ",
              i.city ? `in ${i.city}` : "",
              " ",
              i.startDate ? `· ${i.startDate}` : ""
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href, className: "inline-flex items-center px-2 py-1 rounded bg-brand-orange text-white", children: "Find activities" })
          ] }, idx);
        }
        if (i.type === "dining_search") {
          const href = `/plan-trip?category=Dining${i.city ? `&city=${encodeURIComponent(i.city)}` : ""}${i.nearMe ? "&setLocation=1" : ""}`;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Dining ",
              i.city ? `in ${i.city}` : i.nearMe ? "near you" : "",
              " ",
              i.time ? `· ${i.time}` : ""
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href, className: "inline-flex items-center px-2 py-1 rounded bg-brand-orange text-white", children: "Find dining" })
          ] }, idx);
        }
        if (i.type === "transfer_request") {
          const href = `/plan-trip?category=Transport${i.city ? `&city=${encodeURIComponent(i.city)}` : ""}${i.nearMe ? "&setLocation=1" : ""}`;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Transfers ",
              i.city ? `in ${i.city}` : i.nearMe ? "near you" : "",
              " ",
              i.time ? `· ${i.time}` : ""
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href, className: "inline-flex items-center px-2 py-1 rounded bg-brand-orange text-white", children: "Find transfers" })
          ] }, idx);
        }
        if (i.type === "event_search") {
          const href = `/plan-trip?tab=events${i.city ? `&city=${encodeURIComponent(i.city)}` : ""}${i.nearMe ? "&setLocation=1" : ""}`;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Events ",
              i.city ? `in ${i.city}` : i.nearMe ? "near you" : "",
              " ",
              i.startDate ? `· from ${i.startDate}` : ""
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href, className: "inline-flex items-center px-2 py-1 rounded bg-brand-orange text-white", children: "Browse events" })
          ] }, idx);
        }
        if (i.type === "visa_help") {
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Visa help detected" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `/compliance`, className: "inline-flex items-center px-2 py-1 rounded bg-brand-brown text-white", children: "Open Compliance" })
          ] }, idx);
        }
        if (i.type === "insurance_help") {
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Insurance help detected" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `/compliance`, className: "inline-flex items-center px-2 py-1 rounded bg-brand-brown text-white", children: "Open Compliance" })
          ] }, idx);
        }
        if (i.type === "itinerary_ops") {
          const hasUndo = opsUndo.length > 0;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              "Itinerary adjustments detected (",
              i.ops?.length || 0,
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => applyItineraryOps(i.ops || []), className: "inline-flex items-center px-2 py-1 rounded bg-brand-brown text-white", children: "Apply now" }),
              hasUndo && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: undoLastOps, className: "text-brand-brown underline", children: "Undo" })
            ] })
          ] }, idx);
        }
        if (i.type === "quote_ops") {
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Quote action detected" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `/quotes/new`, className: "inline-flex items-center px-2 py-1 rounded bg-brand-brown text-white", children: "Open quotes" })
          ] }, idx);
        }
        return null;
      }) })
    ] }),
    flightIntent && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded border border-cream-border bg-cream-sand/60 p-3 text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold mb-1", children: "Detected flight request" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        "From: ",
        flightIntent.from?.city,
        " ",
        flightIntent.from?.code ? `(${flightIntent.from.code})` : ""
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        "To: ",
        flightIntent.to?.city,
        " ",
        flightIntent.to?.code ? `(${flightIntent.to.code})` : ""
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        "Date: ",
        flightIntent.date || "—",
        " ",
        flightIntent.time ? `at ${flightIntent.time}` : ""
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        "Passengers: ",
        flightIntent.pax,
        " · Cabin: ",
        flightIntent.cabin
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "a",
          {
            href: `/plan-trip?category=Flights&from=${encodeURIComponent(flightIntent.from?.code || flightIntent.from?.city || "")}&to=${encodeURIComponent(flightIntent.to?.code || flightIntent.to?.city || "")}&date=${encodeURIComponent(flightIntent.date || "")}&time=${encodeURIComponent(flightIntent.time || "")}&pax=${flightIntent.pax}&cabin=${encodeURIComponent(flightIntent.cabin)}`,
            className: "inline-flex items-center px-3 py-1.5 rounded bg-brand-orange text-white",
            children: "Search flights"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFlightIntent(null), className: "text-brand-brown underline", children: "Dismiss" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 bg-cream-sand px-3 py-1 rounded border border-cream-border text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Mode:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-1 cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "radio", name: "aimode", value: "stream", checked: mode === "stream", onChange: () => setMode("stream") }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Stream" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-1 cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "radio", name: "aimode", value: "single", checked: mode === "single", onChange: () => setMode("single") }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Single" })
        ] })
      ] }),
      mode === "single" && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleSingle, disabled: loading, className: "px-4 py-2 rounded bg-brand-orange text-white text-sm font-semibold hover:bg-brand-highlight disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed", children: loading ? "Generating…" : "Generate" }),
      mode === "stream" && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleStream, disabled: active, className: "px-4 py-2 rounded bg-brand-orange text-white text-sm font-semibold hover:bg-brand-highlight disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed", children: active ? "Streaming…" : "Start Stream" }),
      (active || loading) && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleCancel, className: "px-3 py-2 rounded bg-brand-brown text-white text-xs font-semibold hover:bg-brand-brown/80", children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: reset, className: "px-3 py-2 rounded border border-brand-brown text-brand-brown text-xs font-semibold hover:bg-cream-hover", children: "Clear" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleApply, disabled: applied || !(phases.plan && phases.pricing), className: "px-3 py-2 rounded bg-brand-brown text-white text-xs font-semibold disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed", children: applied ? "Saved" : "Save draft for Itinerary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleUploadDraft, disabled: uploading || uploadedId || !(phases.plan && phases.pricing), className: "px-3 py-2 rounded bg-brand-orange text-white text-xs font-semibold disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed", children: uploadedId ? "Uploaded" : "Upload Draft" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 ml-2 text-[11px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-1 cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: sessionMode, onChange: (e) => {
            if (!e.target.checked) {
              setSessionMode(false);
              setSessionId(null);
            } else {
              handleStartSession();
            }
          } }),
          " Session"
        ] }),
        sessionId && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-green-700 flex items-center gap-1", children: [
          "#",
          sessionId.slice(0, 6),
          " ",
          scoped && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { title: "Scoped to token", className: "inline-block text-[10px] px-1 py-0.5 rounded bg-brand-orange text-white", children: "LOCK" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 text-[11px] text-brand-brown/70", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mr-1", children: "Next:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/itinerary", className: "underline hover:text-brand-brown", children: "Open Itinerary to import draft" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, children: "•" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/plan-trip", className: "underline hover:text-brand-brown", children: "Open Trip Planner" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 w-full flex flex-col gap-2 bg-cream-sand/50 border border-cream-border rounded p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-semibold text-brand-brown flex items-center gap-2", children: [
        "Refine plan",
        refining && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "animate-pulse text-[10px] font-normal", children: "Refining…" }),
        sessionMode && sessionId && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] bg-brand-brown text-white px-1.5 py-0.5 rounded", children: "Session" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: refineText, onChange: (e) => setRefineText(e.target.value), placeholder: "e.g. slow the pace; add beach and 2 more nights; swap Florence for Venice", rows: 2, className: "w-full p-2 rounded border border-cream-border bg-cream focus:outline-none focus:ring-1 focus:ring-brand-orange/40 text-xs resize-y" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleRefine, disabled: refining || !refineText.trim(), className: "px-3 py-1.5 rounded bg-brand-orange text-white text-xs font-semibold disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed", children: "Refine" }),
        applied && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-green-700", children: "Stored draft ready to import." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-brand-brown/60", children: 'Tips: Keep it short and actionable — e.g., "add museum", "add 2 more nights", "swap to family‑friendly", "reduce budget by 10%".' }),
      uploadedId && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-green-700", children: [
        "Draft stored on server (id ",
        uploadedId,
        ")."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-live": "polite", "aria-atomic": "true", className: "sr-only", ref: liveRef }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { role: "alert", className: "bg-red-100 border border-red-300 text-red-800 px-3 py-2 rounded text-sm", children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "p-3 rounded border border-cream-border bg-cream-sand/40 flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-semibold text-sm mb-2 flex items-center gap-2", children: [
          "Parse ",
          parse ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-600", children: "✓" }) : active && mode === "stream" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "animate-pulse", children: "…" }) : null
        ] }),
        !parse && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-brand-brown/60", children: "Destinations, dates, travelers, budget, interests." }),
        parse && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Destinations:" }),
            " ",
            parse.destinations.join(", ") || "—"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Dates:" }),
            " ",
            parse.startDate || "?",
            " → ",
            parse.endDate || "?",
            " (",
            parse.nights,
            " nights)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Travelers:" }),
            parse.travelers?.adults != null ? `${parse.travelers.adults} adults` : "—",
            parse.travelers?.children ? `, ${parse.travelers.children} children` : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Budget:" }),
            " ",
            parse.budget.amount ? formatCurrency(parse.budget.amount, parse.budget.currency) : "n/a",
            " ",
            parse.budget.perPerson ? "(per person)" : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Interests:" }),
            " ",
            parse.interests.join(", ") || "—"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "p-3 rounded border border-cream-border bg-cream-sand/40 flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-semibold text-sm mb-2 flex items-center gap-2", children: [
          "Plan ",
          plan ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-600", children: "✓" }) : parse && active && mode === "stream" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "animate-pulse", children: "…" }) : null
        ] }),
        !plan && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-brand-brown/60", children: "Skeleton itinerary days & activities." }),
        plan && /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "text-xs list-decimal ml-4 space-y-1 max-h-60 overflow-auto pr-2", children: plan.itinerary.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
            d.title,
            ":"
          ] }),
          " ",
          d.activities.join("; ")
        ] }, d.day)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "p-3 rounded border border-cream-border bg-cream-sand/40 flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-semibold text-sm mb-2 flex items-center gap-2", children: [
          "Pricing ",
          pricing ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-600", children: "✓" }) : plan && active && mode === "stream" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "animate-pulse", children: "…" }) : null
        ] }),
        !pricing && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-brand-brown/60", children: "Rough heuristic estimate with scaling." }),
        pricing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Total:" }),
            " ",
            formatCurrency(pricing.pricing.total, pricing.pricing.currency)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: Object.entries(pricing.pricing.breakdown).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            k,
            ": ",
            formatCurrency(v, pricing.pricing.currency)
          ] }, k)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "italic text-[10px] text-brand-brown/70", children: pricing.pricing.note })
        ] })
      ] })
    ] }),
    fullData && mode === "single" && /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "mt-2 text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer font-semibold", children: "Full JSON" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "bg-cream-sand border border-cream-border rounded p-2 overflow-auto max-h-72 whitespace-pre-wrap break-all", children: JSON.stringify(fullData, null, 2) })
    ] }),
    sessionMode && sessionId && history.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 border border-cream-border rounded p-3 bg-cream-sand/40", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-semibold flex items-center gap-2", children: [
          "Session History ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-normal text-brand-brown/60", children: [
            history.length,
            " snapshot",
            history.length > 1 ? "s" : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowDiff((d) => !d), className: "text-[11px] underline", children: showDiff ? "Hide Diff" : "Show Diff" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "text-[11px] space-y-1 max-h-48 overflow-auto pr-2", children: history.map((h, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex flex-col gap-0.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-1.5 py-0.5 rounded bg-brand-brown text-white text-[10px] uppercase", children: h.type }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-brand-brown/70", children: new Date(h.at).toLocaleTimeString() })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 text-[10px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Nights: ",
            h.data.nights
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Dests: ",
            h.data.destinations.length
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Interests: ",
            h.data.interests.length
          ] })
        ] })
      ] }, i)) }),
      showDiff && history.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(SessionDiff, { prev: history[history.length - 2].data, curr: history[history.length - 1].data })
    ] })
  ] });
}
function SessionDiff({ prev, curr }) {
  const addedInterests = curr.interests.filter((i) => !prev.interests.includes(i));
  const nightsDelta = curr.nights - prev.nights;
  const destDelta = curr.destinations.length - prev.destinations.length;
  const badge = (text) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block px-1.5 py-0.5 rounded bg-brand-orange text-white text-[10px] mr-1", children: text });
  const prevDays = (prev.itinerary || []).reduce((m, d) => {
    m[d.day] = d;
    return m;
  }, {});
  const currDays = (curr.itinerary || []).reduce((m, d) => {
    m[d.day] = d;
    return m;
  }, {});
  const dayAdds = Object.keys(currDays).filter((day) => !prevDays[day]);
  const dayRemovals = Object.keys(prevDays).filter((day) => !currDays[day]);
  const activityAdds = [];
  const activityRemovals = [];
  Object.keys(currDays).forEach((day) => {
    if (prevDays[day]) {
      const prevActs = new Set(prevDays[day].activities || []);
      const currActs = new Set(currDays[day].activities || []);
      for (const a of currActs) {
        if (!prevActs.has(a)) activityAdds.push({ day, a });
      }
      for (const a of prevActs) {
        if (!currActs.has(a)) activityRemovals.push({ day, a });
      }
    }
  });
  const [expand, setExpand] = React.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 text-[11px] border-t border-cream-border pt-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold mb-1 flex items-center gap-2", children: "Last Change" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      nightsDelta !== 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        badge("NIGHTS"),
        " ",
        nightsDelta > 0 ? `+${nightsDelta}` : nightsDelta,
        " nights (prev ",
        prev.nights,
        " → ",
        curr.nights,
        ")"
      ] }),
      addedInterests.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        badge("INTERESTS"),
        " Added: ",
        addedInterests.join(", ")
      ] }),
      destDelta !== 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        badge("DESTS"),
        " ",
        destDelta > 0 ? `+${destDelta}` : destDelta,
        " destinations (count)"
      ] }),
      dayAdds.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        badge("DAY+"),
        " Added day(s): ",
        dayAdds.join(", ")
      ] }),
      dayRemovals.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        badge("DAY-"),
        " Removed day(s): ",
        dayRemovals.join(", ")
      ] }),
      activityAdds.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        badge("ACT+"),
        " ",
        activityAdds.slice(0, 4).map((x) => `D${x.day}:${x.a}`).join(", "),
        activityAdds.length > 4 ? "…" : ""
      ] }),
      activityRemovals.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        badge("ACT-"),
        " ",
        activityRemovals.slice(0, 4).map((x) => `D${x.day}:${x.a}`).join(", "),
        activityRemovals.length > 4 ? "…" : ""
      ] }),
      nightsDelta === 0 && addedInterests.length === 0 && destDelta === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "italic text-brand-brown/60", children: "No core field changes detected." })
    ] }),
    (activityAdds.length > 4 || activityRemovals.length > 4) && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setExpand((e) => !e), className: "mt-2 underline text-[10px]", children: expand ? "Hide full activity diff" : "Show full activity diff" }),
    expand && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 grid sm:grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold text-[10px] mb-1", children: [
          "Added Activities (",
          activityAdds.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-0.5 max-h-40 overflow-auto pr-1", children: activityAdds.map((x, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "truncate", children: [
          "D",
          x.day,
          ": ",
          x.a
        ] }, i)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold text-[10px] mb-1", children: [
          "Removed Activities (",
          activityRemovals.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-0.5 max-h-40 overflow-auto pr-1", children: activityRemovals.map((x, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "truncate", children: [
          "D",
          x.day,
          ": ",
          x.a
        ] }, i)) })
      ] })
    ] })
  ] });
}
function AIGeneratorPage() {
  reactExports.useEffect(() => {
    const prev = document.title;
    document.title = "Trip Assist | CollEco Travel";
    return () => {
      document.title = prev;
    };
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AIGeneratorPanel, {}) }) });
}
export {
  AIGeneratorPage as default
};
//# sourceMappingURL=AIGeneratorPage-DlAnS9gz.js.map

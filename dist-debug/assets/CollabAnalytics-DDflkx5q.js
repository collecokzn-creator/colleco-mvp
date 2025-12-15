import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { l as listThreads, e as computeAnalytics, R as ROLES } from "./index-DlOecmR0.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
import "./icons-C4AMPM7L.js";
function CollabAnalytics() {
  const [threads, setThreads] = reactExports.useState(() => listThreads());
  const [q, setQ] = reactExports.useState("");
  const [fromDate, setFromDate] = reactExports.useState("");
  const [toDate, setToDate] = reactExports.useState("");
  const [slaMins, setSlaMins] = reactExports.useState(60);
  reactExports.useEffect(() => {
    setThreads(listThreads());
  }, []);
  const filtered = reactExports.useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return threads;
    return threads.filter((t) => `${t.ref} ${t.clientName} ${t.title}`.toLowerCase().includes(term));
  }, [threads, q]);
  const isInRange = reactExports.useCallback((ts) => {
    if (!ts) return false;
    const d = new Date(ts);
    if (fromDate) {
      const f = /* @__PURE__ */ new Date(fromDate + "T00:00:00");
      if (d < f) return false;
    }
    if (toDate) {
      const t = /* @__PURE__ */ new Date(toDate + "T23:59:59");
      if (d > t) return false;
    }
    return true;
  }, [fromDate, toDate]);
  const aggregate = reactExports.useMemo(() => {
    const totals = {
      totalThreads: 0,
      totalMessages: 0,
      totalAttachments: 0,
      channelCounts: {},
      avgResponseByRole: {},
      awaitingCounts: {},
      bottlenecks: [],
      dailyCounts: {}
    };
    const roleSums = {};
    const roleCounts = {};
    for (const t of filtered) {
      const msgs = (t.messages || []).filter((m) => isInRange(m.createdAt));
      const atts = (t.attachments || []).filter((a) => isInRange(a.addedAt));
      if (msgs.length === 0 && atts.length === 0) continue;
      totals.totalThreads += 1;
      totals.totalMessages += msgs.length;
      totals.totalAttachments += atts.length;
      for (const m of msgs) {
        totals.channelCounts[m.channel] = (totals.channelCounts[m.channel] || 0) + 1;
      }
      const sorted = msgs.slice().sort((a, b) => a.createdAt - b.createdAt);
      const responseTimes = {};
      let prevBy = null, prevAt = null;
      for (const m of sorted) {
        if (prevBy && m.authorRole !== prevBy && prevAt) {
          const diff = Math.max(0, Math.round((m.createdAt - prevAt) / 6e4));
          (responseTimes[m.authorRole] = responseTimes[m.authorRole] || []).push(diff);
        }
        prevBy = m.authorRole;
        prevAt = m.createdAt;
      }
      const avgInThread = Object.fromEntries(Object.entries(responseTimes).map(([r, diffs]) => [r, Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length)]));
      for (const [r, v] of Object.entries(avgInThread)) {
        roleSums[r] = (roleSums[r] || 0) + v;
        roleCounts[r] = (roleCounts[r] || 0) + 1;
      }
      const overall = computeAnalytics(t);
      for (const r of overall.awaiting || []) {
        totals.awaitingCounts[r] = (totals.awaitingCounts[r] || 0) + 1;
      }
      const allMsgs = (t.messages || []).slice().sort((x, y) => x.createdAt - y.createdAt);
      if (allMsgs.length) {
        const last = allMsgs[allMsgs.length - 1];
        const ageMin = Math.round((Date.now() - last.createdAt) / 6e4);
        totals.bottlenecks.push({ bookingId: t.bookingId, ref: t.ref, title: t.title, clientName: t.clientName, ageMin, awaiting: overall.awaiting });
      }
      for (const m of msgs) {
        const day = new Date(m.createdAt).toISOString().slice(0, 10);
        totals.dailyCounts[day] = (totals.dailyCounts[day] || 0) + 1;
      }
    }
    for (const r of Object.keys(roleSums)) {
      totals.avgResponseByRole[r] = Math.round(roleSums[r] / Math.max(1, roleCounts[r]));
    }
    totals.bottlenecks.sort((x, y) => y.ageMin - x.ageMin);
    return totals;
  }, [filtered, isInRange]);
  const roleLabel = (r) => r === ROLES.agent ? "Agent" : r === ROLES.client ? "Client" : r === ROLES.productOwner ? "Product Owner" : r;
  const exportCsv = () => {
    const rows = [
      ["bookingId", "ref", "title", "clientName", "messagesInRange", "attachmentsInRange", "lastMsgAgeMin", "awaiting", "avgRespAgent", "avgRespClient", "avgRespPO", "inapp", "whatsapp", "email", "sms", "call", "note"]
    ];
    aggregate.dailyCounts;
    for (const t of filtered) {
      const msgs = (t.messages || []).filter((m) => isInRange(m.createdAt));
      const atts = (t.attachments || []).filter((a2) => isInRange(a2.addedAt));
      if (msgs.length === 0 && atts.length === 0) continue;
      const sorted = msgs.slice().sort((a2, b) => a2.createdAt - b.createdAt);
      const responseTimes = {};
      let prevBy = null, prevAt = null;
      for (const m of sorted) {
        if (prevBy && m.authorRole !== prevBy && prevAt) {
          const diff = Math.max(0, Math.round((m.createdAt - prevAt) / 6e4));
          (responseTimes[m.authorRole] = responseTimes[m.authorRole] || []).push(diff);
        }
        prevBy = m.authorRole;
        prevAt = m.createdAt;
      }
      const avg = Object.fromEntries(Object.entries(responseTimes).map(([r, diffs]) => [r, Math.round(diffs.reduce((a2, b) => a2 + b, 0) / diffs.length)]));
      const overall = computeAnalytics(t);
      const allMsgs = (t.messages || []).slice().sort((x, y) => x.createdAt - y.createdAt);
      const lastAge = allMsgs.length ? Math.round((Date.now() - allMsgs[allMsgs.length - 1].createdAt) / 6e4) : "";
      const ch = msgs.reduce((acc, m) => (acc[m.channel] = (acc[m.channel] || 0) + 1, acc), {});
      rows.push([
        t.bookingId,
        t.ref,
        t.title,
        t.clientName,
        msgs.length,
        atts.length,
        lastAge,
        (overall.awaiting || []).join("|"),
        avg[ROLES.agent] || "",
        avg[ROLES.client] || "",
        avg[ROLES.productOwner] || "",
        ch["in-app"] || 0,
        ch["whatsapp"] || 0,
        ch["email"] || 0,
        ch["sms"] || 0,
        ch["call"] || 0,
        ch["note"] || 0
      ]);
    }
    const csv = rows.map((r) => r.map((v) => typeof v === "string" ? '"' + v.replaceAll('"', '""') + '"' : v).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `collab-analytics-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold text-brand-brown", children: "Collaboration Analytics" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            className: "border rounded px-3 py-1.5 bg-cream hover:bg-cream-hover w-56",
            placeholder: "Search by ref, client, title",
            value: q,
            onChange: (e) => setQ(e.target.value)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", className: "border rounded px-2 py-1.5", value: fromDate, onChange: (e) => setFromDate(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-brand-brown/60", children: "to" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", className: "border rounded px-2 py-1.5", value: toDate, onChange: (e) => setToDate(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-brand-brown/70", children: "SLA (mins)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: "1", className: "w-20 border rounded px-2 py-1.5", value: slaMins, onChange: (e) => setSlaMins(Number(e.target.value) || 0) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: exportCsv, className: "px-3 py-1.5 rounded bg-brand-orange text-white hover:bg-brand-highlight", children: "Export CSV" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Active Threads", value: aggregate.totalThreads }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Messages", value: aggregate.totalMessages }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Attachments", value: aggregate.totalAttachments })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded border border-cream-border p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-brand-brown mb-2", children: "Daily Messages Trend" }),
      Object.keys(aggregate.dailyCounts).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-brand-brown/60", children: "No messages in selected range." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: Object.entries(aggregate.dailyCounts).sort(([a], [b]) => a.localeCompare(b)).map(([day, count]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-24 text-xs text-brand-brown/70", children: day }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 bg-cream h-3 rounded", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-brand-orange h-3 rounded", style: { width: `${Math.min(100, count / Math.max(1, Math.max(...Object.values(aggregate.dailyCounts))) * 100)}%` } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 text-xs text-brand-brown/70 text-right", children: count })
      ] }, day)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-cream rounded border border-cream-border p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-brand-brown mb-2", children: "Average Response (mins) by Role" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "text-sm text-brand-brown space-y-1", children: Object.keys(aggregate.avgResponseByRole).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-brand-brown/60", children: "No data yet." }) : Object.entries(aggregate.avgResponseByRole).map(([r, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between border-b border-cream-border py-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: roleLabel(r) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            v,
            "m"
          ] })
        ] }, r)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-cream rounded border border-cream-border p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-brand-brown mb-2", children: "Messages by Channel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "text-sm text-brand-brown space-y-1", children: Object.keys(aggregate.channelCounts).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-brand-brown/60", children: "No messages yet." }) : Object.entries(aggregate.channelCounts).map(([c, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between border-b border-cream-border py-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize", children: c }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: v })
        ] }, c)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded border border-cream-border p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-brand-brown mb-2", children: "Awaiting Response" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "text-sm text-brand-brown space-y-1", children: Object.keys(aggregate.awaitingCounts).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-brand-brown/60", children: "All clear." }) : Object.entries(aggregate.awaitingCounts).map(([r, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between border-b border-cream-border py-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: roleLabel(r) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            v,
            " thread(s)"
          ] })
        ] }, r)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded border border-cream-border p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-brand-brown mb-2", children: "Top Bottlenecks" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "text-sm text-brand-brown space-y-2", children: aggregate.bottlenecks.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-brand-brown/60", children: "No bottlenecks detected." }) : aggregate.bottlenecks.slice(0, 5).map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: `border-b border-cream-border pb-2 ${b.ageMin > slaMins ? "bg-red-50" : ""}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium", children: [
            b.title,
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-brand-brown/60", children: [
              "(",
              b.ref,
              ")"
            ] }),
            b.ageMin > slaMins ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-xs text-red-700", children: "SLA breached" }) : null
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-brand-brown/70", children: b.clientName }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-brand-brown/70 mt-1", children: [
            "Last message: ",
            b.ageMin,
            "m ago"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-brand-brown/70", children: [
            "Awaiting: ",
            b.awaiting?.length ? b.awaiting.map(roleLabel).join(", ") : "-"
          ] })
        ] }, b.bookingId)) })
      ] })
    ] })
  ] });
}
function StatCard({ label, value }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded border border-cream-border p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-brand-brown/70 text-sm", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-semibold text-brand-brown", children: value })
  ] });
}
export {
  CollabAnalytics as default
};
//# sourceMappingURL=CollabAnalytics-DDflkx5q.js.map

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { listThreads, computeAnalytics, ROLES } from "../utils/collabStore";

export default function CollabAnalytics() {
  const [threads, setThreads] = useState(() => listThreads());
  const [q, setQ] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [slaMins, setSlaMins] = useState(60);

  useEffect(() => {
    // Refresh from storage (stateless aggregation)
    setThreads(listThreads());
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return threads;
    return threads.filter(t => `${t.ref} ${t.clientName} ${t.title}`.toLowerCase().includes(term));
  }, [threads, q]);

  const isInRange = useCallback((ts) => {
    if (!ts) return false;
    const d = new Date(ts);
    if (fromDate) {
      const f = new Date(fromDate + "T00:00:00");
      if (d < f) return false;
    }
    if (toDate) {
      const t = new Date(toDate + "T23:59:59");
      if (d > t) return false;
    }
    return true;
  }, [fromDate, toDate]);

  const aggregate = useMemo(() => {
    const totals = {
      totalThreads: 0,
      totalMessages: 0,
      totalAttachments: 0,
      channelCounts: {},
      avgResponseByRole: {},
      awaitingCounts: {},
      bottlenecks: [],
      dailyCounts: {},
    };

    // For simple averages, average per-thread averages (demo-friendly)
    const roleSums = {}; // role -> sum of per-thread avg
    const roleCounts = {}; // role -> threads counted

    for (const t of filtered) {
      const msgs = (t.messages || []).filter(m => isInRange(m.createdAt));
      const atts = (t.attachments || []).filter(a => isInRange(a.addedAt));
      if (msgs.length === 0 && atts.length === 0) continue; // exclude threads with nothing in range
      totals.totalThreads += 1;
      totals.totalMessages += msgs.length;
      totals.totalAttachments += atts.length;

      // Channels in range
      for (const m of msgs) {
        totals.channelCounts[m.channel] = (totals.channelCounts[m.channel] || 0) + 1;
      }

      // Avg response by role (replies in range)
      const sorted = msgs.slice().sort((a, b) => a.createdAt - b.createdAt);
      const responseTimes = {}; // role -> [mins]
      let prevBy = null, prevAt = null;
      for (const m of sorted) {
        if (prevBy && m.authorRole !== prevBy && prevAt) {
          const diff = Math.max(0, Math.round((m.createdAt - prevAt) / 60000));
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

      // Awaiting based on overall analytics (not range-limited) so it reflects current state
      const overall = computeAnalytics(t);
      for (const r of overall.awaiting || []) {
        totals.awaitingCounts[r] = (totals.awaitingCounts[r] || 0) + 1;
      }

      // Bottleneck heuristic: time since last message
      const allMsgs = (t.messages || []).slice().sort((x, y) => x.createdAt - y.createdAt);
      if (allMsgs.length) {
        const last = allMsgs[allMsgs.length - 1];
        const ageMin = Math.round((Date.now() - last.createdAt) / 60000);
        totals.bottlenecks.push({ bookingId: t.bookingId, ref: t.ref, title: t.title, clientName: t.clientName, ageMin, awaiting: overall.awaiting });
      }

      // Daily trend counts in range
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
    // Thread-level CSV aligned to current filters
    const rows = [
      ["bookingId","ref","title","clientName","messagesInRange","attachmentsInRange","lastMsgAgeMin","awaiting","avgRespAgent","avgRespClient","avgRespPO","inapp","whatsapp","email","sms","call","note"],
    ];
  const _days = aggregate.dailyCounts; // not per thread but okay; we keep per-thread core metrics
    for (const t of filtered) {
      const msgs = (t.messages || []).filter(m => isInRange(m.createdAt));
      const atts = (t.attachments || []).filter(a => isInRange(a.addedAt));
      if (msgs.length === 0 && atts.length === 0) continue;
      // per-thread avg as computed earlier (recompute quickly)
      const sorted = msgs.slice().sort((a, b) => a.createdAt - b.createdAt);
      const responseTimes = {};
      let prevBy = null, prevAt = null;
      for (const m of sorted) {
        if (prevBy && m.authorRole !== prevBy && prevAt) {
          const diff = Math.max(0, Math.round((m.createdAt - prevAt) / 60000));
          (responseTimes[m.authorRole] = responseTimes[m.authorRole] || []).push(diff);
        }
        prevBy = m.authorRole; prevAt = m.createdAt;
      }
      const avg = Object.fromEntries(Object.entries(responseTimes).map(([r, diffs]) => [r, Math.round(diffs.reduce((a,b)=>a+b,0)/diffs.length)]));
      const overall = computeAnalytics(t);
      const allMsgs = (t.messages || []).slice().sort((x, y) => x.createdAt - y.createdAt);
      const lastAge = allMsgs.length ? Math.round((Date.now() - allMsgs[allMsgs.length-1].createdAt)/60000) : "";
      const ch = msgs.reduce((acc, m) => (acc[m.channel]=(acc[m.channel]||0)+1, acc), {});
      rows.push([
        t.bookingId, t.ref, t.title, t.clientName,
        msgs.length, atts.length, lastAge,
        (overall.awaiting||[]).join("|"),
        avg[ROLES.agent]||"", avg[ROLES.client]||"", avg[ROLES.productOwner]||"",
        ch["in-app"]||0, ch["whatsapp"]||0, ch["email"]||0, ch["sms"]||0, ch["call"]||0, ch["note"]||0,
      ]);
    }
    const csv = rows.map(r => r.map(v => typeof v === "string" ? '"'+v.replaceAll('"','""')+'"' : v).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `collab-analytics-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-brand-brown">Collaboration Analytics</h1>
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="border rounded px-3 py-1.5 bg-cream hover:bg-cream-hover w-56"
            placeholder="Search by ref, client, title"
            value={q}
            onChange={e=>setQ(e.target.value)}
          />
          <input type="date" className="border rounded px-2 py-1.5" value={fromDate} onChange={e=>setFromDate(e.target.value)} />
          <span className="text-brand-brown/60">to</span>
          <input type="date" className="border rounded px-2 py-1.5" value={toDate} onChange={e=>setToDate(e.target.value)} />
          <div className="flex items-center gap-1">
            <span className="text-sm text-brand-brown/70">SLA (mins)</span>
            <input type="number" min="1" className="w-20 border rounded px-2 py-1.5" value={slaMins} onChange={e=>setSlaMins(Number(e.target.value)||0)} />
          </div>
          <button onClick={exportCsv} className="px-3 py-1.5 rounded bg-brand-orange text-white hover:opacity-95">Export CSV</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Active Threads" value={aggregate.totalThreads} />
        <StatCard label="Messages" value={aggregate.totalMessages} />
        <StatCard label="Attachments" value={aggregate.totalAttachments} />
      </div>

      {/* Trendline */}
      <div className="bg-white rounded border border-cream-border p-4">
        <h2 className="font-semibold text-brand-brown mb-2">Daily Messages Trend</h2>
        {Object.keys(aggregate.dailyCounts).length === 0 ? (
          <div className="text-sm text-brand-brown/60">No messages in selected range.</div>
        ) : (
          <div className="space-y-1">
            {Object.entries(aggregate.dailyCounts).sort(([a],[b]) => a.localeCompare(b)).map(([day, count]) => (
              <div key={day} className="flex items-center gap-2">
                <div className="w-24 text-xs text-brand-brown/70">{day}</div>
                <div className="flex-1 bg-cream h-3 rounded">
                  <div className="bg-brand-orange h-3 rounded" style={{ width: `${Math.min(100, (count/Math.max(1, Math.max(...Object.values(aggregate.dailyCounts))))*100)}%` }} />
                </div>
                <div className="w-10 text-xs text-brand-brown/70 text-right">{count}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-cream rounded border border-cream-border p-4">
          <h2 className="font-semibold text-brand-brown mb-2">Average Response (mins) by Role</h2>
          <ul className="text-sm text-brand-brown space-y-1">
            {Object.keys(aggregate.avgResponseByRole).length === 0 ? (
              <li className="text-brand-brown/60">No data yet.</li>
            ) : (
              Object.entries(aggregate.avgResponseByRole).map(([r, v]) => (
                <li key={r} className="flex items-center justify-between border-b border-cream-border py-1">
                  <span>{roleLabel(r)}</span>
                  <span>{v}m</span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="bg-cream rounded border border-cream-border p-4">
          <h2 className="font-semibold text-brand-brown mb-2">Messages by Channel</h2>
          <ul className="text-sm text-brand-brown space-y-1">
            {Object.keys(aggregate.channelCounts).length === 0 ? (
              <li className="text-brand-brown/60">No messages yet.</li>
            ) : (
              Object.entries(aggregate.channelCounts).map(([c, v]) => (
                <li key={c} className="flex items-center justify-between border-b border-cream-border py-1">
                  <span className="capitalize">{c}</span>
                  <span>{v}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded border border-cream-border p-4">
          <h2 className="font-semibold text-brand-brown mb-2">Awaiting Response</h2>
          <ul className="text-sm text-brand-brown space-y-1">
            {Object.keys(aggregate.awaitingCounts).length === 0 ? (
              <li className="text-brand-brown/60">All clear.</li>
            ) : (
              Object.entries(aggregate.awaitingCounts).map(([r, v]) => (
                <li key={r} className="flex items-center justify-between border-b border-cream-border py-1">
                  <span>{roleLabel(r)}</span>
                  <span>{v} thread(s)</span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="bg-white rounded border border-cream-border p-4">
          <h2 className="font-semibold text-brand-brown mb-2">Top Bottlenecks</h2>
          <ul className="text-sm text-brand-brown space-y-2">
            {aggregate.bottlenecks.length === 0 ? (
              <li className="text-brand-brown/60">No bottlenecks detected.</li>
            ) : (
              aggregate.bottlenecks.slice(0, 5).map(b => (
                <li key={b.bookingId} className={`border-b border-cream-border pb-2 ${b.ageMin > slaMins ? "bg-red-50" : ""}`}>
                  <div className="font-medium">
                    {b.title} <span className="text-brand-brown/60">({b.ref})</span>
                    {b.ageMin > slaMins ? <span className="ml-2 text-xs text-red-700">SLA breached</span> : null}
                  </div>
                  <div className="text-xs text-brand-brown/70">{b.clientName}</div>
                  <div className="text-xs text-brand-brown/70 mt-1">Last message: {b.ageMin}m ago</div>
                  <div className="text-xs text-brand-brown/70">Awaiting: {b.awaiting?.length ? b.awaiting.map(roleLabel).join(", ") : "-"}</div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded border border-cream-border p-4">
      <div className="text-brand-brown/70 text-sm">{label}</div>
      <div className="text-2xl font-semibold text-brand-brown">{value}</div>
    </div>
  );
}

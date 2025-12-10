import React, { useEffect, useMemo, useState } from "react";
import { mockBookings } from "../mockData";
import {
  addAttachment as addLocalAttachment,
  CHANNELS,
  computeAnalytics,
  listThreads as listLocalThreads,
  loadThreads,
  markRead as markLocalRead,
  postMessage as postLocalMessage,
  ROLES,
  seedFromBookings,
  summarizeThread,
  onCollabEvent,
} from "../utils/collabStore";
import { simulateInboundWhatsApp } from "../utils/whatsappStub";
import { notify } from "../utils/notify";
import { listThreads as apiList, postMessage as apiPost, postAttachment as apiAttach, whatsappInbound as apiWhatsApp, markRead as apiMarkRead, isApiEnabled } from "../api/collabApi";

const roleOptions = [
  { value: ROLES.agent, label: "Agent" },
  { value: ROLES.client, label: "Client" },
  { value: ROLES.productOwner, label: "Product Owner" },
];

function RoleBadge({ role }) {
  const map = {
    [ROLES.agent]: "bg-brand-orange/10 text-brand-brown border border-brand-orange/30",
    [ROLES.client]: "bg-cream-hover text-brand-brown border border-cream-border",
    [ROLES.productOwner]: "bg-amber-50 text-amber-800 border border-amber-300",
    [ROLES.system]: "bg-gray-100 text-gray-700 border border-gray-200",
  };
  const label = roleOptions.find(r => r.value === role)?.label || role;
  return <span className={`px-2 py-0.5 rounded text-xs ${map[role]}`}>{label}</span>;
}

function ChannelTag({ channel }) {
  const map = {
    [CHANNELS.inapp]: { cls: "bg-emerald-50 text-emerald-700", label: "In-App" },
    [CHANNELS.whatsapp]: { cls: "bg-green-50 text-green-700", label: "WhatsApp" },
    [CHANNELS.email]: { cls: "bg-blue-50 text-blue-700", label: "Email" },
    [CHANNELS.sms]: { cls: "bg-purple-50 text-purple-700", label: "SMS" },
    [CHANNELS.call]: { cls: "bg-gray-50 text-gray-700", label: "Call" },
    [CHANNELS.note]: { cls: "bg-yellow-50 text-yellow-700", label: "Note" },
  };
  const it = map[channel] || { cls: "bg-gray-50 text-gray-700", label: channel };
  return <span className={`px-2 py-0.5 rounded text-xs border ${it.cls}`}>{it.label}</span>;
}

export default function Collaboration() {
  const [currentRole, setCurrentRole] = useState(() => localStorage.getItem("collabRole") || ROLES.agent);
  const [bookingId, setBookingId] = useState(null);
  const [threads, setThreads] = useState([]);
  const [message, setMessage] = useState("");
  const [visibility, setVisibility] = useState("all");
  const [channel, setChannel] = useState(CHANNELS.inapp);
  const [mention, setMention] = useState("");
  const [recState, setRecState] = useState({ recording: false, mediaRecorder: null, chunks: [] });
  const [autoSync, setAutoSync] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Initial load + reload on role change
  useEffect(() => {
    (async () => {
      if (isApiEnabled) {
        try {
          const list = await apiList(currentRole);
          setThreads(list);
        } catch (e) {
          console.warn("API list failed, falling back to local", e);
          ensureLocalSeed();
        }
      } else {
        ensureLocalSeed();
      }
    })();
  }, [currentRole]);

  function ensureLocalSeed() {
    if (!Object.keys(loadThreads()).length) {
      seedFromBookings(mockBookings);
    }
    setThreads(listLocalThreads());
  }

  // SSE subscription in API mode
  // Subscribe based on `currentRole` and API availability
  useEffect(() => {
    if (!isApiEnabled) return undefined;
    let es;
    try {
      const base = (import.meta.env.VITE_API_BASE || "");
      const url = new URL(base + "/events");
      url.searchParams.set("role", currentRole);
      if (import.meta.env.VITE_API_TOKEN) url.searchParams.set("token", import.meta.env.VITE_API_TOKEN);
      es = new EventSource(url.toString());
      es.addEventListener("hello", () => {/* noop */});
      const refresh = async () => { try { const list = await apiList(currentRole); setThreads(list); } catch {} };
      es.addEventListener("message", refresh);
      es.addEventListener("attachment", refresh);
      es.addEventListener("read", refresh);
    } catch {}
    return () => { try { es?.close(); } catch {} };
  }, [currentRole, isApiEnabled]);

  // Ensure selection reacts to threads list and current bookingId
  useEffect(() => {
    if (bookingId == null && threads.length) setBookingId(threads[0].bookingId);
  }, [threads, bookingId]);

  const thread = useMemo(() => threads.find(t => t.bookingId === bookingId), [threads, bookingId]);
  const analytics = useMemo(() => computeAnalytics(thread), [thread]);
  const summary = useMemo(() => summarizeThread(thread), [thread]);

  // Mark read for current thread; only depends on thread and currentRole
  useEffect(() => {
    if (!thread) return;
    (async () => {
      try {
        if (isApiEnabled) await apiMarkRead(thread.bookingId, currentRole);
        else markLocalRead(thread.bookingId, currentRole);
      } catch {}
    })();
  }, [thread, currentRole]);

  // Notifications and local event bus only in local mode
  useEffect(() => {
    if (!thread) return undefined;
    if (!isApiEnabled) {
      const unsub = onCollabEvent(({ event, payload }) => {
        if (!thread || payload?.bookingId !== thread.bookingId) return;
        if (event === "message") {
          const m = payload.message;
          if (m.authorRole !== currentRole) {
            notify(currentRole, `New ${m.channel} message`, m.content?.slice(0, 120) || "");
          }
          setThreads(listLocalThreads());
        }
        if (event === "attachment") {
          setThreads(listLocalThreads());
        }
      });
      try { if ("Notification" in window) Notification.requestPermission?.(); } catch {}
      return () => { try { unsub?.(); } catch {} };
    }
    return undefined;
  }, [thread, currentRole]);

  // Auto-simulate WhatsApp replies
  useEffect(() => {
    if (!autoSync || !thread) return;
    const id = setInterval(async () => {
      if (isApiEnabled) {
        try { await apiWhatsApp({ bookingId: thread.bookingId, fromName: "Client", content: "(Auto) WhatsApp: confirmed, thanks!" });
          const list = await apiList(currentRole); setThreads(list);
        } catch {}
      } else {
        simulateInboundWhatsApp({ bookingId: thread.bookingId, content: "(Auto) WhatsApp: confirmed, thanks!" });
        setThreads(listLocalThreads());
      }
    }, 12000);
    return () => clearInterval(id);
  }, [autoSync, thread, currentRole]);

  async function send() {
    const content = message.trim();
    if (!content || !thread) return;
    const mentions = mention ? [mention] : [];
    const payload = {
      authorRole: currentRole,
      authorName: roleOptions.find(r => r.value === currentRole)?.label,
      content,
      channel,
      mentions,
      visibility,
    };
    try {
      if (isApiEnabled) {
  await apiPost(thread.bookingId, payload);
  const list = await apiList(currentRole); setThreads(list);
      } else {
        postLocalMessage(thread.bookingId, payload);
        setThreads(listLocalThreads());
      }
    } finally {
      setMessage("");
      setMention("");
    }
  }

  async function handleAttach(e) {
    const f = e.target.files?.[0];
    if (!f || !thread) return;
    const meta = { name: f.name, size: f.size, type: f.type, byRole: currentRole, visibility };
    if (isApiEnabled) {
  await apiAttach(thread.bookingId, meta);
  const list = await apiList(currentRole); setThreads(list);
    } else {
      addLocalAttachment(thread.bookingId, meta);
      setThreads(listLocalThreads());
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const arrayBuffer = await blob.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        const size = bytes.byteLength;
        const url = URL.createObjectURL(blob);
        const name = `voice-note-${new Date().toISOString().replace(/[:.]/g, "-")}.webm`;
        if (isApiEnabled) {
          await apiAttach(thread.bookingId, { name, size, type: "audio/webm", byRole: currentRole, url, visibility });
          const list = await apiList(); setThreads(list);
        } else {
          addLocalAttachment(thread.bookingId, { name, size, type: "audio/webm", byRole: currentRole, url, visibility });
          setThreads(listLocalThreads());
        }
      };
      mediaRecorder.start();
      setRecState({ recording: true, mediaRecorder, chunks });
    } catch (e) {
      console.error("Recording failed", e);
    }
  }

  function stopRecording() {
    try {
      recState.mediaRecorder?.stop();
      setRecState({ recording: false, mediaRecorder: null, chunks: [] });
    } catch {}
  }

  // Simple role-based visibility filter for messages
  function visibleToMe(m) {
    if (m.visibility === "all") return true;
    if (m.visibility === "agent-client") return currentRole === ROLES.agent || currentRole === ROLES.client;
    if (m.visibility === "agent-po") return currentRole === ROLES.agent || currentRole === ROLES.productOwner;
    return true;
  }
  function attachmentVisibleToMe(a) { return visibleToMe(a); }

  return (
    <div className="overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-brand-brown">Collaboration Workspace</h1>
          <div className="flex flex-wrap items-center gap-3">
            <button 
              className="lg:hidden px-3 py-2 text-sm border border-cream-border rounded-md bg-white hover:bg-cream-hover" 
              onClick={()=>setSidebarOpen(s=>!s)}
            >
              {sidebarOpen? 'Hide' : 'Show'} Bookings
            </button>
            <select
              className="border border-cream-border rounded-md px-3 py-2 bg-white hover:bg-cream-hover focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
              value={currentRole}
              onChange={e => { setCurrentRole(e.target.value); localStorage.setItem("collabRole", e.target.value); }}
            >
              {roleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <RoleBadge role={currentRole} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Thread list */}
          {sidebarOpen && (
            <aside className="lg:col-span-3 bg-cream rounded-lg border border-cream-border shadow-sm">
              <div className="p-4 border-b border-cream-border font-medium text-brand-brown">Bookings</div>
              <ul className="max-h-[70vh] overflow-y-auto">
                {threads.map(t => (
                  <li key={t.bookingId}>
                    <button
                      onClick={() => setBookingId(t.bookingId)}
                      className={`w-full text-left px-4 py-3 hover:bg-cream-hover transition-colors ${bookingId===t.bookingId?"bg-cream-hover": ""}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-brand-brown truncate">{t.title}</div>
                          <div className="text-xs text-brand-brown/70 truncate">{t.ref} • {t.clientName}</div>
                        </div>
                        <div className="text-xs text-brand-brown/70 flex-shrink-0">
                          {t.unread?.[currentRole] ? <span className="inline-block min-w-5 text-center px-1.5 py-0.5 bg-brand-orange text-white rounded-full text-xs">{t.unread[currentRole]}</span> : null}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </aside>
          )}

          {/* Conversation */}
          <section className={`lg:col-span-6 bg-white rounded-lg border border-cream-border shadow-sm flex flex-col ${!sidebarOpen?'lg:col-span-9':''}`}>
            <div className="p-4 border-b border-cream-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-brand-brown truncate">{thread?.title || "Select a booking"}</div>
                  <div className="text-xs text-brand-brown/70 truncate">{thread?.ref} • {thread?.clientName} • Status: {thread?.status}</div>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-brand-brown/60 whitespace-nowrap">Visibility:</span>
                    <select className="border border-cream-border rounded px-2 py-1 text-xs bg-white hover:bg-cream-hover focus:outline-none focus:ring-1 focus:ring-brand-orange/30" value={visibility} onChange={e=>setVisibility(e.target.value)}>
                      <option value="all">All Participants</option>
                      <option value="agent-client">Agent + Client</option>
                      <option value="agent-po">Agent + Product Owner</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-brand-brown/60 whitespace-nowrap">Channel:</span>
                    <select className="border border-cream-border rounded px-2 py-1 text-xs bg-white hover:bg-cream-hover focus:outline-none focus:ring-1 focus:ring-brand-orange/30" value={channel} onChange={e=>setChannel(e.target.value)}>
                      <option value={CHANNELS.inapp}>In-App</option>
                      <option value={CHANNELS.whatsapp}>WhatsApp</option>
                      <option value={CHANNELS.email}>Email</option>
                      <option value={CHANNELS.sms}>SMS</option>
                      <option value={CHANNELS.note}>Note</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {(thread?.messages || []).filter(visibleToMe).map(m => (
              <div key={m.id} className={`max-w-[85%] ${m.authorRole===currentRole?"ml-auto":""}`}>
                <div className={`rounded px-3 py-2 border text-sm ${m.authorRole===ROLES.client?"bg-cream-hover border-cream-border":"bg-cream border-cream-border"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <RoleBadge role={m.authorRole} />
                    <ChannelTag channel={m.channel} />
                    {m.mentions?.length ? <span className="text-xs text-brand-brown/70">{m.mentions.map(x=>"@"+x).join(" ")}</span> : null}
                  </div>
                  <div className="whitespace-pre-wrap text-brand-brown">{m.content}</div>
                  <div className="text-[11px] text-brand-brown/60 mt-1">{new Date(m.createdAt).toLocaleString()}</div>
                </div>
              </div>
            ))}

            {/* Attachments */}
            {(thread?.attachments || []).filter(attachmentVisibleToMe).length ? (
              <div className="pt-2">
                <div className="text-xs font-medium text-brand-brown mb-1">Shared Documents</div>
                <ul className="space-y-1">
                  {thread.attachments.filter(attachmentVisibleToMe).map(a => (
                    <li key={a.id} className="text-sm text-brand-brown border-b border-cream-border py-1">
                      <div className="flex items-center justify-between gap-2">
                        <span>{a.name} <span className="text-brand-brown/60">({Math.ceil((a.size||0)/1024)} KB)</span></span>
                        <span className="text-xs text-brand-brown/60">by <RoleBadge role={a.byRole} /></span>
                      </div>
                      {a.type?.startsWith("audio/") && a.url ? (
                        <audio className="mt-1 w-full" controls src={a.url} />
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

            {/* Composer */}
            <div className="p-4 border-t border-cream-border sticky bottom-0 bg-white">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <input
                  className="flex-1 min-w-0 border border-cream-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                  placeholder="Write a message… use @client or @productOwner to mention"
                  value={message}
                  onChange={e=>setMessage(e.target.value)}
                />
                <select className="border border-cream-border rounded-md px-2 py-2 text-sm bg-white hover:bg-cream-hover focus:outline-none focus:ring-1 focus:ring-brand-orange/30" value={mention} onChange={e=>setMention(e.target.value)}>
                  <option value="">@Mention</option>
                  <option value="client">@client</option>
                  <option value="productOwner">@productOwner</option>
                </select>
                <label className="cursor-pointer px-3 py-2 text-sm border border-cream-border rounded-md bg-white hover:bg-cream-hover text-brand-brown transition-colors">
                  Attach
                  <input type="file" className="hidden" onChange={handleAttach} />
                </label>
                {!recState.recording ? (
                  <button onClick={startRecording} className="px-3 py-2 text-sm border border-cream-border rounded-md bg-white hover:bg-cream-hover text-brand-brown transition-colors">Record</button>
                ) : (
                  <button onClick={stopRecording} className="px-3 py-2 text-sm border border-red-600 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors">Stop</button>
                )}
                <button onClick={send} className="px-4 py-2 text-sm bg-brand-orange text-white rounded-md hover:bg-brand-brown transition-colors">Send</button>
              </div>
              <div className="text-xs text-brand-brown/60">
                WhatsApp/email sync is simulated. Replies via external channels appear in the timeline with their channel tag.
              </div>
            </div>
        </section>

          {/* Insights */}
          <aside className="lg:col-span-3 bg-cream rounded-lg border border-cream-border shadow-sm p-4 space-y-4">
            <div>
              <div className="font-medium text-brand-brown mb-2">AI Summary</div>
              <div className="text-sm text-brand-brown/80 leading-relaxed">{summary.summary}</div>
              {summary.bullets?.length ? (
                <ul className="list-disc list-inside text-sm text-brand-brown mt-3 space-y-1">
                  {summary.bullets.map((b,i)=>(<li key={i} className="leading-relaxed">{b}</li>))}
                </ul>
              ) : null}
            </div>

            <div className="border-t border-cream-border pt-4">
              <div className="font-medium text-brand-brown mb-3">Collaboration Analytics</div>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-brand-brown/70 mb-1">Average response time</div>
                  <ul className="text-sm text-brand-brown space-y-1">
                    {Object.entries(analytics.avgResponseMins || {}).map(([r, v]) => (
                      <li key={r} className="flex items-center justify-between py-1"><span><RoleBadge role={r} /></span><span className="font-medium">{v}m</span></li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs text-brand-brown/70 mb-1">Messages per channel</div>
                  <ul className="text-sm text-brand-brown space-y-1">
                    {Object.entries(analytics.channelCounts || {}).map(([c, v]) => (
                      <li key={c} className="flex items-center justify-between py-1"><span><ChannelTag channel={c} /></span><span className="font-medium">{v}</span></li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs text-brand-brown/70 mb-1">Awaiting response</div>
                  <div className="text-sm text-brand-brown flex flex-wrap gap-1">
                    {analytics.awaiting?.length ? analytics.awaiting.map((r,i)=>(<RoleBadge key={i} role={r} />)) : <span className="text-brand-brown/60">-</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-cream-border pt-4">
              <div className="font-medium text-brand-brown mb-3">Omnichannel & Push</div>
              <ul className="text-sm text-brand-brown/90 space-y-1.5 leading-relaxed">
                <li>• WhatsApp integration stub ready (webhook-style).</li>
                <li>• Email/SMS fallback simulated via channel tags.</li>
                <li>• Mobile push: add FCM/Expo later for alerts.</li>
                <li>• Open API hooks for Slack/Teams/CRM coming next.</li>
              </ul>
              <label className="mt-3 flex items-center gap-2 text-sm text-brand-brown cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={autoSync} 
                  onChange={e=>setAutoSync(e.target.checked)}
                  className="rounded border-cream-border focus:ring-2 focus:ring-brand-orange/30" 
                />
                <span>Auto-simulate WhatsApp replies</span>
              </label>
              <button
                onClick={() => { if(thread) { simulateInboundWhatsApp({ bookingId: thread.bookingId, content: "Replying from WhatsApp: looks good!" }); setThreads(listLocalThreads()); } }}
                className="mt-3 w-full text-sm px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                Simulate WhatsApp reply
              </button>
            </div>
        </aside>
      </div>
      </div>
    </div>
    </div>
  );
}

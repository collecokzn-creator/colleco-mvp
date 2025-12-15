import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { v as postMessage$1, w as CHANNELS, R as ROLES, x as loadThreads, y as seedFromBookings, l as listThreads$1, e as computeAnalytics, z as summarizeThread, A as markRead$1, D as onCollabEvent, F as addAttachment, G as notify } from "./index-DlOecmR0.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
import "./icons-C4AMPM7L.js";
const mockBookings = [
  {
    id: 1,
    ref: "CE-2024-001",
    clientName: "Alice Johnson",
    status: "Accepted",
    itineraryName: "Kruger Safari Adventure",
    items: [
      {
        id: 101,
        name: "Safari Game Drive",
        category: "activity",
        price: 1500,
        qty: 2,
        startTime: "06:00",
        endTime: "09:00",
        description: "Early morning game drive to spot the Big Five."
      },
      {
        id: 102,
        name: "Safari Lodge",
        category: "hotel",
        price: 4500,
        qty: 2,
        startTime: "14:00",
        description: "Two nights stay in a luxury safari lodge."
      }
    ]
  },
  {
    id: 2,
    ref: "CE-2024-002",
    clientName: "Bob Williams",
    status: "Sent",
    itineraryName: "Drakensberg Mountain Retreat",
    items: [
      {
        id: 201,
        name: "Guided Mountain Hike",
        category: "hike",
        price: 1200,
        qty: 4,
        startTime: "09:00",
        endTime: "13:00",
        description: "Explore the majestic peaks and valleys."
      },
      {
        id: 202,
        name: "Picnic Lunch",
        category: "dining",
        price: 450,
        qty: 4,
        startTime: "13:00",
        endTime: "14:00",
        description: "Enjoy a curated picnic with local delicacies."
      },
      {
        id: 203,
        name: "Stargazing",
        category: "activity",
        // No price for this item
        qty: 4,
        startTime: "20:00",
        endTime: "21:00",
        description: "A guided tour of the southern night sky."
      }
    ]
  },
  {
    id: 3,
    ref: "CE-2024-003",
    clientName: "Charlie Brown",
    status: "Draft",
    itineraryName: "Cape Town City Tour",
    items: [
      { id: 301, name: "City Tour", category: "car", price: 800, qty: 1, startTime: "10:00", endTime: "13:00", description: "A guided tour of the city's main attractions." },
      { id: 302, name: "Museum Tickets", category: "activity", price: 300, qty: 1, startTime: "14:00", endTime: "16:00", description: "Entry to the Iziko South African Museum." }
    ]
  }
];
function simulateInboundWhatsApp({ bookingId, fromName = "Client", content = "Got it, thanks!", authorRole = "client" }) {
  return postMessage$1(bookingId, {
    authorRole,
    authorName: fromName,
    channel: CHANNELS.whatsapp,
    content
  });
}
const BASE = "";
const isApiEnabled = false;
function authHeaders() {
  return {};
}
async function listThreads(role) {
  const qp = new URLSearchParams();
  if (role) qp.set("role", role);
  const q = qp.toString() ? `?${qp.toString()}` : "";
  const res = await fetch(`${BASE}/api/collab${q}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to list threads");
  return res.json();
}
async function postMessage(bookingId, payload) {
  const res = await fetch(`${BASE}/api/collab/${bookingId}/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to post message");
  return res.json();
}
async function postAttachment(bookingId, payload) {
  const res = await fetch(`${BASE}/api/collab/${bookingId}/attachment`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to post attachment");
  return res.json();
}
async function markRead(bookingId, role) {
  const res = await fetch(`${BASE}/api/collab/${bookingId}/read`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ role })
  });
  if (!res.ok) throw new Error("Failed to mark read");
  return res.json();
}
const roleOptions = [
  { value: ROLES.agent, label: "Agent" },
  { value: ROLES.client, label: "Client" },
  { value: ROLES.productOwner, label: "Product Owner" }
];
function RoleBadge({ role }) {
  const map = {
    [ROLES.agent]: "bg-brand-orange/10 text-brand-brown border border-brand-orange/30",
    [ROLES.client]: "bg-cream-hover text-brand-brown border border-cream-border",
    [ROLES.productOwner]: "bg-amber-50 text-amber-800 border border-amber-300",
    [ROLES.system]: "bg-gray-100 text-gray-700 border border-gray-200"
  };
  const label = roleOptions.find((r) => r.value === role)?.label || role;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-2 py-0.5 rounded text-xs ${map[role]}`, children: label });
}
function ChannelTag({ channel }) {
  const map = {
    [CHANNELS.inapp]: { cls: "bg-emerald-50 text-emerald-700", label: "In-App" },
    [CHANNELS.whatsapp]: { cls: "bg-green-50 text-green-700", label: "WhatsApp" },
    [CHANNELS.email]: { cls: "bg-blue-50 text-blue-700", label: "Email" },
    [CHANNELS.sms]: { cls: "bg-purple-50 text-purple-700", label: "SMS" },
    [CHANNELS.call]: { cls: "bg-gray-50 text-gray-700", label: "Call" },
    [CHANNELS.note]: { cls: "bg-yellow-50 text-yellow-700", label: "Note" }
  };
  const it = map[channel] || { cls: "bg-gray-50 text-gray-700", label: channel };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-2 py-0.5 rounded text-xs border ${it.cls}`, children: it.label });
}
function Collaboration() {
  const [currentRole, setCurrentRole] = reactExports.useState(() => localStorage.getItem("collabRole") || ROLES.agent);
  const [bookingId, setBookingId] = reactExports.useState(null);
  const [threads, setThreads] = reactExports.useState([]);
  const [message, setMessage] = reactExports.useState("");
  const [visibility, setVisibility] = reactExports.useState("all");
  const [channel, setChannel] = reactExports.useState(CHANNELS.inapp);
  const [mention, setMention] = reactExports.useState("");
  const [recState, setRecState] = reactExports.useState({ recording: false, mediaRecorder: null, chunks: [] });
  const [autoSync, setAutoSync] = reactExports.useState(false);
  const [sidebarOpen, setSidebarOpen] = reactExports.useState(true);
  reactExports.useEffect(() => {
    (async () => {
      {
        ensureLocalSeed();
      }
    })();
  }, [currentRole]);
  function ensureLocalSeed() {
    if (!Object.keys(loadThreads()).length) {
      seedFromBookings(mockBookings);
    }
    setThreads(listThreads$1());
  }
  reactExports.useEffect(() => {
    return void 0;
  }, [currentRole]);
  reactExports.useEffect(() => {
    if (bookingId == null && threads.length) setBookingId(threads[0].bookingId);
  }, [threads, bookingId]);
  const thread = reactExports.useMemo(() => threads.find((t) => t.bookingId === bookingId), [threads, bookingId]);
  const analytics = reactExports.useMemo(() => computeAnalytics(thread), [thread]);
  const summary = reactExports.useMemo(() => summarizeThread(thread), [thread]);
  reactExports.useEffect(() => {
    if (!thread) return;
    (async () => {
      try {
        if (isApiEnabled) ;
        else markRead$1(thread.bookingId, currentRole);
      } catch {
      }
    })();
  }, [thread, currentRole]);
  reactExports.useEffect(() => {
    if (!thread) return void 0;
    {
      const unsub = onCollabEvent(({ event, payload }) => {
        if (!thread || payload?.bookingId !== thread.bookingId) return;
        if (event === "message") {
          const m = payload.message;
          if (m.authorRole !== currentRole) {
            notify(currentRole, `New ${m.channel} message`, m.content?.slice(0, 120) || "");
          }
          setThreads(listThreads$1());
        }
        if (event === "attachment") {
          setThreads(listThreads$1());
        }
      });
      try {
        if ("Notification" in window) Notification.requestPermission?.();
      } catch {
      }
      return () => {
        try {
          unsub?.();
        } catch {
        }
      };
    }
  }, [thread, currentRole]);
  reactExports.useEffect(() => {
    if (!autoSync || !thread) return;
    const id = setInterval(async () => {
      {
        simulateInboundWhatsApp({ bookingId: thread.bookingId, content: "(Auto) WhatsApp: confirmed, thanks!" });
        setThreads(listThreads$1());
      }
    }, 12e3);
    return () => clearInterval(id);
  }, [autoSync, thread, currentRole]);
  async function send() {
    const content = message.trim();
    if (!content || !thread) return;
    const mentions = mention ? [mention] : [];
    const payload = {
      authorRole: currentRole,
      authorName: roleOptions.find((r) => r.value === currentRole)?.label,
      content,
      channel,
      mentions,
      visibility
    };
    try {
      if (isApiEnabled) ;
      else {
        postMessage$1(thread.bookingId, payload);
        setThreads(listThreads$1());
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
    {
      addAttachment(thread.bookingId, meta);
      setThreads(listThreads$1());
    }
  }
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const arrayBuffer = await blob.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        const size = bytes.byteLength;
        const url = URL.createObjectURL(blob);
        const name = `voice-note-${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}.webm`;
        if (isApiEnabled) ;
        else {
          addAttachment(thread.bookingId, { name, size, type: "audio/webm", byRole: currentRole, url, visibility });
          setThreads(listThreads$1());
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
    } catch {
    }
  }
  function visibleToMe(m) {
    if (m.visibility === "all") return true;
    if (m.visibility === "agent-client") return currentRole === ROLES.agent || currentRole === ROLES.client;
    if (m.visibility === "agent-po") return currentRole === ROLES.agent || currentRole === ROLES.productOwner;
    return true;
  }
  function attachmentVisibleToMe(a) {
    return visibleToMe(a);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold text-brand-brown", children: "Collaboration Workspace" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            className: "lg:hidden px-3 py-2 text-sm border border-cream-border rounded-md bg-white hover:bg-cream-hover",
            onClick: () => setSidebarOpen((s) => !s),
            children: [
              sidebarOpen ? "Hide" : "Show",
              " Bookings"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "select",
          {
            className: "border border-cream-border rounded-md px-3 py-2 bg-white hover:bg-cream-hover focus:outline-none focus:ring-2 focus:ring-brand-orange/30",
            value: currentRole,
            onChange: (e) => {
              setCurrentRole(e.target.value);
              localStorage.setItem("collabRole", e.target.value);
            },
            children: roleOptions.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: r.value, children: r.label }, r.value))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(RoleBadge, { role: currentRole })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-6", children: [
      sidebarOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "lg:col-span-3 bg-cream rounded-lg border border-cream-border shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 border-b border-cream-border font-medium text-brand-brown", children: "Bookings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "max-h-[70vh] overflow-y-auto", children: threads.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setBookingId(t.bookingId),
            className: `w-full text-left px-4 py-3 hover:bg-cream-hover transition-colors ${bookingId === t.bookingId ? "bg-cream-hover" : ""}`,
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold text-brand-brown truncate", children: t.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-brand-brown/70 truncate", children: [
                  t.ref,
                  " • ",
                  t.clientName
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-brand-brown/70 flex-shrink-0", children: t.unread?.[currentRole] ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block min-w-5 text-center px-1.5 py-0.5 bg-brand-orange text-white rounded-full text-xs", children: t.unread[currentRole] }) : null })
            ] })
          }
        ) }, t.bookingId)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: `lg:col-span-6 bg-white rounded-lg border border-cream-border shadow-sm flex flex-col ${!sidebarOpen ? "lg:col-span-9" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 border-b border-cream-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-brand-brown truncate", children: thread?.title || "Select a booking" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-brand-brown/70 truncate", children: [
              thread?.ref,
              " • ",
              thread?.clientName,
              " • Status: ",
              thread?.status
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-brand-brown/60 whitespace-nowrap", children: "Visibility:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "border border-cream-border rounded px-2 py-1 text-xs bg-white hover:bg-cream-hover focus:outline-none focus:ring-1 focus:ring-brand-orange/30", value: visibility, onChange: (e) => setVisibility(e.target.value), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All Participants" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "agent-client", children: "Agent + Client" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "agent-po", children: "Agent + Product Owner" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-brand-brown/60 whitespace-nowrap", children: "Channel:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "border border-cream-border rounded px-2 py-1 text-xs bg-white hover:bg-cream-hover focus:outline-none focus:ring-1 focus:ring-brand-orange/30", value: channel, onChange: (e) => setChannel(e.target.value), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: CHANNELS.inapp, children: "In-App" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: CHANNELS.whatsapp, children: "WhatsApp" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: CHANNELS.email, children: "Email" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: CHANNELS.sms, children: "SMS" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: CHANNELS.note, children: "Note" })
              ] })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-3", children: [
          (thread?.messages || []).filter(visibleToMe).map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `max-w-[85%] ${m.authorRole === currentRole ? "ml-auto" : ""}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded px-3 py-2 border text-sm ${m.authorRole === ROLES.client ? "bg-cream-hover border-cream-border" : "bg-cream border-cream-border"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RoleBadge, { role: m.authorRole }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChannelTag, { channel: m.channel }),
              m.mentions?.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-brand-brown/70", children: m.mentions.map((x) => "@" + x).join(" ") }) : null
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "whitespace-pre-wrap text-brand-brown", children: m.content }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-brand-brown/60 mt-1", children: new Date(m.createdAt).toLocaleString() })
          ] }) }, m.id)),
          (thread?.attachments || []).filter(attachmentVisibleToMe).length ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium text-brand-brown mb-1", children: "Shared Documents" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: thread.attachments.filter(attachmentVisibleToMe).map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "text-sm text-brand-brown border-b border-cream-border py-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  a.name,
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-brand-brown/60", children: [
                    "(",
                    Math.ceil((a.size || 0) / 1024),
                    " KB)"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-brand-brown/60", children: [
                  "by ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(RoleBadge, { role: a.byRole })
                ] })
              ] }),
              a.type?.startsWith("audio/") && a.url ? /* @__PURE__ */ jsxRuntimeExports.jsx("audio", { className: "mt-1 w-full", controls: true, src: a.url }) : null
            ] }, a.id)) })
          ] }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-t border-cream-border sticky bottom-0 bg-white", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                className: "flex-1 min-w-0 border border-cream-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-orange/30",
                placeholder: "Write a message… use @client or @productOwner to mention",
                value: message,
                onChange: (e) => setMessage(e.target.value)
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "border border-cream-border rounded-md px-2 py-2 text-sm bg-white hover:bg-cream-hover focus:outline-none focus:ring-1 focus:ring-brand-orange/30", value: mention, onChange: (e) => setMention(e.target.value), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "@Mention" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "client", children: "@client" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "productOwner", children: "@productOwner" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "cursor-pointer px-3 py-2 text-sm border border-cream-border rounded-md bg-white hover:bg-cream-hover text-brand-brown transition-colors", children: [
              "Attach",
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", className: "hidden", onChange: handleAttach })
            ] }),
            !recState.recording ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: startRecording, className: "px-3 py-2 text-sm border border-cream-border rounded-md bg-white hover:bg-cream-hover text-brand-brown transition-colors", children: "Record" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: stopRecording, className: "px-3 py-2 text-sm border border-red-600 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors", children: "Stop" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: send, className: "px-4 py-2 text-sm bg-brand-orange text-white rounded-md hover:bg-brand-brown transition-colors", children: "Send" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-brand-brown/60", children: "WhatsApp/email sync is simulated. Replies via external channels appear in the timeline with their channel tag." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "lg:col-span-3 bg-cream rounded-lg border border-cream-border shadow-sm p-4 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-brand-brown mb-2", children: "AI Summary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-brand-brown/80 leading-relaxed", children: summary.summary }),
          summary.bullets?.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "list-disc list-inside text-sm text-brand-brown mt-3 space-y-1", children: summary.bullets.map((b, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "leading-relaxed", children: b }, i)) }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-cream-border pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-brand-brown mb-3", children: "Collaboration Analytics" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-brand-brown/70 mb-1", children: "Average response time" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "text-sm text-brand-brown space-y-1", children: Object.entries(analytics.avgResponseMins || {}).map(([r, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between py-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(RoleBadge, { role: r }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
                  v,
                  "m"
                ] })
              ] }, r)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-brand-brown/70 mb-1", children: "Messages per channel" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "text-sm text-brand-brown space-y-1", children: Object.entries(analytics.channelCounts || {}).map(([c, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between py-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChannelTag, { channel: c }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: v })
              ] }, c)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-brand-brown/70 mb-1", children: "Awaiting response" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-brand-brown flex flex-wrap gap-1", children: analytics.awaiting?.length ? analytics.awaiting.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(RoleBadge, { role: r }, i)) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-brand-brown/60", children: "-" }) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-cream-border pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-brand-brown mb-3", children: "Omnichannel & Push" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "text-sm text-brand-brown/90 space-y-1.5 leading-relaxed", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• WhatsApp integration stub ready (webhook-style)." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Email/SMS fallback simulated via channel tags." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Mobile push: add FCM/Expo later for alerts." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Open API hooks for Slack/Teams/CRM coming next." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "mt-3 flex items-center gap-2 text-sm text-brand-brown cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                checked: autoSync,
                onChange: (e) => setAutoSync(e.target.checked),
                className: "rounded border-cream-border focus:ring-2 focus:ring-brand-orange/30"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Auto-simulate WhatsApp replies" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                if (thread) {
                  simulateInboundWhatsApp({ bookingId: thread.bookingId, content: "Replying from WhatsApp: looks good!" });
                  setThreads(listThreads$1());
                }
              },
              className: "mt-3 w-full text-sm px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors",
              children: "Simulate WhatsApp reply"
            }
          )
        ] })
      ] })
    ] })
  ] }) }) });
}
export {
  Collaboration as default
};
//# sourceMappingURL=Collaboration-CKxtq4Tp.js.map

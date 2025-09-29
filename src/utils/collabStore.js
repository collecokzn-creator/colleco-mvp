// Lightweight collaboration store backed by localStorage
// Thread per bookingId: messages, attachments, participants
// Exposes helpers to seed, read, write, and compute analytics.

const STORAGE_KEY = "collabThreads:v1";

// Roles in the system
export const ROLES = {
  agent: "agent",
  client: "client",
  productOwner: "productOwner",
  system: "system",
};

// Channels used for messages
export const CHANNELS = {
  inapp: "in-app",
  whatsapp: "whatsapp",
  email: "email",
  sms: "sms",
  call: "call",
  note: "note",
};

export function loadThreads() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("Failed to load collab threads", e);
    return {};
  }
}

// Tiny event bus for collab updates
const listeners = new Set();
export function onCollabEvent(fn) { listeners.add(fn); return () => listeners.delete(fn); }
function emit(event, payload) {
  try { listeners.forEach(l => l({ event, payload })); } catch {}
}

export function saveThreads(threads) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  } catch (e) {
    console.error("Failed to save collab threads", e);
  }
}

export function ensureThread(booking, participants = []) {
  const threads = loadThreads();
  if (!threads[booking.id]) {
    threads[booking.id] = {
      bookingId: booking.id,
      ref: booking.ref,
      title: booking.itineraryName || "Booking",
      clientName: booking.clientName,
      status: booking.status || "Draft",
      participants, // [{role, name, contact?}]
      messages: [],
      attachments: [], // shared docs
      unread: {}, // per role unread count
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    saveThreads(threads);
  }
  return threads[booking.id];
}

export function getThread(bookingId) {
  const threads = loadThreads();
  return threads[bookingId];
}

export function listThreads() {
  const threads = loadThreads();
  return Object.values(threads).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

export function postMessage(bookingId, message) {
  const threads = loadThreads();
  if (!threads[bookingId]) return;
  const msg = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    mentions: [],
    attachments: [],
    visibility: "all", // all | agent-client | agent-po
    channel: CHANNELS.inapp,
    ...message,
  };
  // Maintain updatedAt and unread counters
  const thread = threads[bookingId];
  thread.messages.push(msg);
  thread.updatedAt = Date.now();
  // simple unread logic: everyone except author increments
  for (const p of thread.participants || []) {
    if (p.role !== msg.authorRole) {
      thread.unread[p.role] = (thread.unread[p.role] || 0) + 1;
    }
  }
  saveThreads(threads);
  emit("message", { bookingId, message: msg });
  return msg;
}

export function addAttachment(bookingId, fileMeta) {
  const threads = loadThreads();
  if (!threads[bookingId]) return;
  const att = {
    id: crypto.randomUUID(),
    addedAt: Date.now(),
    visibility: "all",
    ...fileMeta, // {name, size, type, byRole, url?, visibility?}
  };
  threads[bookingId].attachments.push(att);
  threads[bookingId].updatedAt = Date.now();
  // unread for others
  for (const p of threads[bookingId].participants || []) {
    if (p.role !== att.byRole) {
      threads[bookingId].unread[p.role] = (threads[bookingId].unread[p.role] || 0) + 1;
    }
  }
  saveThreads(threads);
  emit("attachment", { bookingId, attachment: att });
  return att;
}

export function markRead(bookingId, role) {
  const threads = loadThreads();
  if (!threads[bookingId]) return;
  threads[bookingId].unread[role] = 0;
  saveThreads(threads);
}

export function setParticipants(bookingId, participants) {
  const threads = loadThreads();
  if (!threads[bookingId]) return;
  threads[bookingId].participants = participants;
  saveThreads(threads);
}

// Simple analytics: average response time per role, counts per channel
export function computeAnalytics(thread) {
  if (!thread) return { avgResponseMins: {}, channelCounts: {}, awaiting: [] };
  const msgs = [...(thread.messages || [])].sort((a, b) => a.createdAt - b.createdAt);
  const responseTimes = {}; // role -> [diffs]
  const channelCounts = {};

  let prevBy = null, prevAt = null;
  for (const m of msgs) {
    channelCounts[m.channel] = (channelCounts[m.channel] || 0) + 1;
    if (prevBy && m.authorRole !== prevBy && prevAt) {
      const diff = Math.max(0, Math.round((m.createdAt - prevAt) / 60000));
      (responseTimes[m.authorRole] = responseTimes[m.authorRole] || []).push(diff);
    }
    prevBy = m.authorRole;
    prevAt = m.createdAt;
  }

  const avgResponseMins = Object.fromEntries(
    Object.entries(responseTimes).map(([role, diffs]) => [role, Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length)])
  );

  // Awaiting: if last message is from X, others are awaiting
  const awaiting = [];
  if (msgs.length) {
    const last = msgs[msgs.length - 1];
    const others = (thread.participants || []).map(p => p.role).filter(r => r !== last.authorRole);
    awaiting.push(...others);
  }

  return { avgResponseMins, channelCounts, awaiting };
}

// AI conversation summary stub (keyword extraction)
export function summarizeThread(thread) {
  const text = (thread?.messages || []).map(m => m.content || "").join("\n");
  if (!text.trim()) return { summary: "No messages yet.", bullets: [] };
  const bullets = [];
  const lower = text.toLowerCase();
  if (lower.includes("pickup") || lower.includes("transfer")) bullets.push("Add airport pickup");
  if (lower.includes("upgrade")) bullets.push("Upgrade room/category");
  if (lower.includes("flight") && (lower.includes("time") || lower.includes("shift"))) bullets.push("Shift flight time");
  if (lower.includes("quote") && lower.includes("update")) bullets.push("Update quote");
  return {
    summary: bullets.length ? `Top requested changes: ${bullets.join(", ")}.` : "Conversation summarized.",
    bullets,
  };
}

// Seed threads with basic messages for demo
export function seedFromBookings(bookings) {
  const threads = loadThreads();
  for (const b of bookings) {
    if (!threads[b.id]) {
      ensureThread(b, [
        { role: ROLES.agent, name: "Agent" },
        { role: ROLES.client, name: b.clientName },
        { role: ROLES.productOwner, name: "Hotel/Supplier" },
      ]);
      postMessage(b.id, {
        authorRole: ROLES.agent,
        authorName: "Agent",
        channel: CHANNELS.inapp,
        content: `Hi ${b.clientName}, your ${b.itineraryName} itinerary is ready. Would you like an airport pickup added?`,
      });
      postMessage(b.id, {
        authorRole: ROLES.client,
        authorName: b.clientName,
        channel: CHANNELS.whatsapp,
        content: "Yes please, also can we upgrade the room and shift the flight time by 1 hour?",
      });
      postMessage(b.id, {
        authorRole: ROLES.productOwner,
        authorName: "Hotel/Supplier",
        channel: CHANNELS.email,
        content: "Room upgrade available at +$50/night. Awaiting confirmation.",
      });
    }
  }
}

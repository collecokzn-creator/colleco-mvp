/* Minimal collaboration API server (demo)
 - In-memory store for threads, messages, attachments
 - Open API endpoints aligned with docs/integrations.md
 - WhatsApp webhook stub to log inbound messages
*/
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const expressRateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
const { parsePrompt, parseFlightRequest, parseIntent } = require('./aiParser');
const crypto = require('crypto');
const pricingEngine = require('./pricingEngine');
// --- AI Enhancements: rate limiting, cache, analytics log, refine endpoint ---
const AI_RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute window
const AI_RATE_LIMIT_MAX = 20; // max requests per window per ip (sliding window)
const aiRecent = new Map(); // ip -> [{ts}]
// Optional token bucket parameters (env driven). If capacity provided, bucket strategy is active.
const AI_BUCKET_CAPACITY = Number(process.env.AI_BUCKET_CAPACITY || '0');
const AI_BUCKET_REFILL_MS = Number(process.env.AI_BUCKET_REFILL_MS || '1000'); // default 1s per token
const bucketState = new Map(); // ip -> { tokens, lastRefill }
const aiCache = new Map(); // key -> { data, at }
const AI_CACHE_MAX = 50;
// DATA_DIR may be referenced above; ensure it's initialized before using AI file paths
const DATA_DIR = path.join(__dirname, 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });
const AI_ANALYTICS_FILE = path.join(DATA_DIR, 'ai_analytics.log');
const AI_ANALYTICS_ENABLED = process.env.AI_ANALYTICS !== '0';
const AI_DRAFTS_FILE = path.join(DATA_DIR, 'ai_drafts.json');
function loadDrafts(){
  try { if(fs.existsSync(AI_DRAFTS_FILE)){ return JSON.parse(fs.readFileSync(AI_DRAFTS_FILE,'utf8')) || {}; } } catch{ }
  return {};
}
function saveDrafts(){ try { fs.writeFileSync(AI_DRAFTS_FILE, JSON.stringify(aiDrafts,null,2),'utf8'); } catch{} }
const aiDrafts = loadDrafts();
const aiMetrics = { total:0, cacheHits:0, cacheMiss:0, rateLimited:0, refine:0, drafts:0, latencyMs: { gen:[], refine:[] }, tokens: { prompt:0, completion:0, total:0 }, costUsd:0 };
const AI_METRICS_HISTORY_FILE = path.join(DATA_DIR, 'ai_metrics_history.jsonl');
const metricsHistory = []; // ring buffer of snapshots
const METRICS_HISTORY_MAX = 500;

function percentile(arr, p){
  if(!arr.length) return 0;
  const sorted = [...arr].sort((a,b)=>a-b);
  const idx = Math.floor((p/100)*(sorted.length-1));
  return sorted[idx];
}
function snapshotMetrics(){
  const snap = {
    ts: Date.now(),
    total: aiMetrics.total,
    cacheHits: aiMetrics.cacheHits,
    cacheMiss: aiMetrics.cacheMiss,
    rateLimited: aiMetrics.rateLimited,
    refine: aiMetrics.refine,
    drafts: aiMetrics.drafts,
    tokens: { ...aiMetrics.tokens },
    costUsd: aiMetrics.costUsd,
    latency: {
      gen: { p50: percentile(aiMetrics.latencyMs.gen,50), p95: percentile(aiMetrics.latencyMs.gen,95), p99: percentile(aiMetrics.latencyMs.gen,99) },
      refine: { p50: percentile(aiMetrics.latencyMs.refine,50), p95: percentile(aiMetrics.latencyMs.refine,95), p99: percentile(aiMetrics.latencyMs.refine,99) }
    }
  };
  // Delta vs previous snapshot
  const prev = metricsHistory[metricsHistory.length-1];
  if(prev){
    snap.tokensDelta = {
      prompt: snap.tokens.prompt - (prev.tokens?.prompt||0),
      completion: snap.tokens.completion - (prev.tokens?.completion||0),
      total: snap.tokens.total - (prev.tokens?.total||0)
    };
    snap.costDelta = +(snap.costUsd - (prev.costUsd||0)).toFixed(6);
    snap.totalDelta = snap.total - (prev.total||0);
  }
  metricsHistory.push(snap);
  if(metricsHistory.length > METRICS_HISTORY_MAX) metricsHistory.shift();
  try { fs.appendFileSync(AI_METRICS_HISTORY_FILE, JSON.stringify(snap)+"\n", 'utf8'); } catch{}
}
setInterval(snapshotMetrics, 10_000).unref();
// Session objects now optionally include tokenHash for rudimentary scoping
const aiSessions = {}; // id -> { id, prompt, tokenHash?, history: [{type:'parse'|'refine', data, instructions?, at}] }

function tokenHashFromReq(req){
  // Derive a lightweight hash of bearer token (if auth enabled) for scoping
  if(!API_TOKEN) return undefined; // auth disabled => no scoping
  const h = req.headers['authorization'] || '';
  const m = h.match(/^Bearer\s+(.+)/i); const t = (m && m[1]) ? m[1] : '';
  if(!t) return undefined;
  return crypto.createHash('sha1').update(t).digest('hex').slice(0,20);
}

function aiRateLimit(ip){
  // Token bucket strategy if enabled
  if(AI_BUCKET_CAPACITY > 0){
    const now = Date.now();
    let st = bucketState.get(ip);
    if(!st){ st = { tokens: AI_BUCKET_CAPACITY, lastRefill: now }; bucketState.set(ip, st); }
    // Refill tokens based on elapsed time
    if(AI_BUCKET_REFILL_MS > 0){
      const elapsed = now - st.lastRefill;
      if(elapsed > 0){
        const add = Math.floor(elapsed / AI_BUCKET_REFILL_MS);
        if(add > 0){
          st.tokens = Math.min(AI_BUCKET_CAPACITY, st.tokens + add);
          st.lastRefill = now;
        }
      }
    }
    if(st.tokens <= 0){ return false; }
    st.tokens -= 1; // consume one token
    return true;
  }
  // Fallback sliding window method
  const now = Date.now();
  const arr = aiRecent.get(ip) || [];
  const fresh = arr.filter(e => now - e.ts < AI_RATE_LIMIT_WINDOW_MS);
  fresh.push({ ts: now });
  aiRecent.set(ip, fresh);
  if(fresh.length > AI_RATE_LIMIT_MAX){ return false; }
  return true;
}
function cacheKey(prompt){
  return crypto.createHash('sha256').update(prompt.trim()).digest('hex').slice(0,32);
}
function getCached(key){
  const v = aiCache.get(key); if(!v) return null; return v.data;
}
function setCached(key, data){
  aiCache.set(key, { data, at: Date.now() });
  if(aiCache.size > AI_CACHE_MAX){
    // evict oldest
    const oldest = [...aiCache.entries()].sort((a,b)=>a[1].at - b[1].at)[0];
    if(oldest) aiCache.delete(oldest[0]);
  }
}
function logAI(meta){
  if(!AI_ANALYTICS_ENABLED) return;
  try {
    fs.appendFileSync(AI_ANALYTICS_FILE, JSON.stringify(meta)+"\n", 'utf8');
  } catch(e){ /* ignore */ }
}

function recordAnalytics(prompt, parsed){
  const key = cacheKey(prompt);
  logAI({
    ts: Date.now(),
    key,
    len: prompt.length,
    nights: parsed.nights,
    dests: parsed.destinations.length,
    hasBudget: !!parsed.budget.amount,
    interests: parsed.interests.length
  });
}

const app = express();
// Security: trust reverse proxy and hide framework header
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Apply security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Restrictive CORS via env ALLOWED_ORIGINS (comma separated); allow all if unset
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').map(s=>s.trim()).filter(Boolean);
app.use(cors({
  origin(origin, cb){
    if(!origin) return cb(null, true);
    if(ALLOWED_ORIGINS.length===0) return cb(null, true);
    return ALLOWED_ORIGINS.includes(origin) ? cb(null, true) : cb(new Error('Not allowed by CORS'));
  },
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// Global rate limiter (complements per-endpoint limits)
const globalLimiter = expressRateLimit({ windowMs: 60_000, max: 120, standardHeaders: true, legacyHeaders: false });
app.use((req,res,next)=>{ if(req.path==='/events' || req.path==='/health') return next(); return globalLimiter(req,res,next); });
const PORT = process.env.PORT || 4000;
const API_TOKEN = process.env.API_TOKEN || '';
if(process.env.NODE_ENV === 'production' && !API_TOKEN){
  console.warn('[security] API_TOKEN not set in production; protected endpoints will be open.');
}
const HYBRID_LLM = process.env.HYBRID_LLM === '1';
let llmAdapter = null;
if(HYBRID_LLM){
  try { llmAdapter = require('./llmAdapter'); console.log('[ai] hybrid LLM adapter loaded'); } catch(e){ console.warn('[ai] failed to load llmAdapter', e.message); }
}

app.use(express.json({ limit: '2mb' }));

// --- Auth middleware ---
function authCheck(req, res, next) {
  if (!API_TOKEN) return next(); // auth disabled if no token set
  const h = req.headers['authorization'] || '';
  const m = h.match(/^Bearer\s+(.+)/i);
  const token = (m && m[1]) ? m[1] : '';
  const tokenFromQuery = (req.query && req.query.token) ? String(req.query.token) : '';
  if (token === API_TOKEN || tokenFromQuery === API_TOKEN) return next();
  return res.status(401).json({ error: 'unauthorized' });
}

// Persistent store file (reuse DATA_DIR defined above for AI assets)
const DATA_FILE = path.join(DATA_DIR, 'collab.json');
const PROVIDERS_FILE = path.join(DATA_DIR, 'providers.json');
const CONTACT_LOG = path.join(DATA_DIR, 'contact_messages.jsonl');

function loadStore() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      return raw ? JSON.parse(raw) : {};
    }
  } catch (e) { console.error('[store] load failed', e); }
  return {};
}

function saveStore() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch (e) { console.error('[store] save failed', e); }
}

// --- Contact API (email or log fallback) ---
let mailer = null;
try {
  const nodemailer = require('nodemailer');
  if(process.env.SMTP_HOST){
    mailer = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT||587),
      secure: process.env.SMTP_SECURE==='1',
      auth: process.env.SMTP_USER? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
    });
  }
} catch {}

const CONTACT_TO = process.env.CONTACT_TO || process.env.VITE_CONTACT_EMAIL || 'hello@example.com';
const CONTACT_FROM = process.env.CONTACT_FROM || process.env.SMTP_USER || 'no-reply@example.com';

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body || {};
  if(!name || !email || !message){ return res.status(400).json({ error:'missing_fields' }); }
  const entry = { ts: Date.now(), name: String(name).slice(0,200), email: String(email).slice(0,200), message: String(message).slice(0,5000), ip: req.ip };
  try {
    if(mailer){
      await mailer.sendMail({ from: CONTACT_FROM, to: CONTACT_TO, replyTo: email, subject: `[Contact] ${entry.name}`, text: `${entry.message}\n\nFrom: ${entry.name} <${entry.email}>` });
      return res.json({ ok:true, via:'smtp' });
    }
  } catch(e){ console.error('[contact] mail failed', e); }
  try {
    fs.appendFileSync(CONTACT_LOG, JSON.stringify(entry)+"\n", 'utf8');
    return res.json({ ok:true, via:'log' });
  } catch(e){ return res.status(500).json({ error:'persist_failed' }); }
});

function loadProviders() {
  try {
    if (fs.existsSync(PROVIDERS_FILE)) {
      const raw = fs.readFileSync(PROVIDERS_FILE, 'utf8');
      return raw ? JSON.parse(raw) : [];
    }
  } catch (e) { console.error('[providers] load failed', e); }
  return [];
}

function saveProviders() {
  try {
    fs.writeFileSync(PROVIDERS_FILE, JSON.stringify(providers, null, 2), 'utf8');
  } catch (e) { console.error('[providers] save failed', e); }
}

// Store: { [bookingId]: thread }
const store = loadStore();
const providers = loadProviders();

// Simple in-memory accommodation inventory (persisted inside store._accomInventory)
// Structure: store._accomInventory = { roomTypes: { [roomType]: { total: number, price: number } }, bookingsByDate: { 'YYYY-MM-DD': { [roomType]: bookedCount } } }
store._accomInventory = store._accomInventory || { roomTypes: { 'standard': { total: 5, price: 800 }, 'deluxe': { total: 2, price: 1500 } }, bookingsByDate: {} };
store._accomHolds = store._accomHolds || {}; // holdId -> { id, roomType, startDate, endDate, qty, expiresAt, consumed }

// Helper: check availability for a roomType between dates (inclusive start, exclusive end)
function checkAvailability(roomType, startDate, endDate, qty = 1){
  const rt = (store._accomInventory && store._accomInventory.roomTypes && store._accomInventory.roomTypes[roomType]) ? store._accomInventory.roomTypes[roomType] : null;
  if(!rt) return { ok: false, error: 'unknown_room_type' };
  // iterate each date and ensure booked + holds < total
  const total = Number(rt.total || 0);
  const days = [];
  try {
    const s = new Date(startDate);
    const e = new Date(endDate);
    for(let d = new Date(s); d < e; d.setDate(d.getDate()+1)){
      days.push(new Date(d).toISOString().slice(0,10));
    }
  } catch(e){ return { ok:false, error:'invalid_dates' }; }
  for(const day of days){
    const bookedOnDay = (store._accomInventory.bookingsByDate && store._accomInventory.bookingsByDate[day] && Number(store._accomInventory.bookingsByDate[day][roomType]||0)) || 0;
    // Count active holds for this roomType and date
    let holdsCount = 0;
    for(const h of Object.values(store._accomHolds||{})){
      if(h && !h.consumed && Number(h.qty||1) > 0 && h.roomType === roomType && h.startDate && h.endDate){
        if(h.startDate <= day && day < h.endDate && h.expiresAt > Date.now()) holdsCount += Number(h.qty||1);
      }
    }
    if(bookedOnDay + holdsCount + qty > total) return { ok:false, available: Math.max(0, total - bookedOnDay - holdsCount) };
  }
  return { ok:true, available: true };
}

// Helper: apply booking items to inventory counts (increment booked counts)
function applyBookingToInventory(booking){
  if(!booking || !Array.isArray(booking.items)) return;
  store._accomInventory.bookingsByDate = store._accomInventory.bookingsByDate || {};
  for(const it of booking.items){
    if(!it || it.type !== 'accommodation') continue;
    const roomType = it.roomType || 'standard';
    const startDate = it.startDate; const endDate = it.endDate;
    const qty = Number(it.qty || 1);
    if(!startDate || !endDate) continue;
    // iterate dates
    const s = new Date(startDate); const e = new Date(endDate);
    for(let d = new Date(s); d < e; d.setDate(d.getDate()+1)){
      const day = new Date(d).toISOString().slice(0,10);
      store._accomInventory.bookingsByDate[day] = store._accomInventory.bookingsByDate[day] || {};
      store._accomInventory.bookingsByDate[day][roomType] = (Number(store._accomInventory.bookingsByDate[day][roomType]||0) + qty);
    }
  }
  booking.inventoryApplied = true;
  booking.inventoryAppliedAt = Date.now();
  saveStore();
}

// Helper: release booking items from inventory counts (decrement booked counts)
function releaseBookingFromInventory(booking){
  if(!booking || !Array.isArray(booking.items)) return;
  store._accomInventory.bookingsByDate = store._accomInventory.bookingsByDate || {};
  for(const it of booking.items){
    if(!it || it.type !== 'accommodation') continue;
    const roomType = it.roomType || 'standard';
    const startDate = it.startDate; const endDate = it.endDate;
    const qty = Number(it.qty || 1);
    if(!startDate || !endDate) continue;
    const s = new Date(startDate); const e = new Date(endDate);
    for(let d = new Date(s); d < e; d.setDate(d.getDate()+1)){
      const day = new Date(d).toISOString().slice(0,10);
      store._accomInventory.bookingsByDate[day] = store._accomInventory.bookingsByDate[day] || {};
      store._accomInventory.bookingsByDate[day][roomType] = Math.max(0, Number(store._accomInventory.bookingsByDate[day][roomType]||0) - qty);
    }
  }
  booking.inventoryApplied = false;
  booking.inventoryReleasedAt = Date.now();
  saveStore();
}

// Create a temporary hold for inventory (expires after holdMinutes)
app.post('/api/accommodation/hold', authCheck, (req, res) => {
  try {
    const { roomType, startDate, endDate, qty = 1, holdMinutes = 10 } = req.body || {};
    if(!roomType || !startDate || !endDate) return res.status(400).json({ error:'roomType,startDate,endDate required' });
    const avail = checkAvailability(roomType, startDate, endDate, qty);
    if(!avail.ok) return res.status(400).json({ error:'not_available', details: avail });
    const id = cryptoRandom();
    const expiresAt = Date.now() + (Number(holdMinutes||10) * 60 * 1000);
    store._accomHolds[id] = { id, roomType, startDate, endDate, qty: Number(qty||1), expiresAt, createdAt: Date.now(), consumed: false };
    saveStore();
    return res.status(201).json({ ok:true, hold: store._accomHolds[id] });
  } catch(e){ console.error('hold error', e); return res.status(500).json({ error:'server_error' }); }
});

// Release a hold explicitly
app.post('/api/accommodation/hold/:id/release', authCheck, (req, res) => {
  const id = req.params.id;
  const h = store._accomHolds && store._accomHolds[id];
  if(!h) return res.status(404).json({ error:'hold_not_found' });
  h.expiresAt = Date.now(); // mark expired
  saveStore();
  return res.json({ ok:true });
});

// Availability endpoint
app.get('/api/accommodation/availability', (req, res) => {
  const roomType = (req.query.roomType||'standard').toString();
  const startDate = (req.query.startDate||'').toString();
  const endDate = (req.query.endDate||'').toString();
  if(!startDate || !endDate) return res.status(400).json({ error:'startDate and endDate required' });
  const avail = checkAvailability(roomType, startDate, endDate, 1);
  if(!avail.ok) return res.status(200).json({ ok:false, details: avail });
  return res.json({ ok:true, available: true });
});

// Admin: get inventory, holds and per-day bookings (protected)
app.get('/api/accommodation/admin', authCheck, (req, res) => {
  const inventory = store._accomInventory || { roomTypes: {}, bookingsByDate: {} };
  const holds = store._accomHolds || {};
  res.json({ ok: true, inventory, holds });
});

// Admin: replace inventory roomTypes (body: { roomTypes: { name: { total:number, price:number } } })
app.put('/api/accommodation/inventory', authCheck, (req, res) => {
  try {
    const body = req.body || {};
    const roomTypes = body.roomTypes || {};
    if (typeof roomTypes !== 'object') return res.status(400).json({ error: 'roomTypes object required' });
    // validate entries
    const normalized = {};
    for (const [k,v] of Object.entries(roomTypes)){
      const total = Number(v && v.total ? v.total : 0);
      const price = Number(v && v.price ? v.price : 0);
      if(!Number.isFinite(total) || total < 0) return res.status(400).json({ error: 'invalid_total', roomType: k });
      if(!Number.isFinite(price) || price < 0) return res.status(400).json({ error: 'invalid_price', roomType: k });
      normalized[String(k)] = { total: Math.max(0, Math.floor(total)), price: Math.round(price*100)/100 };
    }
  store._accomInventory = store._accomInventory || { roomTypes: {}, bookingsByDate: {} };
  store._accomInventory.roomTypes = normalized;
  // When replacing inventory in admin mode, allow tests to provide a fresh bookingsByDate
  // or default to clearing existing per-day bookings to avoid stale state blocking availability.
  store._accomInventory.bookingsByDate = body.bookingsByDate && typeof body.bookingsByDate === 'object' ? body.bookingsByDate : {};
    saveStore();
    return res.json({ ok:true, inventory: store._accomInventory });
  } catch(e){ console.error('inventory update failed', e); return res.status(500).json({ error:'server_error' }); }
});

// Admin: add or update single room type (body: { name, total, price })
app.post('/api/accommodation/room-type', authCheck, (req, res) => {
  try {
    const { name, total = 0, price = 0 } = req.body || {};
    if(!name) return res.status(400).json({ error: 'name required' });
    const t = Number(total); const p = Number(price);
    if(!Number.isFinite(t) || t < 0) return res.status(400).json({ error:'invalid_total' });
    if(!Number.isFinite(p) || p < 0) return res.status(400).json({ error:'invalid_price' });
    store._accomInventory = store._accomInventory || { roomTypes: {}, bookingsByDate: {} };
    store._accomInventory.roomTypes[String(name)] = { total: Math.max(0, Math.floor(t)), price: Math.round(p*100)/100 };
    saveStore();
    return res.status(201).json({ ok:true, roomType: store._accomInventory.roomTypes[String(name)] });
  } catch(e){ console.error('room-type add failed', e); return res.status(500).json({ error:'server_error' }); }
});

// Admin: delete a room type
app.delete('/api/accommodation/room-type/:name', authCheck, (req, res) => {
  try {
    const name = req.params.name;
    store._accomInventory = store._accomInventory || { roomTypes: {}, bookingsByDate: {} };
    if(!store._accomInventory.roomTypes[name]) return res.status(404).json({ error:'not_found' });
    delete store._accomInventory.roomTypes[name];
    saveStore();
    return res.json({ ok:true });
  } catch(e){ console.error('delete room type failed', e); return res.status(500).json({ error:'server_error' }); }
});

// Periodic cleanup of expired holds
setInterval(() => {
  const now = Date.now();
  let changed = false;
  for(const [k,h] of Object.entries(store._accomHolds||{})){
    if(!h) continue;
    if(!h.consumed && h.expiresAt && h.expiresAt <= now){
      // expire
      delete store._accomHolds[k]; changed = true;
    }
  }
  if(changed) saveStore();
}, 60 * 1000).unref();

const ROLES = { agent: 'agent', client: 'client', productOwner: 'productOwner', system: 'system' };

function ensureThread(bookingId, seed = {}) {
  if (!store[bookingId]) {
    store[bookingId] = {
      bookingId,
      ref: seed.ref || `REF-${bookingId}`,
      title: seed.title || 'Booking',
      clientName: seed.clientName || 'Client',
      status: seed.status || 'Draft',
      participants: seed.participants || [
        { role: ROLES.agent, name: 'Agent' },
        { role: ROLES.client, name: 'Client' },
        { role: ROLES.productOwner, name: 'Product Owner' },
      ],
      messages: [],
      attachments: [],
      unread: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }
  return store[bookingId];
}

function postMessage(bookingId, msg) {
  const t = ensureThread(bookingId);
  const message = {
    id: cryptoRandom(),
    createdAt: Date.now(),
    mentions: [],
    attachments: [],
    visibility: 'all',
    channel: 'in-app',
    ...msg,
  };
  t.messages.push(message);
  t.updatedAt = Date.now();
  for (const p of t.participants) {
    if (p.role !== message.authorRole) {
      t.unread[p.role] = (t.unread[p.role] || 0) + 1;
    }
  }
  return message;
}

function addAttachment(bookingId, att) {
  const t = ensureThread(bookingId);
  const attachment = {
    id: cryptoRandom(),
    addedAt: Date.now(),
    visibility: 'all',
    ...att,
  };
  t.attachments.push(attachment);
  t.updatedAt = Date.now();
  for (const p of t.participants) {
    if (p.role !== attachment.byRole) {
      t.unread[p.role] = (t.unread[p.role] || 0) + 1;
    }
  }
  return attachment;
}

function cryptoRandom() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Health
app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'collab-api', time: new Date().toISOString() });
});

// --- Admin Console Mock Endpoints ---
const ADMIN_MOCK = {
  stats: { bookings: 42, partners: 12, pendingApprovals: 3, revenue: "R36,420" },
  partners: [
    { id: "p-01", name: "Beekman Holidays", tier: "Gold", status: "active", lastVerified: "2025-09-10" },
    { id: "p-02", name: "Margate Retreats", tier: "Bronze", status: "pending", lastVerified: null },
  ],
  bookings: [
    { id: "b-1001", guest: "Thabo N", property: "Ballito Beach House", status: "confirmed", total: "R3,400", checkin: "2025-11-05" },
    { id: "b-1002", guest: "Sihle K", property: "Durban City Stay", status: "pending", total: "R1,200", checkin: "2025-10-12" },
  ],
  compliance: [
    { partnerId: "p-02", name: "Margate Retreats", issue: "Missing COI", severity: "high", expires: null },
  ],
};

app.get('/api/admin/stats', (req, res) => {
  res.json(ADMIN_MOCK.stats);
});
app.get('/api/admin/partners', (req, res) => {
  res.json(ADMIN_MOCK.partners);
});
app.get('/api/admin/bookings', (req, res) => {
  res.json(ADMIN_MOCK.bookings);
});
app.get('/api/admin/compliance', (req, res) => {
  res.json(ADMIN_MOCK.compliance);
});

app.post('/api/admin/partners/:id/approve', (req, res) => {
  // Simulate approval
  res.json({ ok: true, id: req.params.id, status: "active" });
});
app.post('/api/admin/bookings/:id/confirm', (req, res) => {
  // Simulate booking confirmation
  res.json({ ok: true, id: req.params.id, status: "confirmed" });
});

// --- Payments stub ---
// Compute transparent fees and return a mock checkout URL
function computeFees(items = [], opts = {}) {
  const subtotal = items.reduce((sum, it) => sum + Math.max(0, Number(it.amount || 0)), 0);
  const paymentProcessor = Math.round(subtotal * 0.029 + 30) / 100; // 2.9% + 30c
  const platformFee = Math.round(subtotal * 0.05 * 100) / 100; // 5%
  const taxes = Math.round(subtotal * 0.15 * 100) / 100; // 15% VAT (example)
  const total = Math.round((subtotal + paymentProcessor + platformFee + taxes) * 100) / 100;
  return { currency: opts.currency || 'USD', subtotal, paymentProcessor, platformFee, taxes, total };
}

app.post('/api/payments/checkout', authCheck, (req, res) => {
  const { items = [], currency = 'USD', metadata = {} } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'items required' });
  const fees = computeFees(items, { currency });
  const sessionId = cryptoRandom();
  const checkoutUrl = `https://checkout.example/redirect/${sessionId}`;
  res.json({ ok: true, sessionId, checkoutUrl, fees, metadata });
});

// --- Bookings API ---
// Create a booking record and optionally return a checkout session when paid items exist
app.post('/api/bookings', authCheck, (req, res) => {
  try {
    const { items = [], customer = {}, currency = 'USD', metadata = {} } = req.body || {};
    const v = validateBookingData({ items, customer, currency });
    if(!v.valid) return res.status(400).json({ error: 'validation_failed', details: v.errors });
    const bookingId = cryptoRandom();
    const hasPaid = items.some(i => (Number(i.amount || i.price || 0) || 0) > 0);
    const booking = {
      id: bookingId,
      ref: `BKG-${Date.now().toString(36).slice(0,6)}`,
      items,
      customer,
      metadata,
      status: hasPaid ? 'PendingPayment' : 'Confirmed',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    store[bookingId] = booking;
    // ensure collab thread exists for this booking
    ensureThread(bookingId, { ref: booking.ref, title: booking.itineraryName || booking.ref, clientName: customer.name || 'Client' });
    saveStore();

    // If any paid items exist, compute pricing totals and create a mock payment session
    if (hasPaid) {
      // partnerBookingCount may be provided in metadata (fallback to 0)
      const partnerBookingCount = (metadata && Number(metadata.partnerBookingCount)) || 0;
      const totals = pricingEngine.computeTotals(items, partnerBookingCount, { currency });
      // attach pricing info to booking for downstream visibility
      booking.pricing = totals;
      booking.fees = totals; // keep legacy key 'fees' for compatibility

      const sessionId = cryptoRandom();
      store._sessions = store._sessions || {};
      // store session with amount to pay
      store._sessions[sessionId] = { bookingId, status: 'pending', createdAt: Date.now(), amount: totals.total };
      saveStore();
      // For local/dev we return a local checkout simulation URL (client should open this)
      const checkoutUrl = `/api/mock-checkout/${sessionId}`;
      return res.json({ ok: true, booking, checkout: { sessionId, checkoutUrl }, fees: totals });
    }

    return res.json({ ok: true, booking });
  } catch (e) {
    console.error('create booking error', e);
    return res.status(500).json({ error: 'server_error' });
  }
});

// Helper: create booking record from items/customer and return booking + optional checkout
function createBookingInternal(items = [], customer = {}, currency = 'USD', metadata = {}){
  const bookingId = cryptoRandom();
  const hasPaid = items.some(i => (Number(i.amount || i.netRate || i.price || 0) || 0) > 0);
  const booking = {
    id: bookingId,
    ref: `BKG-${Date.now().toString(36).slice(0,6)}`,
    // ensure items are cloned and each has an id for tracking
    items: Array.isArray(items) ? items.map(it => ({ id: it.id || cryptoRandom(), ...it })) : items,
    customer,
    metadata,
    status: hasPaid ? 'PendingPayment' : 'Confirmed',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  store[bookingId] = booking;
  // ensure collab thread exists
  ensureThread(bookingId, { ref: booking.ref, title: booking.itineraryName || booking.ref, clientName: customer.name || 'Client' });
  saveStore();

  // If booking is confirmed (no payment needed) or hold was consumed, apply inventory immediately
  try {
    const needsInventory = booking.items.some(i => i && i.type === 'accommodation');
    if(needsInventory && booking.status === 'Confirmed'){
      applyBookingToInventory(booking);
    }
  } catch(e){ console.error('apply inventory error', e); }

  if(hasPaid){
    const partnerBookingCount = (metadata && Number(metadata.partnerBookingCount)) || 0;
    const totals = pricingEngine.computeTotals(items, partnerBookingCount, { currency });
    booking.pricing = totals;
    booking.fees = totals;
    const sessionId = cryptoRandom();
    store._sessions = store._sessions || {};
    store._sessions[sessionId] = { bookingId, status: 'pending', createdAt: Date.now(), amount: totals.total };
    saveStore();
    const checkoutUrl = `/api/mock-checkout/${sessionId}`;
    return { booking, checkout: { sessionId, checkoutUrl }, fees: totals };
  }
  return { booking };
}

// Direct booking endpoints for single-item experiences
app.post('/api/bookings/accommodation', authCheck, (req, res) => {
  try {
    const body = req.body || {};
    const { hotelName, nights, unitPrice, currency = 'ZAR', customer = {}, metadata = {}, roomType, extras = [], startDate, endDate, holdId, qty = 1 } = body;
    if (ajv && ajv.validateAccommodation) {
      const ok = ajv.validateAccommodation(body);
      if (!ok) return res.status(400).json({ error: 'validation_failed', details: errorsFromAjv(ajv.validateAccommodation.errors) });
    } else {
      if (!hotelName || !nights || (!Number.isFinite(Number(unitPrice)) && Number(unitPrice) !== 0)) return res.status(400).json({ error: 'hotelName, nights and unitPrice are required' });
    }
    const extrasTotal = Array.isArray(extras) ? extras.reduce((s,e)=>s + Number(e.price || 0), 0) : 0;
    const base = Number(unitPrice) * Number(nights);
    const totalAmount = Math.round((base + extrasTotal) * 100) / 100;
    const item = { type: 'accommodation', title: hotelName, name: hotelName, roomType: roomType || null, nights: Number(nights), unitPrice: Number(unitPrice), extras: Array.isArray(extras) ? extras : [], amount: totalAmount, netRate: totalAmount, startDate: startDate || null, endDate: endDate || null };

    // If a holdId is provided, validate the hold and mark it consumed
    if (holdId) {
      const hold = (store._accomHolds || {})[String(holdId)];
      if (!hold) return res.status(400).json({ error: 'invalid_hold' });
      // Ensure hold matches requested roomType and dates
      if (hold.roomType !== item.roomType) return res.status(400).json({ error: 'hold_roomtype_mismatch' });
      if (hold.startDate !== item.startDate || hold.endDate !== item.endDate) return res.status(400).json({ error: 'hold_dates_mismatch' });
      if (hold.consumed) return res.status(400).json({ error: 'hold_already_used' });
      // mark consumed so availability reflects booking
      hold.consumed = true;
      hold.consumedAt = Date.now();
    } else {
      // No hold provided: stricter validation
      // If booking requires payment, require a hold to avoid holding inventory during external checkout
      const willRequirePayment = (Number(item.amount || item.netRate || 0) || 0) > 0;
      if (willRequirePayment) return res.status(400).json({ error: 'hold_required_for_paid_booking' });
      // For non-paid bookings, check inventory availability immediately and reject if not available
      const avail = checkAvailability(item.roomType || 'standard', item.startDate, item.endDate, Number(qty || 1));
      if (!avail.ok) return res.status(409).json({ error: 'not_available', details: avail });
    }

    const result = createBookingInternal([item], customer, currency, metadata);
    if (result.checkout) return res.status(200).json({ ok: true, booking: result.booking, checkout: result.checkout, fees: result.fees });
    return res.status(200).json({ ok: true, booking: result.booking });
  } catch (e) { console.error('accommodation booking error', e); return res.status(500).json({ error: 'server_error' }); }
});

app.post('/api/bookings/flight', authCheck, (req, res) => {
  try {
    const body = req.body || {};
    const { from, to, date, price, currency = 'ZAR', customer = {}, metadata = {}, flightNumber, returnFlight } = body;
    if (ajv && ajv.validateFlight) {
      const ok = ajv.validateFlight(body);
      if (!ok) return res.status(400).json({ error: 'validation_failed', details: errorsFromAjv(ajv.validateFlight.errors) });
    } else {
      if (!from || !to || (!Number.isFinite(Number(price)) && Number(price) !== 0)) return res.status(400).json({ error: 'from, to and price are required' });
    }
    const title = `Flight ${from}→${to} ${date?`on ${date}`:''}`;
    const item = { type: 'flight', title, name: title, from, to, date: date || null, flightNumber: flightNumber || null, status: 'Scheduled', amount: Number(price), netRate: Number(price) };
    const items = [item];
    // optional return flight object for round-trip
    if (returnFlight && typeof returnFlight === 'object'){
      const rf = returnFlight;
      const rtitle = `Return ${rf.from || to}→${rf.to || from} ${rf.date?`on ${rf.date}`:''}`;
      const returnItem = { type: 'flight', title: rtitle, name: rtitle, from: rf.from || to, to: rf.to || from, date: rf.date || null, flightNumber: rf.flightNumber || null, status: 'Scheduled', amount: Number(rf.price || 0), netRate: Number(rf.price || 0), roundTripPair: true };
      items.push(returnItem);
    }
    const result = createBookingInternal(items, customer, currency, metadata);
    if (result.checkout) return res.status(200).json({ ok: true, booking: result.booking, checkout: result.checkout, fees: result.fees });
    return res.status(200).json({ ok: true, booking: result.booking });
  } catch (e) { console.error('flight booking error', e); return res.status(500).json({ error: 'server_error' }); }
});

app.post('/api/bookings/car', authCheck, (req, res) => {
  try {
    const body = req.body || {};
    const { vehicleType, days = 1, pricePerDay, currency = 'ZAR', customer = {}, metadata = {}, pickupLocation, dropoffLocation, pickupTime, dropoffTime, extras = [], insurancePrice = 0 } = body;
    if (ajv && ajv.validateCar) {
      const ok = ajv.validateCar(body);
      if (!ok) return res.status(400).json({ error: 'validation_failed', details: errorsFromAjv(ajv.validateCar.errors) });
    } else {
      if (!vehicleType || (!Number.isFinite(Number(pricePerDay)) && Number(pricePerDay) !== 0)) return res.status(400).json({ error: 'vehicleType and pricePerDay are required' });
    }
    const extrasTotal = Array.isArray(extras) ? extras.reduce((s,e)=>s + Number(e.price || 0), 0) : 0;
    const base = Number(pricePerDay) * Number(days || 1);
    const total = Math.round((base + extrasTotal + Number(insurancePrice || 0)) * 100) / 100;
    const title = `${vehicleType} hire for ${days} day(s)`;
    const item = { type: 'car', title, name: title, days: Number(days), pickupLocation: pickupLocation || null, dropoffLocation: dropoffLocation || null, pickupTime: pickupTime || null, dropoffTime: dropoffTime || null, extras: Array.isArray(extras) ? extras : [], insurancePrice: Number(insurancePrice || 0), amount: total, netRate: total };
    const result = createBookingInternal([item], customer, currency, metadata);
    if (result.checkout) return res.status(200).json({ ok: true, booking: result.booking, checkout: result.checkout, fees: result.fees });
    return res.status(200).json({ ok: true, booking: result.booking });
  } catch (e) { console.error('car booking error', e); return res.status(500).json({ error: 'server_error' }); }
});

// Flight monitoring: get flight item by id
app.get('/api/flights/:itemId', authCheck, (req, res) => {
  const itemId = req.params.itemId;
  for (const [bid, b] of Object.entries(store)){
    if (!b || !Array.isArray(b.items)) continue;
    const it = b.items.find(x => x && x.id === itemId);
    if (it) return res.json({ ok: true, bookingId: bid, item: it });
  }
  return res.status(404).json({ error: 'flight_not_found' });
});

// Manual status update for tests or admin
app.post('/api/flights/:itemId/status', authCheck, (req, res) => {
  const itemId = req.params.itemId;
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ error: 'status_required' });
  for (const [bid, b] of Object.entries(store)){
    if (!b || !Array.isArray(b.items)) continue;
    const it = b.items.find(x => x && x.id === itemId);
    if (it){
      it.status = String(status);
      it.updatedAt = Date.now();
      b.updatedAt = Date.now();
      saveStore();
      broadcast('flight.updated', { bookingId: bid, item: it }, 'agent-client');
      return res.json({ ok: true, bookingId: bid, item: it });
    }
  }
  return res.status(404).json({ error: 'flight_not_found' });
});

// Background simulator to advance flight statuses for demo/testing
function simulateFlightStatusUpdates(){
  const states = ['Scheduled','Boarding','Departed','In-Flight','Landed','Completed','Delayed','Cancelled'];
  try {
    for (const [bid, b] of Object.entries(store)){
      if(!b || !Array.isArray(b.items)) continue;
      for (const it of b.items.filter(x => x && x.type === 'flight')){
        if (Math.random() < 0.12){
          const cand = states.filter(s => s !== it.status);
          const newStatus = cand[Math.floor(Math.random() * cand.length)];
          it.status = newStatus;
          it.updatedAt = Date.now();
          b.updatedAt = Date.now();
          saveStore();
          broadcast('flight.updated', { bookingId: bid, item: it }, 'agent-client');
        }
      }
    }
  } catch (e){ console.error('flight simulator error', e); }
}
setInterval(simulateFlightStatusUpdates, 10_000).unref();

// Read booking by id
app.get('/api/bookings/:id', authCheck, (req, res) => {
  const id = req.params.id;
  const b = store[id];
  if (!b) return res.status(404).json({ error: 'not_found' });
  res.json({ ok: true, booking: b });
});

// Payment webhook (simulate provider callback). Accepts { sessionId?, bookingId?, status }
app.post('/api/payments/webhook', (req, res) => {
  try {
    let { sessionId, bookingId, status } = req.body || {};
    if (!bookingId && sessionId && store._sessions && store._sessions[sessionId]) {
      bookingId = store._sessions[sessionId].bookingId;
    }
    if (!bookingId) return res.status(400).json({ error: 'missing_booking' });
    const b = store[bookingId];
    if (!b) return res.status(404).json({ error: 'booking_not_found' });
    // Map common statuses to our canonical status
    const normalized = (status || '').toString().toLowerCase();
    if (normalized === 'paid' || normalized === 'completed' || normalized === 'success') b.status = 'Confirmed';
    else if (normalized === 'failed' || normalized === 'cancelled') b.status = 'Cancelled';
    else b.status = status || 'Pending';
    b.updatedAt = Date.now();
    // mark session if present
    if (sessionId && store._sessions && store._sessions[sessionId]) store._sessions[sessionId].status = b.status;
    saveStore();
    // notify SSE listeners
    // If booking moved to Confirmed, apply inventory (if not already applied)
    try {
      if (b.status === 'Confirmed' && !b.inventoryApplied) applyBookingToInventory(b);
      if (b.status === 'Cancelled' && b.inventoryApplied) releaseBookingFromInventory(b);
    } catch(e){ console.error('inventory update on webhook failed', e); }
    broadcast('booking.updated', b, 'all');
    return res.json({ ok: true, booking: b });
  } catch (e) {
    console.error('webhook error', e);
    return res.status(500).json({ error: 'server_error' });
  }
});

// Simple mock checkout page that lets you simulate a payment (dev only)
app.get('/api/mock-checkout/:sessionId', (req, res) => {
  const sid = req.params.sessionId;
  const s = (store._sessions || {})[sid];
  if (!s) return res.status(404).send('Session not found');
  const bookingId = s.bookingId;
  // Render a tiny HTML page allowing simulation of success/failure
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`
    <html><body>
      <h3>Mock Checkout</h3>
      <p>Session: ${sid}</p>
      <p>Booking: ${bookingId}</p>
      <button onclick="fetch('/api/payments/webhook', {method:'POST',headers:{'content-type':'application/json'}, body: JSON.stringify({ sessionId: '${sid}', status: 'paid' })}).then(()=>{ alert('Simulated paid'); window.location='/payment-success?bookingId=${bookingId}'; })">Simulate success</button>
      <button onclick="fetch('/api/payments/webhook', {method:'POST',headers:{'content-type':'application/json'}, body: JSON.stringify({ sessionId: '${sid}', status: 'failed' })}).then(()=>{ alert('Simulated failed'); window.location='/payment-success?bookingId=${bookingId}&status=failed'; })">Simulate failure</button>
    </body></html>
  `);
});

// --- SSE Broadcaster ---
const sseClients = new Set(); // { res, role }
function allowedRolesForVisibility(v) {
  switch (v) {
    case 'agent-client': return [ROLES.agent, ROLES.client];
    case 'agent-po': return [ROLES.agent, ROLES.productOwner];
    case 'all': default: return [ROLES.agent, ROLES.client, ROLES.productOwner, ROLES.system];
  }
}
function broadcast(event, data, visibility) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  const allow = visibility ? new Set(allowedRolesForVisibility(visibility)) : null;
  for (const c of sseClients) {
    try {
      if (!allow || !c.role || allow.has(c.role)) {
        c.res.write(payload);
      }
    } catch (e) {
      try { c.res.end(); } catch {}
      sseClients.delete(c);
    }
  }
}

app.get('/events', authCheck, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  const client = { res, role: (req.query.role || '').toString() };
  sseClients.add(client);
  res.write(`event: hello\ndata: {"ok":true}\n\n`);
  req.on('close', () => { sseClients.delete(client); });
});

// List threads
app.get('/api/collab', authCheck, (req, res) => {
  const role = (req.query.role || '').toString();
  const list = Object.values(store).map(t => filterThreadByRole(t, role)).sort((a,b) => (b.updatedAt||0) - (a.updatedAt||0));
  res.json(list);
});

// Get single thread
app.get('/api/collab/:bookingId', authCheck, (req, res) => {
  const t = store[req.params.bookingId];
  if (!t) return res.status(404).json({ error: 'Not found' });
  const role = (req.query.role || '').toString();
  res.json(filterThreadByRole(t, role));
});

function filterThreadByRole(thread, role) {
  if (!role) return thread;
  const allowed = (v) => v === 'all' ||
    (v === 'agent-client' && (role === ROLES.agent || role === ROLES.client)) ||
    (v === 'agent-po' && (role === ROLES.agent || role === ROLES.productOwner));
  return {
    ...thread,
    messages: (thread.messages || []).filter(m => allowed(m.visibility)),
    attachments: (thread.attachments || []).filter(a => allowed(a.visibility)),
  };
}

// --- Validation helpers (prefer AJV when available) ---
let ajv = null, ajvValidateQuote = null, ajvValidateBooking = null;
try {
  const Ajv = require('ajv');
  const addFormats = require('ajv-formats');
  ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
  addFormats(ajv);

  const quoteSchema = {
    type: 'object',
    properties: {
      clientName: { type: 'string', minLength: 1, maxLength: 200 },
      clientEmail: { type: 'string', format: 'email' },
      currency: { type: 'string', pattern: '^[A-Z]{3}$' },
      items: {
        type: 'array',
        maxItems: 500,
        items: {
          type: 'object',
          properties: {
            title: { type: 'string', minLength: 1, maxLength: 300 },
            unitPrice: { type: 'number', minimum: 0 },
            quantity: { type: 'number', minimum: 0 }
          },
          required: ['title']
        }
      },
      taxRate: { type: 'number', minimum: 0, maximum: 100 },
      discountRate: { type: 'number', minimum: 0, maximum: 100 }
    },
    required: ['clientName']
  };

  const bookingSchema = {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          properties: {
            amount: { type: 'number', minimum: 0 }
          },
          required: ['amount']
        }
      },
      currency: { type: 'string', pattern: '^[A-Z]{3}$' },
      customer: {
        type: 'object',
        properties: { email: { type: 'string', format: 'email' } }
      }
    },
    required: ['items']
  };

  ajvValidateQuote = ajv.compile(quoteSchema);
  ajvValidateBooking = ajv.compile(bookingSchema);
  // Additional schemas for direct booking endpoints
  const accommodationSchema = {
    type: 'object',
    properties: {
      hotelName: { type: 'string', minLength: 1 },
      roomType: { type: 'string' },
      extras: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, price: { type: 'number', minimum: 0 } } } },
      nights: { type: 'integer', minimum: 1 },
      unitPrice: { type: 'number', minimum: 0 },
      currency: { type: 'string', pattern: '^[A-Z]{3}$' },
      customer: { type: 'object' }
    },
    required: ['hotelName','nights','unitPrice']
  };
  const flightSchema = {
    type: 'object',
    properties: {
      from: { type: 'string', minLength: 1 },
      to: { type: 'string', minLength: 1 },
      date: { type: ['string','null'] },
      price: { type: 'number', minimum: 0 },
      flightNumber: { type: 'string' },
      returnFlight: {
        type: ['object','null'],
        properties: {
          from: { type: 'string' },
          to: { type: 'string' },
          date: { type: ['string','null'] },
          price: { type: 'number', minimum: 0 },
          flightNumber: { type: 'string' }
        }
      },
      currency: { type: 'string', pattern: '^[A-Z]{3}$' }
    },
    required: ['from','to','price']
  };
  const carSchema = {
    type: 'object',
    properties: {
      vehicleType: { type: 'string', minLength: 1 },
      pickupLocation: { type: 'string' },
      dropoffLocation: { type: 'string' },
      pickupTime: { type: ['string','null'] },
      dropoffTime: { type: ['string','null'] },
      extras: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, price: { type: 'number' } } } },
      insurancePrice: { type: 'number', minimum: 0 },
      days: { type: 'integer', minimum: 1 },
      pricePerDay: { type: 'number', minimum: 0 },
      currency: { type: 'string', pattern: '^[A-Z]{3}$' }
    },
    required: ['vehicleType','pricePerDay']
  };
  // compile
  ajv.validateAccommodation = ajv.compile(accommodationSchema);
  ajv.validateFlight = ajv.compile(flightSchema);
  ajv.validateCar = ajv.compile(carSchema);
} catch (e) {
  // AJV not available — will use fallback validators below
}

function isNonEmptyString(v, maxLen=1000){ return typeof v === 'string' && v.trim().length>0 && v.trim().length <= maxLen; }
function isEmail(v){ return typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function isCurrency(v){ return typeof v === 'string' && /^[A-Z]{3}$/.test((v||'').toUpperCase()); }

function errorsFromAjv(errs){
  if(!Array.isArray(errs)) return [];
  return errs.map(e => ({ field: e.instancePath ? e.instancePath.replace(/^\//,'') : e.params && e.params.missingProperty ? e.params.missingProperty : e.keyword, message: e.message }));
}

function validateQuoteData(data = {}, opts = { partial: false }){
  // Use AJV if available
  if(ajvValidateQuote){
    const ok = ajvValidateQuote(data);
    if(ok) return { valid: true, errors: [] };
    // If partial updates are allowed, filter errors about missing required properties
    let errs = errorsFromAjv(ajvValidateQuote.errors);
    if(opts.partial){ errs = errs.filter(e => !(e.field === 'clientName' && /must have required property/.test(e.message||''))); }
    return { valid: errs.length === 0, errors: errs };
  }
  // Fallback lightweight validation
  const errors = [];
  const { partial } = opts;
  if(!partial || Object.prototype.hasOwnProperty.call(data,'clientName')){
    if(!isNonEmptyString(data.clientName, 200)) errors.push({ field: 'clientName', message: 'clientName is required and must be a non-empty string (max 200 chars)' });
  }
  if(Object.prototype.hasOwnProperty.call(data,'clientEmail') && data.clientEmail){ if(!isEmail(data.clientEmail)) errors.push({ field:'clientEmail', message: 'invalid email' }); }
  if(Object.prototype.hasOwnProperty.call(data,'currency') && data.currency){ if(!isCurrency(data.currency)) errors.push({ field:'currency', message: 'currency must be 3-letter code' }); }
  if(!partial || Object.prototype.hasOwnProperty.call(data,'items')){
    if(!Array.isArray(data.items)) { errors.push({ field:'items', message: 'items must be an array' }); }
    else {
      if(data.items.length > 500) errors.push({ field:'items', message: 'too many items' });
      data.items.forEach((it, idx) => {
        if(!it) { errors.push({ field:`items[${idx}]`, message: 'item required' }); return; }
        if(!isNonEmptyString(it.title||it.name||'',200)) errors.push({ field:`items[${idx}].title`, message: 'title required' });
        const price = Number(it.unitPrice ?? it.price ?? it.amount ?? 0);
        if(!Number.isFinite(price) || price < 0) errors.push({ field:`items[${idx}].unitPrice`, message: 'unitPrice must be a non-negative number' });
        const qty = Number(it.quantity ?? it.qty ?? 1);
        if(!Number.isFinite(qty) || qty <= 0) errors.push({ field:`items[${idx}].quantity`, message: 'quantity must be a positive number' });
      });
    }
  }
  if(Object.prototype.hasOwnProperty.call(data,'taxRate')){ const tr = Number(data.taxRate||0); if(isNaN(tr) || tr < 0 || tr > 100) errors.push({ field:'taxRate', message: 'taxRate must be between 0 and 100' }); }
  if(Object.prototype.hasOwnProperty.call(data,'discountRate')){ const dr = Number(data.discountRate||0); if(isNaN(dr) || dr < 0 || dr > 100) errors.push({ field:'discountRate', message: 'discountRate must be between 0 and 100' }); }
  return { valid: errors.length === 0, errors };
}

function validateBookingData(data = {}){
  if(ajvValidateBooking){
    const ok = ajvValidateBooking(data);
    if(ok) return { valid: true, errors: [] };
    return { valid: false, errors: errorsFromAjv(ajvValidateBooking.errors) };
  }
  const errors = [];
  if(!Array.isArray(data.items) || data.items.length === 0) errors.push({ field:'items', message: 'items array required' });
  if(Object.prototype.hasOwnProperty.call(data,'currency') && data.currency && !isCurrency(data.currency)) errors.push({ field:'currency', message: 'currency must be 3-letter code' });
  if(Object.prototype.hasOwnProperty.call(data,'customer') && data.customer){ if(data.customer.email && !isEmail(data.customer.email)) errors.push({ field:'customer.email', message: 'invalid email' }); }
  if(Array.isArray(data.items)){
    data.items.forEach((it, idx)=>{
      const amt = Number(it.amount ?? it.price ?? 0);
      if(!Number.isFinite(amt) || amt < 0) errors.push({ field:`items[${idx}]`, message: 'amount/price required and must be >= 0' });
    });
  }
  return { valid: errors.length === 0, errors };
}

// Post message
app.post('/api/collab/:bookingId/message', authCheck, (req, res) => {
  const { authorRole, authorName, channel, content, visibility = 'all', mentions = [] } = req.body || {};
  if (!authorRole || !content) return res.status(400).json({ error: 'authorRole and content required' });
  const m = postMessage(req.params.bookingId, { authorRole, authorName, channel, content, visibility, mentions });
  saveStore();
  broadcast('message', { bookingId: req.params.bookingId, message: m }, m.visibility);
  res.status(201).json(m);
});

// Post attachment (metadata only)
app.post('/api/collab/:bookingId/attachment', authCheck, (req, res) => {
  const { name, size = 0, type = 'application/octet-stream', byRole = ROLES.agent, visibility = 'all', url } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name required' });
  const a = addAttachment(req.params.bookingId, { name, size, type, byRole, visibility, url });
  saveStore();
  broadcast('attachment', { bookingId: req.params.bookingId, attachment: a }, a.visibility);
  res.status(201).json(a);
});

// Mark thread as read for a role
app.post('/api/collab/:bookingId/read', authCheck, (req, res) => {
  const { role } = req.body || {};
  if (!role) return res.status(400).json({ error: 'role required' });
  const t = store[req.params.bookingId];
  if (!t) return res.status(404).json({ error: 'Not found' });
  t.unread[role] = 0;
  t.updatedAt = Date.now();
  saveStore();
  broadcast('read', { bookingId: req.params.bookingId, role });
  res.json({ ok: true });
});

// --- Providers toggles ---
// Structure example: [{ name: 'ticketmaster', enabled: true }, { name: 'seatgeek', enabled: true }]
function isProviderEnabled(name){
  if(!providers.length) return true; // default enabled if not configured
  const item = providers.find(p => (p.name||'').toLowerCase() === String(name||'').toLowerCase());
  return item ? !!item.enabled : true;
}
app.get('/api/providers', authCheck, (req, res) => {
  res.json({ ok: true, providers });
});
app.put('/api/providers', authCheck, (req, res) => {
  const list = Array.isArray(req.body) ? req.body : [];
  providers.length = 0; list.forEach(p => providers.push({ name: String(p.name||'').toLowerCase(), enabled: !!p.enabled }));
  saveProviders();
  res.json({ ok: true, providers });
});

// --- Quotes API (simple persistence in server store) ---
// GET /api/quotes -> list
// POST /api/quotes -> create
app.get('/api/quotes', authCheck, (req, res) => {
  const q = Array.isArray(store._quotes) ? store._quotes : [];
  res.json({ ok: true, quotes: q });
});

app.post('/api/quotes', authCheck, (req, res) => {
  try {
    const data = req.body || {};
    const v = validateQuoteData(data, { partial: false });
    if(!v.valid) return res.status(400).json({ error: 'validation_failed', details: v.errors });
    const id = cryptoRandom();
    const quote = {
      id,
      clientName: data.clientName || data.name || '',
      clientEmail: data.clientEmail || '',
      currency: data.currency || 'USD',
      items: Array.isArray(data.items) ? data.items : [],
      taxRate: Number(data.taxRate||0),
      discountRate: Number(data.discountRate||0),
      notes: data.notes || '',
      status: data.status || 'Draft',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    store._quotes = Array.isArray(store._quotes) ? store._quotes : [];
    store._quotes.unshift(quote);
    saveStore();
    res.status(201).json({ ok: true, quote });
  } catch (e) {
    console.error('create quote error', e);
    res.status(500).json({ error: 'server_error' });
  }
});

// Update a quote
app.put('/api/quotes/:id', authCheck, (req, res) => {
  try {
    const id = req.params.id;
    const list = Array.isArray(store._quotes) ? store._quotes : [];
    const idx = list.findIndex(q => q.id === id);
    if (idx === -1) return res.status(404).json({ error: 'not_found' });
    const existing = list[idx];
    const patch = req.body || {};
    const v = validateQuoteData(patch, { partial: true });
    if(!v.valid) return res.status(400).json({ error: 'validation_failed', details: v.errors });
    const updated = { ...existing, ...patch, updatedAt: Date.now() };
    list[idx] = updated;
    store._quotes = list;
    saveStore();
    res.json({ ok: true, quote: updated });
  } catch (e) {
    console.error('update quote error', e);
    res.status(500).json({ error: 'server_error' });
  }
});

// PATCH for partial updates
app.patch('/api/quotes/:id', authCheck, (req, res) => {
  try {
    const id = req.params.id;
    const list = Array.isArray(store._quotes) ? store._quotes : [];
    const idx = list.findIndex(q => q.id === id);
    if (idx === -1) return res.status(404).json({ error: 'not_found' });
    const existing = list[idx];
    const patch = req.body || {};
    const v = validateQuoteData(patch, { partial: true });
    if(!v.valid) return res.status(400).json({ error: 'validation_failed', details: v.errors });
    const updated = { ...existing, ...patch, updatedAt: Date.now() };
    list[idx] = updated;
    store._quotes = list;
    saveStore();
    res.json({ ok: true, quote: updated });
  } catch (e) {
    console.error('patch quote error', e);
    res.status(500).json({ error: 'server_error' });
  }
});

// Delete a quote
app.delete('/api/quotes/:id', authCheck, (req, res) => {
  try {
    const id = req.params.id;
    const list = Array.isArray(store._quotes) ? store._quotes : [];
    const idx = list.findIndex(q => q.id === id);
    if (idx === -1) return res.status(404).json({ error: 'not_found' });
    list.splice(idx, 1);
    store._quotes = list;
    saveStore();
    res.json({ ok: true });
  } catch (e) {
    console.error('delete quote error', e);
    res.status(500).json({ error: 'server_error' });
  }
});

// --- Events Aggregator (Ticketmaster, SeatGeek) ---
// Environment variables:
//  TICKETMASTER_API_KEY, SEATGEEK_CLIENT_ID
// Simple 5-minute cache keyed by query+location.
const eventsCache = new Map(); // key -> {at, data}
const EVENTS_TTL_MS = 5 * 60 * 1000;
function eventsKey(q, city, country){
  // Cache key ignores pagination; we cache the full list per (q,city,country) and slice per page
  return (q||'') + '|' + (city||'') + '|' + (country||'');
}
async function fetchJson(url){
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if(!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}
function normalizeTicketmaster(ev){
  return {
    id: ev.id,
    source: 'Ticketmaster',
    name: ev.name,
    url: ev.url,
    date: ev.dates?.start?.dateTime || ev.dates?.start?.localDate,
    venue: ev._embedded?.venues?.[0]?.name,
    city: ev._embedded?.venues?.[0]?.city?.name,
    country: ev._embedded?.venues?.[0]?.country?.name,
    categories: ev.classifications?.map(c => c.segment?.name).filter(Boolean) || [],
    image: (ev.images||[]).sort((a,b)=> (b.width||0)-(a.width||0))[0]?.url,
  };
}
function normalizeSeatGeek(ev){
  return {
    id: String(ev.id),
    source: 'SeatGeek',
    name: ev.title,
    url: ev.url,
    date: ev.datetime_utc,
    venue: ev.venue?.name,
    city: ev.venue?.city,
    country: ev.venue?.country,
    categories: ev.taxonomies?.map(t=>t.name).filter(Boolean) || [],
    image: ev.performers?.[0]?.image || null,
  };
}
async function searchEvents({ q, city, country }){
  const key = eventsKey(q, city, country);
  const now = Date.now();
  const cached = eventsCache.get(key);
  if(cached && (now - cached.at) < EVENTS_TTL_MS){ return cached.data; }
  const sources = [];
  const tmKey = process.env.TICKETMASTER_API_KEY || '';
  const sgId = process.env.SEATGEEK_CLIENT_ID || '';
  // ISO-2 fallback mapping for common countries
  const ISO2 = {
    // Americas
    'united states':'US','usa':'US','us':'US','canada':'CA','mexico':'MX','argentina':'AR','brazil':'BR','chile':'CL',
    // Europe
    'united kingdom':'GB','uk':'GB','england':'GB','france':'FR','italy':'IT','spain':'ES','germany':'DE','netherlands':'NL','belgium':'BE','switzerland':'CH','austria':'AT','portugal':'PT','ireland':'IE','poland':'PL','czechia':'CZ','hungary':'HU','greece':'GR','sweden':'SE','norway':'NO','denmark':'DK','finland':'FI',
    // Africa & Middle East
    'south africa':'ZA','nigeria':'NG','ghana':'GH','morocco':'MA','egypt':'EG','kenya':'KE','tanzania':'TZ','united arab emirates':'AE','uae':'AE','qatar':'QA','saudi arabia':'SA',
    // APAC
    'australia':'AU','new zealand':'NZ','japan':'JP','south korea':'KR','china':'CN','india':'IN','singapore':'SG','indonesia':'ID','malaysia':'MY','thailand':'TH','vietnam':'VN','philippines':'PH'
  };
  const countryNorm = country ? (ISO2[String(country).toLowerCase()] || country) : '';
  try {
    if(tmKey && isProviderEnabled('ticketmaster')){
      const params = new URLSearchParams({ apikey: tmKey, size: '10' });
      if(q) params.set('keyword', q);
      if(city) params.set('city', city);
      if(countryNorm) params.set('countryCode', countryNorm);
      const tmUrl = `https://app.ticketmaster.com/discovery/v2/events.json?${params}`;
      const j = await fetchJson(tmUrl);
      const list = (j._embedded?.events||[]).map(normalizeTicketmaster);
      sources.push(...list);
    }
  } catch(e){ console.warn('[events] ticketmaster failed', e.message); }
  try {
    if(sgId && isProviderEnabled('seatgeek')){
      const params = new URLSearchParams({ client_id: sgId, per_page: '10' });
      if(q) params.set('q', q);
      if(city) params.set('venue.city', city);
      if(countryNorm) params.set('venue.country', countryNorm);
      const sgUrl = `https://api.seatgeek.com/2/events?${params}`;
      const j = await fetchJson(sgUrl);
      const list = (j.events||[]).map(normalizeSeatGeek);
      sources.push(...list);
    }
  } catch(e){ console.warn('[events] seatgeek failed', e.message); }
  const data = sources;
  eventsCache.set(key, { at: now, data });
  return data;
}
// Basic rate limit per IP for events search
const EVENTS_WINDOW_MS = 60_000; const EVENTS_MAX = 30; const eventsRecent = new Map();
function eventsRateLimit(ip){
  const now = Date.now();
  const arr = eventsRecent.get(ip) || [];
  const fresh = arr.filter(e => now - e.ts < EVENTS_WINDOW_MS);
  fresh.push({ ts: now });
  eventsRecent.set(ip, fresh);
  return fresh.length <= EVENTS_MAX;
}

app.get('/api/events/search', authCheck, async (req, res) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    if(!eventsRateLimit(String(ip))){ return res.status(429).json({ error: 'rate_limited' }); }
    const q = (req.query.q||'').toString().trim();
    const city = (req.query.city||'').toString().trim();
    const country = (req.query.country||'').toString().trim(); // ISO country name or code depending on provider
    const page = Math.max(1, Number(req.query.page||'1')||1);
    const limit = Math.max(1, Math.min(50, Number(req.query.limit||'8')||8));
    const includePast = String(req.query.includePast||'') === '1';
    if(!q && !city && !country){ return res.status(400).json({ error: 'q, city, or country required' }); }
    let data = await searchEvents({ q, city, country });
    // Demo fallback when no provider keys present or demo flag set and no data returned
    const noKeys = !(process.env.TICKETMASTER_API_KEY||'') && !(process.env.SEATGEEK_CLIENT_ID||'');
    const wantDemo = String(req.query.demo||'') === '1' || process.env.DEMO_EVENTS === '1' || noKeys;
    if((!Array.isArray(data) || data.length===0) && wantDemo){
      data = getDemoEvents({ q, city, country });
    }
    // Optionally filter out past events (based on event.date)
    if(Array.isArray(data) && !includePast){
      const now = Date.now();
      data = data.filter(e => {
        if(!e || !e.date) return true; // keep if no date
        const t = Date.parse(e.date);
        if(Number.isNaN(t)) return true; // unknown format -> keep
        return t >= now - 24*60*60*1000; // keep events from yesterday onwards
      });
    }
    // Per-provider counts (after filtering)
    const countsBySource = {};
    if(Array.isArray(data)){
      for(const ev of data){ const s = (ev && ev.source) ? String(ev.source) : 'Unknown'; countsBySource[s] = (countsBySource[s]||0) + 1; }
    }
    const total = Array.isArray(data) ? data.length : 0;
    const start = (page-1) * limit;
    const end = start + limit;
    const pageItems = (Array.isArray(data) ? data.slice(start, end) : []);
    res.json({ ok: true, events: pageItems, page, limit, total, hasMore: end < total, countsBySource });
  } catch(e){
    res.status(500).json({ error: 'failed', message: e.message });
  }
});

// --- Demo Events (fallback without provider keys) ---
function getDemoEvents({ q = '', city = '', country = '' } = {}){
  const lib = [
    // Cape Town
    { id:'ct_7s', source:'Demo', name:'Sunset Beach Concert', url:'#', date:'2025-11-14', venue:'Sea Point Pavilion', city:'Cape Town', country:'ZA', categories:['Music'] },
    { id:'ct_15s', source:'Demo', name:'Cape Town Rugby Derby', url:'#', date:'2025-12-02', venue:'DHL Stadium', city:'Cape Town', country:'ZA', categories:['Sports'] },
    // Durban (KZN)
    { id:'dbn_10', source:'Demo', name:'Durban Jazz on the Beach', url:'#', date:'2025-10-18', venue:'North Beach Amphitheatre', city:'Durban', country:'ZA', categories:['Music'] },
    { id:'dbn_11', source:'Demo', name:'Sharks Home Rugby Match', url:'#', date:'2025-11-08', venue:'Hollywoodbets Kings Park', city:'Durban', country:'ZA', categories:['Sports'] },
    // Howick / Midlands (KZN)
    { id:'hwk_20', source:'Demo', name:'Midlands Craft & Food Fair', url:'#', date:'2025-10-26', venue:'Howick Village Green', city:'Howick', country:'ZA', categories:['Festival'] },
    { id:'hwk_21', source:'Demo', name:'Howick Falls Trail Run', url:'#', date:'2025-11-16', venue:'Howick Falls', city:'Howick', country:'ZA', categories:['Outdoors'] },
  // Port Shepstone / South Coast
  { id:'ps_30', source:'Demo', name:'South Coast Summer Festival', url:'#', date:'2025-12-10', venue:'Port Shepstone Main Beach', city:'Port Shepstone', country:'ZA', categories:['Festival'] },
  { id:'mgt_31', source:'Demo', name:'Margate Beach Music Night', url:'#', date:'2025-11-22', venue:'Margate Amphitheatre', city:'Margate', country:'ZA', categories:['Music'] },
    // New York
    { id:'nyc_88', source:'Demo', name:'Broadway Classics Night', url:'#', date:'2025-10-21', venue:'Gershwin Theatre', city:'New York', country:'US', categories:['Theatre'] },
    { id:'nyc_91', source:'Demo', name:'Knicks vs Celtics', url:'#', date:'2025-11-05', venue:'Madison Square Garden', city:'New York', country:'US', categories:['Sports'] },
    // Paris
    { id:'par_22', source:'Demo', name:'Paris Jazz Festival', url:'#', date:'2025-07-08', venue:'Parc Floral', city:'Paris', country:'FR', categories:['Music'] },
    { id:'par_23', source:'Demo', name:'Ligue 1: PSG Home Game', url:'#', date:'2025-09-30', venue:'Parc des Princes', city:'Paris', country:'FR', categories:['Sports'] },
    // Tokyo
    { id:'tky_31', source:'Demo', name:'Shibuya Street Music', url:'#', date:'2025-10-12', venue:'Shibuya Crossing', city:'Tokyo', country:'JP', categories:['Music'] },
    { id:'tky_33', source:'Demo', name:'Baseball League Night', url:'#', date:'2025-10-28', venue:'Tokyo Dome', city:'Tokyo', country:'JP', categories:['Sports'] },
    // London
    { id:'ldn_40', source:'Demo', name:'Royal Philharmonic Gala', url:'#', date:'2025-11-02', venue:'Royal Albert Hall', city:'London', country:'GB', categories:['Music'] },
    { id:'ldn_41', source:'Demo', name:'Premier League Derby', url:'#', date:'2025-11-19', venue:'Emirates Stadium', city:'London', country:'GB', categories:['Sports'] },
  ];
  const term = String(q||'').toLowerCase();
  let base = lib;
  if(city){ base = base.filter(e => (e.city||'').toLowerCase() === city.toLowerCase()); }
  if(country){ base = base.filter(e => (e.country||'').toLowerCase() === String(country).toLowerCase()); }
  if(term){ base = base.filter(e => (e.name||'').toLowerCase().includes(term) || (e.venue||'').toLowerCase().includes(term)); }
  return base.slice(0, 8);
}

// WhatsApp webhook stub
app.post('/webhook/whatsapp', authCheck, (req, res) => {
  // Accept flexible payloads; minimal: { bookingId, fromName, content }
  const { bookingId, fromName = 'Client', content } = req.body || {};
  if (!bookingId || !content) return res.status(400).json({ error: 'bookingId and content required' });
  const m = postMessage(bookingId, { authorRole: ROLES.client, authorName: fromName, channel: 'whatsapp', content, visibility: 'all' });
  saveStore();
  broadcast('message', { bookingId, message: m }, m.visibility);
  res.json({ ok: true, logged: m });
});

// --- Providers verification stubs ---

app.post('/api/providers/upload', authCheck, (req, res) => {
  const { providerId, name, docType, fileName, fileSize, expiresAt } = req.body || {};
  if (!providerId || !docType || !fileName) return res.status(400).json({ error: 'providerId, docType, fileName required' });
  let p = providers.find(x => x.id === providerId);
  if (!p) { p = { id: providerId, name: name || `Provider ${providerId}`, verified: false, documents: [] }; providers.push(p); }
  const exp = expiresAt ? Number(expiresAt) : undefined;
  const doc = { id: cryptoRandom(), docType, fileName, fileSize: Number(fileSize||0), uploadedAt: Date.now(), status: 'pending', expiresAt: exp };
  p.documents.push(doc);
  saveProviders();
  res.status(201).json({ ok: true, provider: p, document: doc });
});

app.post('/api/providers/verify', authCheck, (req, res) => {
  const { providerId, verified = true } = req.body || {};
  const p = providers.find(x => x.id === providerId);
  if (!p) return res.status(404).json({ error: 'provider not found' });
  p.verified = !!verified;
  p.verifiedAt = Date.now();
  saveProviders();
  res.json({ ok: true, provider: p });
});

/**
 * AI MVP: Accept a natural language prompt and return a heuristic itinerary draft.
 * POST /api/ai/itinerary { prompt }
 * Response: { ok, data }
 */
app.post('/api/ai/itinerary', authCheck, async (req, res) => {
  const t0 = Date.now();
  const { prompt } = req.body || {};
  if (!prompt || !prompt.toString().trim()) return res.status(400).json({ error: 'prompt required' });
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  if(!aiRateLimit(ip)) return res.status(429).json({ error: 'rate_limited' });
  const key = cacheKey(prompt);
  const cached = getCached(key);
  if(cached){ aiMetrics.cacheHits++; aiMetrics.total++; aiMetrics.latencyMs.gen.push(Date.now()-t0); return res.json({ ok: true, data: cached, cached: true }); }
  let parsed = parsePrompt(prompt);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  if(HYBRID_LLM && llmAdapter && typeof llmAdapter.enhance==='function'){
    try { parsed = await llmAdapter.enhance(parsed); if(parsed.meta && parsed.meta.tokenUsage){ aiMetrics.tokens.prompt+=parsed.meta.tokenUsage.prompt; aiMetrics.tokens.completion+=parsed.meta.tokenUsage.completion; aiMetrics.tokens.total+=parsed.meta.tokenUsage.total; if(parsed.meta.estimatedCostUsd) aiMetrics.costUsd+=parsed.meta.estimatedCostUsd; } } catch(e){ parsed.meta = { ...(parsed.meta||{}), llmEnhanced:false, llmError: e.message }; }
  }
  setCached(key, parsed); recordAnalytics(prompt, parsed);
  aiMetrics.cacheMiss++; aiMetrics.total++;
  aiMetrics.latencyMs.gen.push(Date.now()-t0);
  if(aiMetrics.latencyMs.gen.length>200) aiMetrics.latencyMs.gen.shift();
  res.json({ ok: true, data: parsed, cached: false });
});

/**
 * Flight intent extraction: turn natural language into a structured flight query
 * POST /api/ai/flight { prompt }
 * Response: { ok, data: { from:{city,code}, to:{city,code}, date:'YYYY-MM-DD', time:'HH:mm'|null, pax:number, cabin:string } }
 */
app.post('/api/ai/flight', authCheck, (req, res) => {
  const { prompt } = req.body || {};
  if(!prompt || !prompt.toString().trim()) return res.status(400).json({ error:'prompt required' });
  const parsed = parseFlightRequest(prompt);
  if(parsed.error && parsed.error !== 'not_flight_intent') return res.status(400).json({ error: parsed.error });
  if(parsed.error === 'not_flight_intent') return res.status(422).json({ error: 'no_flight_intent' });
  return res.json({ ok:true, data: parsed });
});

// Unified intent parsing endpoint
app.post('/api/ai/intent', authCheck, (req, res) => {
  const { prompt } = req.body || {};
  if(!prompt || !prompt.toString().trim()) return res.status(400).json({ error:'prompt required' });
  try {
    const parsed = parseIntent(prompt);
    return res.json({ ok: true, data: parsed });
  } catch(e){
    return res.status(500).json({ error: 'intent_parse_failed' });
  }
});

/**
 * Streaming SSE version: emits phased events for UI progressive rendering.
 * GET /api/ai/itinerary/stream?prompt=...
 * Events: parse -> plan -> pricing -> done
 */
app.get('/api/ai/itinerary/stream', authCheck, async (req, res) => {
  const prompt = (req.query.prompt || '').toString();
  if (!prompt.trim()) { res.status(400).json({ error: 'prompt required' }); return; }
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  if(!aiRateLimit(ip)) { res.status(429).json({ error: 'rate_limited' }); return; }
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  const key = cacheKey(prompt);
  let parsed = getCached(key);
  if(parsed){ aiMetrics.cacheHits++; aiMetrics.total++; }
  if(!parsed){
    parsed = parsePrompt(prompt);
    if(!parsed.error){
      if(HYBRID_LLM && llmAdapter && typeof llmAdapter.enhance==='function'){
        try { parsed = await llmAdapter.enhance(parsed); if(parsed.meta && parsed.meta.tokenUsage){ aiMetrics.tokens.prompt+=parsed.meta.tokenUsage.prompt; aiMetrics.tokens.completion+=parsed.meta.tokenUsage.completion; aiMetrics.tokens.total+=parsed.meta.tokenUsage.total; if(parsed.meta.estimatedCostUsd) aiMetrics.costUsd+=parsed.meta.estimatedCostUsd; } } catch(e){ parsed.meta = { ...(parsed.meta||{}), llmEnhanced:false, llmError: e.message }; }
      }
      setCached(key, parsed); recordAnalytics(prompt, parsed); aiMetrics.cacheMiss++; aiMetrics.total++; }
  }
  if (parsed.error) {
    res.write(`event: error\ndata: ${JSON.stringify({ error: parsed.error })}\n\n`);
    res.end();
    return;
  }
  // Phase 1: parse basics (destinations, dates, travelers, budget, interests)
  const base = {
    original: parsed.original,
    destinations: parsed.destinations,
    startDate: parsed.startDate,
    endDate: parsed.endDate,
    nights: parsed.nights,
    travelers: parsed.travelers,
    budget: parsed.budget,
    interests: parsed.interests,
    meta: parsed.meta
  };
  res.write(`event: parse\ndata: ${JSON.stringify(base)}\n\n`);
  // Phase 2: itinerary plan
  res.write(`event: plan\ndata: ${JSON.stringify({ itinerary: parsed.itinerary })}\n\n`);
  // Simulate slight delay for realism (minimal, not blocking loop using setTimeout chain)
  setTimeout(() => {
    res.write(`event: pricing\ndata: ${JSON.stringify({ pricing: parsed.pricing })}\n\n`);
    res.write(`event: done\ndata: {"ok":true}\n\n`);
    res.end();
  }, 30);
});

// --- Refine endpoint: apply simple text instructions to adjust interests or nights ---
// POST /api/ai/itinerary/refine { prompt, instructions }
// Heuristic: if instructions mention 'add X' where X is known interest, append if not present.
// If instructions include pattern "(\d+) more nights" adjust nights and regenerate itinerary & pricing.
app.post('/api/ai/itinerary/refine', authCheck, async (req, res) => {
  const t0 = Date.now();
  const { prompt, instructions } = req.body || {};
  if(!prompt || !prompt.toString().trim()) return res.status(400).json({ error: 'prompt required' });
  if(!instructions || !instructions.toString().trim()) return res.status(400).json({ error: 'instructions required' });
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  if(!aiRateLimit(ip)) return res.status(429).json({ error: 'rate_limited' });
  let base = parsePrompt(prompt);
  if(base.error) return res.status(400).json({ error: base.error });
  const text = instructions.toLowerCase();
  // Add interests
  const interestLex = ['beach','museum','food','adventure','luxury','relax','culture','nightlife','hiking','family','romantic','history','art','shopping'];
  interestLex.forEach(k=>{ if(text.includes('add '+k) && !base.interests.includes(k)) base.interests.push(k); });
  // Nights adjustment
  const m = text.match(/(\d+)\s+(?:more|additional)\s+nights?/);
  if(m){
    const extra = Number(m[1]);
    if(Number.isFinite(extra) && extra>0){ base.nights = Math.min(30, base.nights + extra); }
  }
  // Regenerate itinerary & pricing with updated nights/interests
  const { buildItinerary, roughPricing } = require('./aiParser');
  // expose helper functions by adding them to module exports (ensured below modification if not present)
  if(typeof buildItinerary === 'function'){ base.itinerary = buildItinerary(base.destinations, base.nights, base.interests); }
  if(typeof roughPricing === 'function'){ base.pricing = roughPricing(base.nights, base.travelers, base.budget); }
  aiMetrics.refine++; aiMetrics.total++; aiMetrics.latencyMs.refine.push(Date.now()-t0); if(aiMetrics.latencyMs.refine.length>200) aiMetrics.latencyMs.refine.shift();
  if(HYBRID_LLM && llmAdapter && typeof llmAdapter.enhance==='function'){
    try { base = await llmAdapter.enhance(base); if(base.meta && base.meta.tokenUsage){ aiMetrics.tokens.prompt+=base.meta.tokenUsage.prompt; aiMetrics.tokens.completion+=base.meta.tokenUsage.completion; aiMetrics.tokens.total+=base.meta.tokenUsage.total; if(base.meta.estimatedCostUsd) aiMetrics.costUsd+=base.meta.estimatedCostUsd; } } catch(e){ base.meta = { ...(base.meta||{}), llmEnhanced:false, llmError: e.message }; }
  }
  res.json({ ok: true, data: base });
});

// Persist AI draft: { prompt, data } -> returns id (scoped by tokenHash if auth enabled)
app.post('/api/ai/draft', authCheck, (req, res) => {
  const { prompt, data } = req.body || {};
  if(!prompt || !data) return res.status(400).json({ error: 'prompt and data required' });
  const id = cryptoRandom();
  const tokenHash = tokenHashFromReq(req);
  aiDrafts[id] = { id, prompt, data, createdAt: Date.now(), tokenHash };
  saveDrafts();
  aiMetrics.drafts++;
  res.status(201).json({ ok: true, id, scoped: !!tokenHash });
});

// Retrieve AI draft
app.get('/api/ai/draft/:id', authCheck, (req, res) => {
  const d = aiDrafts[req.params.id];
  if(!d) return res.status(404).json({ error: 'not found' });
  const tokenHash = tokenHashFromReq(req);
  if(d.tokenHash && tokenHash !== d.tokenHash) return res.status(403).json({ error:'forbidden' });
  res.json({ ...d, scoped: !!d.tokenHash });
});

app.get('/api/ai/metrics', authCheck, (req, res) => {
  const avg = (arr)=> arr.length? Math.round(arr.reduce((a,b)=>a+b,0)/arr.length):0;
  const strategy = AI_BUCKET_CAPACITY>0 ? 'token_bucket' : 'sliding_window';
  const rl = strategy==='token_bucket' ? { capacity: AI_BUCKET_CAPACITY, refillMs: AI_BUCKET_REFILL_MS } : { windowMs: AI_RATE_LIMIT_WINDOW_MS, max: AI_RATE_LIMIT_MAX };
  const latencyPercentiles = {
    gen: { p50: percentile(aiMetrics.latencyMs.gen,50), p95: percentile(aiMetrics.latencyMs.gen,95), p99: percentile(aiMetrics.latencyMs.gen,99) },
    refine: { p50: percentile(aiMetrics.latencyMs.refine,50), p95: percentile(aiMetrics.latencyMs.refine,95), p99: percentile(aiMetrics.latencyMs.refine,99) }
  };
  res.json({ ...aiMetrics, avgLatencyMs: { gen: avg(aiMetrics.latencyMs.gen), refine: avg(aiMetrics.latencyMs.refine) }, latencyPercentiles, uptimeSec: Math.round(process.uptime()), rateLimit: { strategy, ...rl } });
});

app.get('/api/ai/metrics/history', authCheck, (req,res)=>{
  res.json({ samples: metricsHistory });
});

// Download raw metrics history (JSON Lines if file exists, else current in-memory snapshots)
app.get('/api/ai/metrics/history/download', authCheck, (req,res)=>{
  res.setHeader('Content-Type','application/octet-stream');
  res.setHeader('Content-Disposition','attachment; filename="ai_metrics_history.jsonl"');
  try {
    if(fs.existsSync(AI_METRICS_HISTORY_FILE)){
      const stream = fs.createReadStream(AI_METRICS_HISTORY_FILE);
      stream.pipe(res);
    } else {
      // Fallback: emit current snapshots as JSONL
      const lines = metricsHistory.map(s=>JSON.stringify(s)).join('\n');
      res.send(lines);
    }
  } catch(e){
    res.status(500).end(JSON.stringify({ error:'download_failed', message:e.message }));
  }
});

// AI configuration/introspection
app.get('/api/ai/config', authCheck, (req,res)=>{
  const strategy = AI_BUCKET_CAPACITY>0 ? 'token_bucket' : 'sliding_window';
  const rateLimit = strategy==='token_bucket' ? {
    strategy,
    bucketCapacity: AI_BUCKET_CAPACITY,
    bucketRefillMs: AI_BUCKET_REFILL_MS
  } : {
    strategy,
    windowMs: AI_RATE_LIMIT_WINDOW_MS,
    maxPerWindow: AI_RATE_LIMIT_MAX
  };
  const llmProvider = (process.env.LLM_PROVIDER || (process.env.AZURE_OPENAI_API_KEY ? 'azure-openai' : (process.env.OPENAI_API_KEY ? 'openai' : 'stub')));
  const llmModel = process.env.OPENAI_MODEL || process.env.AZURE_OPENAI_DEPLOYMENT || undefined;
  res.json({ hybridLLM: HYBRID_LLM, rateLimit, metricsHistoryMax: METRICS_HISTORY_MAX, snapshotIntervalMs: 10_000, llm: { provider: llmProvider, model: llmModel } });
});

// --- AI Sessions ---
app.post('/api/ai/session', authCheck, async (req, res) => {
  const { prompt } = req.body || {};
  if(!prompt || !prompt.trim()) return res.status(400).json({ error: 'prompt required' });
  const id = cryptoRandom();
  let parsed = parsePrompt(prompt);
  if(parsed.error) return res.status(400).json({ error: parsed.error });
  if(HYBRID_LLM && llmAdapter && typeof llmAdapter.enhance==='function'){
    try { parsed = await llmAdapter.enhance(parsed); if(parsed.meta && parsed.meta.tokenUsage){ aiMetrics.tokens.prompt+=parsed.meta.tokenUsage.prompt; aiMetrics.tokens.completion+=parsed.meta.tokenUsage.completion; aiMetrics.tokens.total+=parsed.meta.tokenUsage.total; if(parsed.meta.estimatedCostUsd) aiMetrics.costUsd+=parsed.meta.estimatedCostUsd; } } catch(e){ parsed.meta = { ...(parsed.meta||{}), llmEnhanced:false, llmError: e.message }; }
  }
  const tokenHash = tokenHashFromReq(req);
  aiSessions[id] = { id, prompt, createdAt: Date.now(), tokenHash, history: [{ type:'parse', data: parsed, at: Date.now() }] };
  res.status(201).json({ ok: true, id, data: parsed, scoped: !!tokenHash });
});

app.post('/api/ai/session/:id/refine', authCheck, async (req, res) => {
  const t0 = Date.now();
  const s = aiSessions[req.params.id];
  if(!s) return res.status(404).json({ error: 'session not found' });
  const tokenHash = tokenHashFromReq(req);
  if(s.tokenHash && tokenHash !== s.tokenHash) return res.status(403).json({ error:'forbidden' });
  const { instructions } = req.body || {};
  if(!instructions || !instructions.trim()) return res.status(400).json({ error: 'instructions required' });
  // Base is last data snapshot
  const base = JSON.parse(JSON.stringify(s.history[s.history.length-1].data));
  const text = instructions.toLowerCase();
  const interestLex = ['beach','museum','food','adventure','luxury','relax','culture','nightlife','hiking','family','romantic','history','art','shopping'];
  interestLex.forEach(k=>{ if(text.includes('add '+k) && !base.interests.includes(k)) base.interests.push(k); });
  const m = text.match(/(\d+)\s+(?:more|additional)\s+nights?/);
  if(m){ const extra = Number(m[1]); if(Number.isFinite(extra)&&extra>0) base.nights = Math.min(30, base.nights + extra); }
  const { buildItinerary, roughPricing } = require('./aiParser');
  if(typeof buildItinerary==='function') base.itinerary = buildItinerary(base.destinations, base.nights, base.interests);
  if(typeof roughPricing==='function') base.pricing = roughPricing(base.nights, base.travelers, base.budget);
  s.history.push({ type:'refine', data: base, instructions, at: Date.now() });
  aiMetrics.refine++; aiMetrics.total++; aiMetrics.latencyMs.refine.push(Date.now()-t0); if(aiMetrics.latencyMs.refine.length>200) aiMetrics.latencyMs.refine.shift();
  if(HYBRID_LLM && llmAdapter && typeof llmAdapter.enhance==='function'){
    try { base = await llmAdapter.enhance(base); if(base.meta && base.meta.tokenUsage){ aiMetrics.tokens.prompt+=base.meta.tokenUsage.prompt; aiMetrics.tokens.completion+=base.meta.tokenUsage.completion; aiMetrics.tokens.total+=base.meta.tokenUsage.total; if(base.meta.estimatedCostUsd) aiMetrics.costUsd+=base.meta.estimatedCostUsd; } s.history[s.history.length-1].data = base; } catch(e){ base.meta = { ...(base.meta||{}), llmEnhanced:false, llmError: e.message }; }
  }
  res.json({ ok: true, data: base });
});

app.get('/api/ai/session/:id', authCheck, (req, res) => {
  const s = aiSessions[req.params.id];
  if(!s) return res.status(404).json({ error: 'session not found' });
  const tokenHash = tokenHashFromReq(req);
  if(s.tokenHash && tokenHash !== s.tokenHash) return res.status(403).json({ error:'forbidden' });
  res.json({ ...s, scoped: !!s.tokenHash });
});

// Robust listen with fallback when port is already in use
function listenWithFallback(startPort, maxTries = 5) {
  let attempt = 0;
  function tryListen(port) {
    const server = app.listen(port, () => {
      console.log(`[collab-api] listening on http://localhost:${port}`);
    });
    server.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE' && attempt < maxTries - 1) {
        const next = port + 1;
        attempt += 1;
        if (attempt === 1) {
          console.warn(`[collab-api] Port ${port} in use. Trying ${next}... (set PORT to override)`);
        } else {
          console.warn(`[collab-api] Port ${port} in use. Trying ${next}...`);
        }
        tryListen(next);
      } else {
        console.error('[collab-api] Failed to start server:', err && err.message ? err.message : err);
        process.exit(1);
      }
    });
  }
  tryListen(Number(startPort));
}

// Only start the server when running this file directly.
if (require.main === module) {
  listenWithFallback(PORT, 6);
}

// Export the app for testing/integration usage
module.exports = app;

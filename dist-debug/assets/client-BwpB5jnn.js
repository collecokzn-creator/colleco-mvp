const STORAGE_KEY = "payments:v1";
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { sessions: {}, payments: [] };
  } catch {
    return { sessions: {}, payments: [] };
  }
}
function save(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
  }
}
function computeFees(items = [], currency = "USD") {
  const subtotal = items.reduce((s, it) => s + Math.max(0, Number(it.amount || 0)), 0);
  const paymentProcessor = Math.round(subtotal * 0.029 * 100) / 100 + 0.3;
  const platformFee = Math.round(subtotal * 0.05 * 100) / 100;
  const taxes = Math.round(subtotal * 0.15 * 100) / 100;
  const total = Math.round((subtotal + paymentProcessor + platformFee + taxes) * 100) / 100;
  return { currency, subtotal, paymentProcessor, platformFee, taxes, total };
}
function createMockCheckout({ items = [], currency = "USD", metadata = {} }) {
  const state = load();
  const sessionId = Math.random().toString(36).slice(2);
  state.sessions[sessionId] = { id: sessionId, items, currency, metadata, createdAt: Date.now(), status: "open" };
  save(state);
  const params = new URLSearchParams({ sessionId });
  return { sessionId, checkoutUrl: `/payment-success?${params.toString()}` };
}
function confirmMockPayment(sessionId) {
  const state = load();
  const s = state.sessions[sessionId];
  if (!s) return null;
  s.status = "paid";
  const fees = computeFees(s.items, s.currency);
  const payment = { id: sessionId, amount: fees.total, currency: s.currency, items: s.items, metadata: s.metadata, paidAt: Date.now() };
  state.payments.push(payment);
  save(state);
  return payment;
}
function getPayment(sessionId) {
  const state = load();
  return state.payments.find((p) => p.id === sessionId) || null;
}
function listPayments() {
  return load().payments || [];
}
function totalPaid() {
  return (load().payments || []).reduce((s, p) => s + (p.amount || 0), 0);
}
const BASE_URL = typeof window !== "undefined" ? `${window.location.origin}/api` : "http://localhost:4000/api";
async function createBooking(data) {
  const res = await fetch(`${BASE_URL}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const ct = res.headers.get("content-type") || "";
    const body = ct.includes("application/json") ? await res.json() : await res.text();
    const err = new Error("Failed to create booking");
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return res.json();
}
async function getBooking(id) {
  if (!id) throw new Error("Missing booking id");
  const res = await fetch(`${BASE_URL}/bookings/${encodeURIComponent(id)}`);
  if (!res.ok) {
    const body = await res.text();
    const err = new Error("Failed to fetch booking");
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return res.json();
}
export {
  getPayment as a,
  createBooking as b,
  confirmMockPayment as c,
  createMockCheckout as d,
  getBooking as g,
  listPayments as l,
  totalPaid as t
};
//# sourceMappingURL=client-BwpB5jnn.js.map

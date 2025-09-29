const STORAGE_KEY = 'payments:v1';

function load() {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : { sessions: {}, payments: [] }; }
  catch { return { sessions: {}, payments: [] }; }
}
function save(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

export function computeFees(items = [], currency = 'USD') {
  const subtotal = items.reduce((s, it) => s + Math.max(0, Number(it.amount || 0)), 0);
  const paymentProcessor = Math.round(subtotal * 0.029 * 100) / 100 + 0.3;
  const platformFee = Math.round(subtotal * 0.05 * 100) / 100;
  const taxes = Math.round(subtotal * 0.15 * 100) / 100;
  const total = Math.round((subtotal + paymentProcessor + platformFee + taxes) * 100) / 100;
  return { currency, subtotal, paymentProcessor, platformFee, taxes, total };
}

export function createMockCheckout({ items = [], currency = 'USD', metadata = {} }) {
  const state = load();
  const sessionId = Math.random().toString(36).slice(2);
  state.sessions[sessionId] = { id: sessionId, items, currency, metadata, createdAt: Date.now(), status: 'open' };
  save(state);
  const params = new URLSearchParams({ sessionId });
  return { sessionId, checkoutUrl: `/payment-success?${params.toString()}` };
}

export function confirmMockPayment(sessionId) {
  const state = load();
  const s = state.sessions[sessionId];
  if (!s) return null;
  s.status = 'paid';
  const fees = computeFees(s.items, s.currency);
  const payment = { id: sessionId, amount: fees.total, currency: s.currency, items: s.items, metadata: s.metadata, paidAt: Date.now() };
  state.payments.push(payment);
  save(state);
  return payment;
}

export function getPayment(sessionId) {
  const state = load();
  return state.payments.find(p => p.id === sessionId) || null;
}

export function listPayments() {
  return load().payments || [];
}

export function totalPaid() {
  return (load().payments || []).reduce((s, p) => s + (p.amount || 0), 0);
}

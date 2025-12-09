// Communication Audit Trail Utility
// Logs all communication events for transparency and support

const AUDIT_KEY = 'commAuditTrail:v1';

export function logCommEvent(event) {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    const trail = raw ? JSON.parse(raw) : [];
    trail.push({ ...event, ts: Date.now() });
    localStorage.setItem(AUDIT_KEY, JSON.stringify(trail));
  } catch (e) {
    console.error('Failed to log communication event', e);
  }
}

export function getCommAuditTrail() {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load communication audit trail', e);
    return [];
  }
}

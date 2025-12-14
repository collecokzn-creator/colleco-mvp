/**
 * Lightweight safe logging utilities used by server routes/tests.
 * - sanitizeLog: returns a one-line, truncated string safe for logging (masks tokens)
 * - sanitizeError: extracts safe message from Error objects
 */

function maskSecrets(str) {
  if (!str || typeof str !== 'string') return '';
  // Mask patterns that look like tokens/keys (long alphanumeric sequences)
  return str.replace(/([A-Za-z0-9_-]{8,})/g, (m) => {
    if (m.length <= 8) return m;
    return m.slice(0, 4) + '...' + m.slice(-4);
  });
}

function sanitizeLog(input) {
  if (!input) return '';
  let s = String(input);
  // Replace newlines and excessive whitespace
  s = s.replace(/\s+/g, ' ').trim();
  // Mask obvious secrets
  s = maskSecrets(s);
  // Truncate to reasonable length
  if (s.length > 200) s = s.slice(0, 200) + '...';
  return s;
}

function sanitizeError(err) {
  if (!err) return '';
  if (typeof err === 'string') return sanitizeLog(err);
  if (err instanceof Error) return sanitizeLog(err.message || err.stack);
  try { return sanitizeLog(JSON.stringify(err)); } catch (e) { return '' }
}

module.exports = {
  sanitizeLog,
  sanitizeError,
};

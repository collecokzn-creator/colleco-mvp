// Small helper to sanitize values before logging to avoid log-injection
function sanitizeLog(value, max = 1000) {
  if (value === undefined || value === null) return '';
  let s = String(value);
  s = s.replace(/\r?\n+/g, ' ');
  if (s.length > max) s = s.slice(0, max) + '...';
  return s;
}

module.exports = { sanitizeLog };

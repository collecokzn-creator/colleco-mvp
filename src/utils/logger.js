/* eslint-disable no-console */
// Lightweight logger helper with performance monitoring
// Keep console statements confined to this file so ESLint warnings don't appear
// across the codebase. Logs are only emitted outside of production builds.

const isDev = process.env.NODE_ENV !== 'production';
const performanceMarkers = new Map();

export function dbg(...args) {
  if (isDev) {
    // console usage intentionally allowed in this helper
    // eslint-disable-next-line no-console
    console.log(...args);
  }
}

/**
 * Mark a performance checkpoint
 * @param {string} name - Unique name for this marker
 * @example markStart('api-fetch')
 */
export function markStart(name) {
  if (isDev && typeof performance !== 'undefined' && performance.mark) {
    performance.mark(`${name}-start`);
  }
  performanceMarkers.set(`${name}-start`, Date.now());
}

/**
 * Measure time since markStart was called
 * @param {string} name - Name matching the markStart call
 * @param {boolean} log - Whether to log the result (default: true)
 * @returns {number} Duration in milliseconds
 * @example const duration = markEnd('api-fetch'); // logs: "api-fetch: 245ms"
 */
export function markEnd(name, log = true) {
  const startKey = `${name}-start`;
  const startTime = performanceMarkers.get(startKey);
  
  if (!startTime) {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.warn(`[logger] No marker found for "${name}"`);
    }
    return 0;
  }
  
  const duration = Date.now() - startTime;
  performanceMarkers.delete(startKey);
  
  if (isDev && typeof performance !== 'undefined' && performance.mark && performance.measure) {
    try {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
    } catch (e) {
      // Silently ignore if marks don't exist
    }
  }
  
  if (log && isDev) {
    // eslint-disable-next-line no-console
    console.log(`[${name}] ${duration}ms`);
  }
  
  return duration;
}

/**
 * Log a warning message
 * @param {string} message - Warning message
 * @param {*} data - Optional additional data to log
 */
export function warn(message, data = null) {
  if (isDev) {
    // eslint-disable-next-line no-console
    console.warn(`[⚠️  warning] ${message}`, data);
  }
}

/**
 * Log an error message
 * @param {string} message - Error message
 * @param {Error} error - Optional error object
 */
export function error(message, error = null) {
  if (isDev) {
    // eslint-disable-next-line no-console
    console.error(`[❌ error] ${message}`, error);
  }
}

/**
 * Log an info message
 * @param {string} message - Info message
 * @param {*} data - Optional additional data
 */
export function info(message, data = null) {
  if (isDev) {
    // eslint-disable-next-line no-console
    console.info(`[ℹ️  info] ${message}`, data);
  }
}

/**
 * Get all active performance markers for debugging
 * @returns {Array} Array of {name, duration} objects
 */
export function getActiveMarkers() {
  const now = Date.now();
  return Array.from(performanceMarkers.entries()).map(([name, time]) => ({
    name: name.replace('-start', ''),
    duration: now - time,
  }));
}

/**
 * Clear all performance markers
 */
export function clearMarkers() {
  performanceMarkers.clear();
}

export default { dbg, markStart, markEnd, warn, error, info, getActiveMarkers, clearMarkers };

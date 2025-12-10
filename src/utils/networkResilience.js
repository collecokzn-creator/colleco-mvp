/**
 * Network Resilience & Retry Strategy
 * Handles network errors, retries, and exponential backoff
 */

const isDev = process.env.NODE_ENV !== 'production';
import logger from './logger';

const DEFAULT_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 500,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  timeoutMs: 30000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

/**
 * Check if a status code is retryable
 * @param {number} status - HTTP status code
 * @param {Array} retryableStatuses - List of retryable status codes
 * @returns {boolean} Whether this status should be retried
 */
function isRetryableStatus(status, retryableStatuses) {
  return retryableStatuses.includes(status);
}

/**
 * Check if an error is retryable (network timeout, connection refused, etc)
 * @param {Error} error - Error object
 * @returns {boolean} Whether this error type is retryable
 */
function isRetryableError(error) {
  const retryableMessages = [
    'NetworkError',
    'Failed to fetch',
    'timeout',
    'ECONNREFUSED',
    'ENOTFOUND',
    'ENETUNREACH',
  ];
  return retryableMessages.some(
    (msg) => error.message && error.message.includes(msg)
  );
}

/**
 * Calculate exponential backoff delay
 * @param {number} attempt - Attempt number (0-based)
 * @param {number} initialDelayMs - Initial delay
 * @param {number} maxDelayMs - Maximum delay
 * @param {number} multiplier - Backoff multiplier
 * @returns {number} Delay in milliseconds
 */
function calculateBackoffDelay(
  attempt,
  initialDelayMs,
  maxDelayMs,
  multiplier
) {
  const delay = initialDelayMs * Math.pow(multiplier, attempt);
  return Math.min(delay, maxDelayMs);
}

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Configuration options
 * @returns {Promise} Result of the function
 * @example
 *   const result = await withRetry(() => fetch(url), {
 *     maxRetries: 3,
 *     initialDelayMs: 500,
 *   });
 */
export async function withRetry(fn, options = {}) {
  const config = { ...DEFAULT_CONFIG, ...options };
  let lastError;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      // Add timeout wrapper
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Request timeout')),
          config.timeoutMs
        )
      );

      const result = await Promise.race([fn(), timeoutPromise]);
      return result;
    } catch (error) {
      lastError = error;

      // Check if we should retry
      const isRetryable = isRetryableError(error);

      if (isDev) {
        logger.warn(
          `[retry] Attempt ${attempt + 1}/${config.maxRetries + 1} failed${
            isRetryable ? ' (will retry)' : ' (not retryable)'
          }:`,
          error.message
        );
      }

      // If this was the last attempt or error is not retryable, throw
      if (attempt === config.maxRetries || !isRetryable) {
        throw error;
      }

      // Calculate backoff and wait
      const delay = calculateBackoffDelay(
        attempt,
        config.initialDelayMs,
        config.maxDelayMs,
        config.backoffMultiplier
      );

      if (isDev) {
        logger.dbg(`[retry] Waiting ${delay}ms before retry...`);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Fetch with built-in retry logic and status validation
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options + retry config
 * @returns {Promise<Response>} Fetch response
 */
export async function fetchWithRetry(url, options = {}) {
  const { retryConfig, ...fetchOptions } = options;

  return withRetry(
    async () => {
      const response = await fetch(url, fetchOptions);

      // Check if status is OK or check for retryable status
      if (!response.ok && isRetryableStatus(response.status)) {
        const error = new Error(`HTTP ${response.status}`);
        error.status = response.status;
        throw error;
      }

      return response;
    },
    retryConfig
  );
}

/**
 * Create a fetch wrapper with automatic retry and error handling
 * @param {string} url - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Parsed JSON response
 */
export async function apiCallWithRetry(url, options = {}) {
  try {
    const response = await fetchWithRetry(url, {
      ...options,
      retryConfig: options.retryConfig,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (isDev) {
      logger.error(`[API] Failed to fetch ${url}:`, error);
    }
    throw error;
  }
}

/**
 * Detect network connectivity
 * @returns {boolean} True if online
 */
export function isOnline() {
  if (typeof window === 'undefined') return true; // Assume online on server
  return navigator.onLine;
}

/**
 * Listen for network changes
 * @param {Function} onOnline - Callback when online
 * @param {Function} onOffline - Callback when offline
 * @returns {Function} Cleanup function to remove listeners
 */
export function watchNetworkStatus(onOnline, onOffline) {
  if (typeof window === 'undefined') return () => {};

  window.addEventListener('online', () => {
    if (isDev) {
      logger.dbg('[network] Back online');
    }
    onOnline?.();
  });

  window.addEventListener('offline', () => {
    if (isDev) {
      logger.dbg('[network] Gone offline');
    }
    onOffline?.();
  });

  // Return cleanup function
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}

/**
 * Queue API calls for when connection is restored
 */
class APICallQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  /**
   * Add a call to the queue
   * @param {Function} fn - Async function to call later
   * @param {number} priority - Priority (higher = execute first)
   */
  add(fn, priority = 0) {
    this.queue.push({ fn, priority, timestamp: Date.now() });
    this.queue.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Process all queued calls
   */
  async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const { fn } = this.queue.shift();
      try {
        await fn();
      } catch (error) {
        if (isDev) {
          logger.error('[queue] Failed to process queued call:', error);
        }
      }
    }

    this.isProcessing = false;
  }

  /**
   * Clear the queue
   */
  clear() {
    this.queue = [];
  }

  /**
   * Get queue size
   */
  size() {
    return this.queue.length;
  }
}

export const apiQueue = new APICallQueue();

export default {
  withRetry,
  fetchWithRetry,
  apiCallWithRetry,
  isOnline,
  watchNetworkStatus,
  apiQueue,
};

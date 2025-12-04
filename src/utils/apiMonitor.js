/**
 * API Response Monitoring & Performance Tracking
 * Tracks API calls, response times, error rates, and provides analytics
 */

const isDev = process.env.NODE_ENV !== 'production';

class APIMonitor {
  constructor() {
    this.calls = [];
    this.maxCalls = 100; // Keep last 100 API calls for analysis
  }

  /**
   * Record an API call
   * @param {string} endpoint - API endpoint called
   * @param {string} method - HTTP method (GET, POST, etc)
   * @param {number} duration - Duration in milliseconds
   * @param {number} status - HTTP status code
   * @param {boolean} success - Whether call succeeded
   * @param {Error} error - Optional error object
   */
  recordCall(endpoint, method, duration, status, success, error = null) {
    const call = {
      endpoint,
      method,
      duration,
      status,
      success,
      timestamp: Date.now(),
      error: error ? error.message : null,
    };

    this.calls.push(call);

    // Keep only last N calls
    if (this.calls.length > this.maxCalls) {
      this.calls = this.calls.slice(-this.maxCalls);
    }

    // Log in development
    if (isDev) {
      const emoji = success ? '✓' : '✗';
      const color = success ? 'color:green' : 'color:red';
      // eslint-disable-next-line no-console
      console.log(
        `%c${emoji} ${method} ${endpoint}`,
        color,
        `${status} ${duration}ms`
      );
    }
  }

  /**
   * Get analytics for all recorded calls
   * @returns {Object} Analytics including avg duration, error rate, etc
   */
  getAnalytics() {
    if (this.calls.length === 0) {
      return {
        totalCalls: 0,
        avgDuration: 0,
        errorRate: 0,
        slowCalls: 0,
        endpointBreakdown: {},
      };
    }

    const totalCalls = this.calls.length;
    const failedCalls = this.calls.filter((c) => !c.success).length;
    const avgDuration =
      this.calls.reduce((sum, c) => sum + c.duration, 0) / totalCalls;
    const slowCalls = this.calls.filter((c) => c.duration > 1000).length;

    // Group by endpoint
    const endpointBreakdown = this.calls.reduce((acc, call) => {
      if (!acc[call.endpoint]) {
        acc[call.endpoint] = { count: 0, avgDuration: 0, errors: 0 };
      }
      acc[call.endpoint].count++;
      acc[call.endpoint].avgDuration += call.duration;
      if (!call.success) acc[call.endpoint].errors++;
      return acc;
    }, {});

    // Calculate final averages
    Object.keys(endpointBreakdown).forEach((key) => {
      endpointBreakdown[key].avgDuration =
        Math.round(
          endpointBreakdown[key].avgDuration / endpointBreakdown[key].count
        ) || 0;
    });

    return {
      totalCalls,
      avgDuration: Math.round(avgDuration),
      errorRate: ((failedCalls / totalCalls) * 100).toFixed(2),
      slowCalls,
      endpointBreakdown,
      lastCall: this.calls[this.calls.length - 1],
    };
  }

  /**
   * Get detailed report of recent calls
   * @param {number} limit - Number of recent calls to include
   * @returns {Array} Array of recent API calls
   */
  getRecentCalls(limit = 20) {
    return this.calls.slice(-limit);
  }

  /**
   * Find calls matching criteria
   * @param {Object} filter - Filter object {endpoint, method, success, status}
   * @returns {Array} Matching calls
   */
  findCalls(filter = {}) {
    return this.calls.filter((call) => {
      if (
        filter.endpoint &&
        !call.endpoint.includes(filter.endpoint)
      )
        return false;
      if (filter.method && call.method !== filter.method)
        return false;
      if (
        filter.success !== undefined &&
        call.success !== filter.success
      )
        return false;
      if (filter.status && call.status !== filter.status)
        return false;
      return true;
    });
  }

  /**
   * Get slow API calls (duration > threshold)
   * @param {number} threshold - Duration threshold in ms (default: 1000)
   * @returns {Array} Slow calls
   */
  getSlowCalls(threshold = 1000) {
    return this.calls.filter((c) => c.duration > threshold);
  }

  /**
   * Get failed API calls
   * @returns {Array} Failed calls
   */
  getFailedCalls() {
    return this.calls.filter((c) => !c.success);
  }

  /**
   * Clear all recorded calls
   */
  clear() {
    this.calls = [];
  }

  /**
   * Export current data for debugging
   * @returns {Object} Current monitor state
   */
  export() {
    return {
      calls: this.calls,
      analytics: this.getAnalytics(),
    };
  }
}

// Global singleton instance
const monitor = new APIMonitor();

export default monitor;

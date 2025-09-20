/* ===== Rate Limiting ===== */

/**
 * Simple in-memory rate limiter
 * In production, consider using Redis or a more robust solution
 */
class RateLimiter {
  constructor() {
    this.requests = new Map(); // clientId -> { count, resetTime }
  }

  /**
   * Check if client is rate limited
   * @param {string} clientId - Unique client identifier
   * @param {string} action - Action type for different limits
   * @returns {boolean} - True if rate limited
   */
  isRateLimited(clientId, action = 'default') {
    const now = Date.now();
    const key = `${clientId}:${action}`;

    if (!this.requests.has(key)) {
      this.requests.set(key, { count: 1, resetTime: now + RATE_LIMITS.WINDOW_MS });
      return false;
    }

    const requestData = this.requests.get(key);

    // Reset if window has expired
    if (now > requestData.resetTime) {
      requestData.count = 1;
      requestData.resetTime = now + RATE_LIMITS.WINDOW_MS;
      return false;
    }

    // Check limits based on action type
    const limit = this.getLimitForAction(action);
    if (requestData.count >= limit) {
      return true;
    }

    requestData.count++;
    return false;
  }

  /**
   * Get rate limit for specific action
   */
  getLimitForAction(action) {
    switch (action) {
      case 'action':
        return RATE_LIMITS.ACTIONS_PER_MINUTE;
      case 'connect':
        return RATE_LIMITS.CONNECTIONS_PER_MINUTE;
      default:
        return RATE_LIMITS.MESSAGES_PER_MINUTE;
    }
  }

  /**
   * Clean up old entries periodically
   */
  cleanup() {
    const now = Date.now();
    for (const [key, data] of this.requests.entries()) {
      if (now > data.resetTime) {
        this.requests.delete(key);
      }
    }
  }

  /**
   * Get current stats for monitoring
   */
  getStats() {
    const now = Date.now();
    const activeRequests = Array.from(this.requests.entries()).filter(([_, data]) => now <= data.resetTime);

    return {
      totalTrackedClients: activeRequests.length,
      requestsByAction: activeRequests.reduce((acc, [key, data]) => {
        const action = key.split(':')[1] || 'default';
        acc[action] = (acc[action] || 0) + data.count;
        return acc;
      }, {})
    };
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

// Periodic cleanup
setInterval(() => {
  rateLimiter.cleanup();
}, 5 * 60 * 1000); // Clean up every 5 minutes

// Export constants
export const RATE_LIMITS = {
  // Messages per minute
  MESSAGES_PER_MINUTE: 60,
  // Actions per minute (game actions)
  ACTIONS_PER_MINUTE: 30,
  // Connection attempts per minute
  CONNECTIONS_PER_MINUTE: 10,
  // Time window in milliseconds
  WINDOW_MS: 60 * 1000
};

// Export class
export { RateLimiter };

// Export singleton instance
export { rateLimiter };

// API Cache Utility for optimizing API calls
// Reduces redundant network requests and improves performance

class APICache {
  constructor(ttl = 5 * 60 * 1000) { // 5 minutes default TTL
    this.cache = new Map();
    this.ttl = ttl;
  }

  /**
   * Store data in cache with expiry time
   * @param {string} key - Cache key
   * @param {*} data - Data to cache
   * @param {number} customTTL - Custom time-to-live in milliseconds
   */
  set(key, data, customTTL) {
    const expiry = Date.now() + (customTTL || this.ttl);
    this.cache.set(key, { data, expiry });
    // // console.log(`✅ Cached: ${key} (expires in ${(customTTL || this.ttl) / 1000}s)`);
  }

  /**
   * Retrieve data from cache if not expired
   * @param {string} key - Cache key
   * @returns {*} Cached data or null if expired/not found
   */
  get(key) {
    const cached = this.cache.get(key);
    if (!cached) {
      // // console.log(`❌ Cache miss: ${key}`);
      return null;
    }
    
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      // // console.log(`⏰ Cache expired: ${key}`);
      return null;
    }
    
    // // console.log(`✅ Cache hit: ${key}`);
    return cached.data;
  }

  /**
   * Clear cache entries
   * @param {string} keyPattern - Optional pattern to match keys for deletion
   */
  clear(keyPattern) {
    if (keyPattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(keyPattern)) {
          this.cache.delete(key);
          // // console.log(`🗑️ Cleared cache: ${key}`);
        }
      }
    } else {
      this.cache.clear();
      // // console.log('🗑️ Cleared all cache');
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Create singleton instance
export const apiCache = new APICache();

/**
 * Helper function for cached API calls
 * @param {string} cacheKey - Unique key for this API call
 * @param {Function} fetchFn - Async function that performs the API call
 * @param {number} ttl - Time-to-live in milliseconds (optional)
 * @returns {Promise} Cached or fresh data
 */
export const cachedFetch = async (cacheKey, fetchFn, ttl) => {
  const cached = apiCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const data = await fetchFn();
  apiCache.set(cacheKey, data, ttl);
  return data;
};

/**
 * Invalidate cache entries by pattern
 * @param {string} pattern - Pattern to match for invalidation
 */
export const invalidateCache = (pattern) => {
  apiCache.clear(pattern);
};

export default apiCache;

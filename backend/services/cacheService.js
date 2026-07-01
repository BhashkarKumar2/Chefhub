import crypto from 'crypto';
import redis from '../config/redis.js';

const CACHE_PREFIX = 'chefhub:cache:';

const normalizeForHash = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeForHash);
  }

  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        const normalizedValue = normalizeForHash(value[key]);
        if (normalizedValue !== undefined && normalizedValue !== '') {
          acc[key] = normalizedValue;
        }
        return acc;
      }, {});
  }

  return value;
};

const toCacheKey = (key) => `${CACHE_PREFIX}${key}`;

export const stableHash = (value) => crypto
  .createHash('sha256')
  .update(JSON.stringify(normalizeForHash(value)))
  .digest('hex')
  .slice(0, 24);

export const getJson = async (key) => {
  try {
    const rawValue = await redis.get(toCacheKey(key));
    return rawValue ? JSON.parse(rawValue) : null;
  } catch (error) {
    console.warn('[CACHE] Read failed:', error.message);
    return null;
  }
};

export const setJson = async (key, value, ttlSeconds = 300) => {
  try {
    await redis.setex(toCacheKey(key), ttlSeconds, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn('[CACHE] Write failed:', error.message);
    return false;
  }
};

export const deleteKey = async (key) => {
  try {
    await redis.del(toCacheKey(key));
    return true;
  } catch (error) {
    console.warn('[CACHE] Delete failed:', error.message);
    return false;
  }
};

export const deleteByPrefix = async (prefix) => {
  const pattern = `${toCacheKey(prefix)}*`;
  try {
    // Prefer a non-blocking SCAN (ioredis) over KEYS, which blocks the whole
    // Redis server while it walks the entire keyspace. Fall back to KEYS only
    // for the in-memory client used in local/dev environments.
    let keys;
    if (typeof redis.scanStream === 'function') {
      keys = await new Promise((resolve, reject) => {
        const found = [];
        const stream = redis.scanStream({ match: pattern, count: 100 });
        stream.on('data', (batch) => found.push(...batch));
        stream.on('end', () => resolve(found));
        stream.on('error', reject);
      });
    } else {
      keys = await redis.keys(pattern);
    }

    if (keys.length === 0) return 0;

    // Delete in one round-trip instead of N sequential DEL calls. UNLINK frees
    // memory asynchronously on the server; fall back to DEL when unavailable.
    if (typeof redis.unlink === 'function') {
      return await redis.unlink(...keys);
    }
    return await redis.del(...keys);
  } catch (error) {
    console.warn('[CACHE] Prefix delete failed:', error.message);
    return 0;
  }
};

export const remember = async (key, ttlSeconds, producer) => {
  const cachedValue = await getJson(key);
  if (cachedValue !== null) {
    return { value: cachedValue, hit: true };
  }

  const value = await producer();
  await setJson(key, value, ttlSeconds);
  return { value, hit: false };
};

export const setCacheHeader = (res, hit) => {
  res.set('X-Cache', hit ? 'HIT' : 'MISS');
};

export default {
  getJson,
  setJson,
  deleteKey,
  deleteByPrefix,
  remember,
  setCacheHeader,
  stableHash
};

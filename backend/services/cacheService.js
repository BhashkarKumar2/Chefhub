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
  try {
    const keys = await redis.keys(`${toCacheKey(prefix)}*`);
    if (keys.length === 0) return 0;

    let deleted = 0;
    for (const key of keys) {
      deleted += await redis.del(key);
    }
    return deleted;
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

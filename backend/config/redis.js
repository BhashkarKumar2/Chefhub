import Redis from 'ioredis';

const hasRedisConfig = Boolean(
  process.env.REDIS_URL ||
  process.env.REDIS_HOST ||
  process.env.REDIS_PASSWORD
);

const createMemoryFallback = () => {
  const store = new Map();

  const isExpired = (entry) => entry.expiresAt && entry.expiresAt <= Date.now();

  const purgeExpired = () => {
    for (const [key, entry] of store.entries()) {
      if (isExpired(entry)) {
        store.delete(key);
      }
    }
  };

  const patternToRegex = (pattern = '*') => {
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    return new RegExp(`^${escaped}$`);
  };

  return {
    isEnabled: false,
    async get(key) {
      const entry = store.get(key);
      if (!entry) return null;
      if (isExpired(entry)) {
        store.delete(key);
        return null;
      }
      return entry.value;
    },
    async setex(key, ttlSeconds, value) {
      store.set(key, {
        value,
        expiresAt: Date.now() + Number(ttlSeconds) * 1000
      });
      return 'OK';
    },
    async del(...keys) {
      let deleted = 0;
      for (const key of keys.flat()) {
        if (store.delete(key)) deleted += 1;
      }
      return deleted;
    },
    async keys(pattern = '*') {
      purgeExpired();
      const regex = patternToRegex(pattern);
      return [...store.keys()].filter((key) => regex.test(key));
    },
    async quit() {
      store.clear();
      return 'OK';
    },
    on() {
      return this;
    }
  };
};

const createRedisClient = () => {
  const redis = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      connectTimeout: 5000,
      retryStrategy: (times) => Math.min(times * 100, 2000)
    })
    : new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT || 6379),
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      connectTimeout: 5000,
      retryStrategy: (times) => Math.min(times * 100, 2000)
    });

  redis.isEnabled = true;

  redis.on('error', (err) => {
    console.warn('[REDIS] Connection error:', err.message);
  });

  redis.on('connect', () => {
    console.log('[REDIS] Connected successfully');
  });

  redis.on('ready', () => {
    console.log('[REDIS] Ready to accept commands');
  });

  return redis;
};

const redis = hasRedisConfig ? createRedisClient() : createMemoryFallback();

// Graceful shutdown
process.on('SIGTERM', async () => {
  await redis.quit();
});

export default redis;

import Redis from 'ioredis';

const hasRedisConfig = Boolean(
  process.env.REDIS_URL ||
  process.env.REDIS_HOST ||
  process.env.REDIS_PASSWORD
);

const createMemoryFallback = () => ({
  isEnabled: false,
  async get() {
    return null;
  },
  async setex() {
    return 'OK';
  },
  async del() {
    return 0;
  },
  async keys() {
    return [];
  },
  async quit() {
    return 'OK';
  },
  on() {
    return this;
  }
});

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

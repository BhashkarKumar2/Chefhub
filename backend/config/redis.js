import Redis from 'ioredis';

// Create Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3
});

redis.on('error', (err) => {
  // console.error('❌ Redis connection error:', err.message);
});

redis.on('connect', () => {
  // console.log('✅ Redis connected successfully');
});

redis.on('ready', () => {
  // console.log('✅ Redis ready to accept commands');
});

redis.on('reconnecting', () => {
  // console.log('🔄 Redis reconnecting...');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await redis.quit();
  // console.log('Redis connection closed');
});

export default redis;

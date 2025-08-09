import express from 'express';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: 'connected', // This should be checked dynamically
      ai: process.env.GEMINI_API_KEY ? 'configured' : 'not configured',
      socket: 'active'
    }
  };

  res.status(200).json(healthStatus);
});

// System info endpoint
router.get('/system-info', (req, res) => {
  const systemInfo = {
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
    cpuUsage: process.cpuUsage(),
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  };

  res.status(200).json(systemInfo);
});

export default router;

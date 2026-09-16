import express from 'express';
import { getAiProvider, isAiConfigured } from '../services/geminiService.js';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';

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
      ai: isAiConfigured() ? `configured (${getAiProvider()})` : 'not configured',
      socket: 'active'
    }
  };

  res.status(200).json(healthStatus);
});

// System info endpoint
// Admin only: runtime details help fingerprint the server
router.get('/system-info', verifyToken, requireAdmin, (req, res) => {
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

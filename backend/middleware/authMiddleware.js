import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to verify JWT token
export const verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided or invalid format.' 
      });
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid token. User not found.' 
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token.' 
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired.' 
      });
    } else {
      return res.status(500).json({ 
        message: 'Server error during authentication.' 
      });
    }
  }
};

// Middleware to optionally verify token (for routes that work with/without auth)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // If token is invalid, continue without user
    next();
  }
};

// Utility function to validate token without middleware
export const validateToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { valid: true, decoded };
  } catch (error) {
    return { 
      valid: false, 
      error: error.name === 'TokenExpiredError' ? 'expired' : 'invalid' 
    };
  }
};

// Middleware to check if user is admin
export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: 'Authentication required'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied. Admin privileges required.'
      });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({
      message: 'Server error during authorization'
    });
  }
};

// Middleware to check if user is a chef
export const requireChef = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: 'Authentication required'
      });
    }

    if (req.user.role !== 'chef' && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied. Chef privileges required.'
      });
    }

    next();
  } catch (error) {
    console.error('Chef check error:', error);
    return res.status(500).json({
      message: 'Server error during authorization'
    });
  }
};

// Middleware to check if user owns the resource or is admin
export const requireOwnershipOrAdmin = (resourceUserField = 'user') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: 'Authentication required'
        });
      }

      // Admin can access anything
      if (req.user.role === 'admin') {
        return next();
      }

      // Check if the resource belongs to the user
      const resourceUserId = req.params.userId || req.body[resourceUserField] || req.user.id;
      
      if (req.user.id.toString() !== resourceUserId.toString()) {
        return res.status(403).json({
          message: 'Access denied. You can only access your own resources.'
        });
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({
        message: 'Server error during authorization'
      });
    }
  };
};

// Middleware to rate limit requests
export const rateLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up old entries
    if (requests.has(clientIP)) {
      const userRequests = requests.get(clientIP).filter(timestamp => timestamp > windowStart);
      requests.set(clientIP, userRequests);
    } else {
      requests.set(clientIP, []);
    }

    const userRequests = requests.get(clientIP);

    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    userRequests.push(now);
    requests.set(clientIP, userRequests);
    next();
  };
};

// Middleware to log requests (for debugging)
export const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const userId = req.user ? req.user.id : 'Anonymous';

  console.log(`[${timestamp}] ${method} ${url} - User: ${userId} - Agent: ${userAgent}`);
  next();
};

// Middleware to validate API key (for external integrations)
export const validateApiKey = (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({
        message: 'API key required'
      });
    }

    if (apiKey !== process.env.API_KEY) {
      return res.status(401).json({
        message: 'Invalid API key'
      });
    }

    next();
  } catch (error) {
    console.error('API key validation error:', error);
    return res.status(500).json({
      message: 'Server error during API key validation'
    });
  }
};

// Default export for backward compatibility
const authMiddleware = verifyToken;
export default authMiddleware;

import rateLimit from 'express-rate-limit';

// Per-route limiters for endpoints that spend paid third-party quota
// (OpenRouteService, Brevo). Disabled outside production, like the limiters in server.js.
const createLimiter = (options) => process.env.NODE_ENV === 'production'
  ? rateLimit({ standardHeaders: true, legacyHeaders: false, ...options })
  : (req, res, next) => next();

// Geocoding is public (guests search by city on the home page), so cap it per IP
export const geocodeLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60,
  message: { success: false, error: 'Too many location lookups, please try again later.' }
});

// Contact form emails land in our own inbox - a handful per hour is plenty
export const contactEmailLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { success: false, error: 'Too many messages sent, please try again later.' }
});

import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { registerUser, loginUser, validateToken, getCurrentUser, verifyFirebaseOTP } from './authController.js';
import { verifyToken as authMiddleware } from '../middleware/authMiddleware.js';
import { setPassword, changePassword, checkPasswordStatus, forgotPassword, verifyResetToken, resetPassword } from '../controllers/passwordController.js';
import { verifyEmail, resendVerificationEmail } from '../controllers/emailVerificationController.js';
import { validate, registerValidationRules, loginValidationRules, forgotPasswordValidationRules, resetPasswordValidationRules } from '../middleware/validationMiddleware.js';
import redis from '../config/redis.js';

const router = express.Router();

// SECURITY: Instead of redirecting the browser to the frontend with the JWT in
// the URL query string (which leaks via history, Referer headers and logs), we
// mint a short-lived, single-use handoff code, stash the token server-side, and
// let the SPA exchange the code for the token over a POST.
const OAUTH_CODE_TTL_SECONDS = 120;

const storeOAuthHandoff = async (payload) => {
  const code = crypto.randomBytes(32).toString('hex');
  await redis.setex(`oauth:code:${code}`, OAUTH_CODE_TTL_SECONDS, JSON.stringify(payload));
  return code;
};

// Rate limiters for authentication endpoints
const registerLimiter = process.env.NODE_ENV === 'production'
  ? rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // 3 registration attempts per IP
    message: 'Too many registration attempts from this IP. Please try again in 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
  })
  : (req, res, next) => next();

const loginLimiter = process.env.NODE_ENV === 'production'
  ? rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 login attempts per IP
    message: 'Too many login attempts from this IP. Please try again in 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
  })
  : (req, res, next) => next();

const verifyEmailLimiter = process.env.NODE_ENV === 'production'
  ? rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5, // 5 verification attempts per IP
    message: 'Too many verification attempts. Please try again in 5 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
  })
  : (req, res, next) => next();

const resendOTPLimiter = process.env.NODE_ENV === 'production'
  ? rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 3, // 3 resend attempts per IP
    message: 'Too many resend requests. Please try again in 5 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
  })
  : (req, res, next) => next();

const forgotPasswordLimiter = process.env.NODE_ENV === 'production'
  ? rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 forgot password attempts per IP
    message: 'Too many password reset requests. Please try again in 1 hour.',
    standardHeaders: true,
    legacyHeaders: false,
  })
  : (req, res, next) => next();

// Regular authentication routes
router.post('/register', registerLimiter, registerValidationRules(), validate, registerUser);
router.post('/login', loginLimiter, loginValidationRules(), validate, loginUser);

// Email verification routes
router.post('/verify-email', verifyEmailLimiter, verifyEmail);
router.post('/resend-verification', resendOTPLimiter, resendVerificationEmail);

// Firebase mobile authentication routes
router.post('/verify-firebase-otp', verifyFirebaseOTP);

// Token validation route
router.post('/validate-token', validateToken);

// OAuth handoff: exchange a short-lived single-use code for the JWT.
router.post('/exchange-code', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code || !/^[a-f0-9]{64}$/.test(code)) {
      return res.status(400).json({ message: 'Invalid code' });
    }

    const key = `oauth:code:${code}`;
    const raw = await redis.get(key);
    if (!raw) {
      return res.status(400).json({ message: 'Code expired or already used' });
    }

    // Single-use: delete before returning so a code can never be replayed.
    await redis.del(key);

    const payload = JSON.parse(raw);
    res.json(payload); // { token, user }
  } catch (error) {
    res.status(500).json({ message: 'Failed to complete sign-in' });
  }
});

// Get current user (protected route)
router.get('/me', authMiddleware, getCurrentUser);

// Password management routes (protected)
router.post('/set-password', authMiddleware, setPassword);
router.post('/change-password', authMiddleware, changePassword);
router.get('/password-status', authMiddleware, checkPasswordStatus);

// Password reset routes (public)
router.post('/forgot-password', forgotPasswordLimiter, forgotPasswordValidationRules(), validate, forgotPassword);
router.get('/reset-password/:token', verifyResetToken);
router.post('/reset-password/:token', resetPasswordValidationRules(), validate, resetPassword);

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: process.env.NODE_ENV === 'production'
      ? 'https://chefhub-poou.vercel.app/login'
      : 'http://localhost:5173/login'
  }),
  async (req, res) => {
    try {
      // console.log('Google OAuth callback triggered');
      // console.log('Authenticated user:', req.user ? req.user.email : 'No user');

      if (!req.user) {
        // console.error('❌ No user found in request');
        const errorUrl = process.env.NODE_ENV === 'production'
          ? 'https://chefhub-poou.vercel.app/login?error=no_user'
          : 'http://localhost:5173/login?error=no_user';
        return res.redirect(errorUrl);
      }

      // Create JWT token for the authenticated user
      const token = jwt.sign({
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      }, process.env.JWT_SECRET, { expiresIn: "1d" });

      // SECURITY: hand off via a short-lived single-use code instead of putting
      // the JWT in the redirect URL (avoids token leakage via history/logs).
      const baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://chefhub-poou.vercel.app'
        : 'http://localhost:5173';
      const code = await storeOAuthHandoff({
        token,
        user: { id: req.user._id, email: req.user.email, name: req.user.name }
      });

      res.redirect(`${baseUrl}/auth-success?code=${code}`);
    } catch (error) {
      // console.error('âŒ Google OAuth callback error:', error);
      const errorUrl = process.env.NODE_ENV === 'production'
        ? 'https://chefhub-poou.vercel.app/login?error=oauth_failed'
        : 'http://localhost:5173/login?error=oauth_failed';
      res.redirect(errorUrl);
    }
  }
);

// Facebook OAuth routes
router.get('/facebook',
  passport.authenticate('facebook', { scope: ['public_profile', 'email'], session: false })
);

router.get('/facebook/callback',
  passport.authenticate('facebook', {
    session: false,
    failureRedirect: process.env.NODE_ENV === 'production'
      ? 'https://chefhub-poou.vercel.app/login'
      : 'http://localhost:5173/login'
  }),
  async (req, res) => {
    try {
      // console.log('Facebook OAuth callback triggered');
      // console.log('Authenticated user:', req.user ? req.user.email : 'No user');

      if (!req.user) {
        // console.error('❌ No user found in request');
        const errorUrl = process.env.NODE_ENV === 'production'
          ? 'https://chefhub-poou.vercel.app/login?error=no_user'
          : 'http://localhost:5173/login?error=no_user';
        return res.redirect(errorUrl);
      }

      // Create JWT token for the authenticated user
      const token = jwt.sign({
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      }, process.env.JWT_SECRET, { expiresIn: "1d" });

      // SECURITY: hand off via a short-lived single-use code instead of putting
      // the JWT in the redirect URL (avoids token leakage via history/logs).
      const baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://chefhub-poou.vercel.app'
        : 'http://localhost:5173';
      const code = await storeOAuthHandoff({
        token,
        user: { id: req.user._id, email: req.user.email, name: req.user.name }
      });

      res.redirect(`${baseUrl}/auth-success?code=${code}`);
    } catch (error) {
      // console.error('Facebook OAuth callback error:', error);
      const errorUrl = process.env.NODE_ENV === 'production'
        ? 'https://chefhub-poou.vercel.app/login?error=oauth_failed'
        : 'http://localhost:5173/login?error=oauth_failed';
      res.redirect(errorUrl);
    }
  }
);

// Logout route
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

export default router;

import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  registerUser,
  verifyRegistration,
  resendRegistrationCode,
  loginUser,
  validateToken,
  getCurrentUser
} from './authController.js';
import { verifyToken as authMiddleware } from '../middleware/authMiddleware.js';
import { changePassword, checkPasswordStatus, forgotPassword, verifyResetToken, resetPassword } from '../controllers/passwordController.js';
import { validate, registerValidationRules, loginValidationRules, forgotPasswordValidationRules, resetPasswordValidationRules } from '../middleware/validationMiddleware.js';

// Sign-in is email + password only, with every piece of state (accounts,
// pending signups, lockouts, reset tokens, session versions) kept in MongoDB.

const router = express.Router();

// Rate limiters for authentication endpoints (per IP). Per-account protection
// (login lockout, OTP attempt limits) lives in the controllers.
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

const resetPasswordLimiter = process.env.NODE_ENV === 'production'
  ? rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: 'Too many password reset attempts. Please try again in 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
  })
  : (req, res, next) => next();

// Signup: register -> emailed 6-digit code -> verify
router.post('/register', registerLimiter, registerValidationRules(), validate, registerUser);
router.post('/verify-email', verifyEmailLimiter, verifyRegistration);
router.post('/resend-verification', resendOTPLimiter, resendRegistrationCode);

router.post('/login', loginLimiter, loginValidationRules(), validate, loginUser);

// Token validation route
router.post('/validate-token', validateToken);

// Get current user (protected route)
router.get('/me', authMiddleware, getCurrentUser);

// Password management routes (protected)
router.post('/change-password', authMiddleware, changePassword);
router.get('/password-status', authMiddleware, checkPasswordStatus);

// Password reset routes (public)
router.post('/forgot-password', forgotPasswordLimiter, forgotPasswordValidationRules(), validate, forgotPassword);
router.get('/reset-password/:token', resetPasswordLimiter, verifyResetToken);
router.post('/reset-password/:token', resetPasswordLimiter, resetPasswordValidationRules(), validate, resetPassword);

// Tokens are stateless; the client discards its token. Changing or resetting
// the password revokes all existing tokens server-side.
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;

import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { registerUser, loginUser, validateToken, getCurrentUser, verifyFirebaseOTP } from './authController.js';
import { verifyToken as authMiddleware } from '../middleware/authMiddleware.js';
import { setPassword, changePassword, checkPasswordStatus, forgotPassword, verifyResetToken, resetPassword } from '../controllers/passwordController.js';
import { verifyEmail, resendVerificationEmail } from '../controllers/emailVerificationController.js';

const router = express.Router();

// Rate limiters for authentication endpoints
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 registration attempts per IP
  message: 'Too many registration attempts from this IP. Please try again in 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts per IP
  message: 'Too many login attempts from this IP. Please try again in 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

const verifyEmailLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // 5 verification attempts per IP
  message: 'Too many verification attempts. Please try again in 5 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

const resendOTPLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // 3 resend attempts per IP
  message: 'Too many resend requests. Please try again in 5 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 forgot password attempts per IP
  message: 'Too many password reset requests. Please try again in 1 hour.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Regular authentication routes
router.post('/register', registerLimiter, registerUser);
router.post('/login', loginLimiter, loginUser);

// Email verification routes
router.post('/verify-email', verifyEmailLimiter, verifyEmail);
router.post('/resend-verification', resendOTPLimiter, resendVerificationEmail);

// Firebase mobile authentication routes
router.post('/verify-firebase-otp', verifyFirebaseOTP);

// Token validation route
router.post('/validate-token', validateToken);

// Get current user (protected route)
router.get('/me', authMiddleware, getCurrentUser);

// Password management routes (protected)
router.post('/set-password', authMiddleware, setPassword);
router.post('/change-password', authMiddleware, changePassword);
router.get('/password-status', authMiddleware, checkPasswordStatus);

// Password reset routes (public)
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.get('/reset-password/:token', verifyResetToken);
router.post('/reset-password/:token', resetPassword);

// Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: process.env.NODE_ENV === 'production' 
      ? 'https://chefhub-poou.vercel.app/login' 
      : 'http://localhost:5173/login'
  }),
  (req, res) => {
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
      // console.log('Generated JWT token for user:', req.user.email);
      
      // Redirect to frontend with token as query parameter
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://chefhub-poou.vercel.app'
        : 'http://localhost:5173';
      const redirectUrl = `${baseUrl}/auth-success?token=${token}&userId=${req.user._id}&email=${encodeURIComponent(req.user.email)}&name=${encodeURIComponent(req.user.name)}`;
      // console.log('Redirecting to:', redirectUrl);
      
      res.redirect(redirectUrl);
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
  passport.authenticate('facebook', { scope: ['public_profile', 'email'] })
);

router.get('/facebook/callback', 
  passport.authenticate('facebook', { 
    failureRedirect: process.env.NODE_ENV === 'production' 
      ? 'https://chefhub-poou.vercel.app/login' 
      : 'http://localhost:5173/login'
  }),
  (req, res) => {
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
      // console.log('Generated JWT token for user:', req.user.email);
      
      // Redirect to frontend with token as query parameter
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://chefhub-poou.vercel.app'
        : 'http://localhost:5173';
      const redirectUrl = `${baseUrl}/auth-success?token=${token}&userId=${req.user._id}&email=${encodeURIComponent(req.user.email)}&name=${encodeURIComponent(req.user.name)}`;
      // console.log('Redirecting to:', redirectUrl);
      
      res.redirect(redirectUrl);
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

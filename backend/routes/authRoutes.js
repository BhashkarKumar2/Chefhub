import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { registerUser, loginUser, validateToken, getCurrentUser, verifyFirebaseOTP } from '../auth/authController.js';
import { verifyToken } from '../auth/authMiddleware.js';

const router = express.Router();

// Regular authentication routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Firebase mobile authentication routes
router.post('/verify-firebase-otp', verifyFirebaseOTP);

// Token validation route
router.post('/validate-token', validateToken);

// Get current user (protected route)
router.get('/me', verifyToken, getCurrentUser);

// Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login' }),
  (req, res) => {
    try {
      console.log('🔄 Google OAuth callback triggered');
      console.log('👤 Authenticated user:', req.user ? req.user.email : 'No user');
      
      if (!req.user) {
        console.error('❌ No user found in request');
        return res.redirect('http://localhost:5173/login?error=no_user');
      }
      
      // Create JWT token for the authenticated user
      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
      console.log('🔑 Generated JWT token for user:', req.user.email);
      
      // Redirect to frontend with token as query parameter
      const redirectUrl = `http://localhost:5173/auth-success?token=${token}&userId=${req.user._id}&email=${encodeURIComponent(req.user.email)}&name=${encodeURIComponent(req.user.name)}`;
      console.log('🚀 Redirecting to:', redirectUrl);
      
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('❌ Google OAuth callback error:', error);
      res.redirect('http://localhost:5173/login?error=oauth_failed');
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

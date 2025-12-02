import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { verifyFirebaseToken, getFirebaseUserByPhone } from '../services/smsService.js';
import { sendVerificationEmail } from '../controllers/emailVerificationController.js';
import redis from '../config/redis.js';

// Helper functions for Redis-based pending registrations
export const storePendingRegistration = async (email, data) => {
  const key = `pending:registration:${email}`;
  await redis.setex(key, 600, JSON.stringify(data)); // 10 minutes TTL
  // console.log(`[REDIS] Stored pending registration for: ${email}`);
};

export const getPendingRegistration = async (email) => {
  const key = `pending:registration:${email}`;
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
};

export const deletePendingRegistration = async (email) => {
  const key = `pending:registration:${email}`;
  await redis.del(key);
  // console.log(`[REDIS] Deleted pending registration for: ${email}`);
};

// Fallback: In-memory store if Redis is unavailable
export const pendingRegistrations = new Map();

// Clean up expired in-memory registrations every minute (fallback only)
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of pendingRegistrations.entries()) {
    if (data.expiresAt < now) {
      pendingRegistrations.delete(email);
      // console.log(`[CLEANUP] Removed expired registration for: ${email}`);
    }
  }
}, 60000);

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Generate verification OTP (6-digit, 10-minute expiry)
    const verificationOTP = crypto.randomInt(100000, 1000000).toString();
    const hashedOTP = crypto.createHash('sha256').update(verificationOTP).digest('hex');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store registration data temporarily in Redis (or fallback to in-memory)
    const registrationData = {
      name,
      email,
      password: hashedPassword,
      otp: hashedOTP,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes for production
    };

    try {
      // Try Redis first
      await storePendingRegistration(email, registrationData);
    } catch (redisError) {
      // Fallback to in-memory if Redis fails
      // console.warn(`[REDIS] Failed, using in-memory fallback:`, redisError.message);
      pendingRegistrations.set(email, registrationData);
    }

    // console.log(`[REGISTER] Pending registration created for: ${email} (OTP expires in 10 minutes)`);

    try {
      // Send verification email
      await sendVerificationEmail({ name, email }, verificationOTP);

      // console.log(`[REGISTER] ✅ Verification email sent to: ${email}`);
      res.status(200).json({
        message: "Verification code sent! Please check your email and enter the code within 10 minutes.",
        emailSent: true,
        expiresIn: "10 minutes"
      });
    } catch (emailError) {
      // console.error(`[REGISTER] ❌ Error sending verification email to ${email}:`, emailError);
      // Remove pending registration if email fails
      try {
        await deletePendingRegistration(email);
      } catch {
        pendingRegistrations.delete(email);
      }
      return res.status(500).json({
        message: 'Failed to send verification email. Please check your email address.',
        emailSent: false
      });
    }
  } catch (err) {
    // console.error(`[REGISTER] ❌ Registration error:`, err);
    res.status(500).json({ message: err.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in. Check your inbox for the verification link.",
        emailNotVerified: true
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name,
      profileImage: user.profileImage
    };

    // console.log('✅ Login successful for:', email, 'User ID:', user._id);
    res.json({
      token,
      user: userResponse
    });
  } catch (err) {
    // console.error('❌ Login error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Validate JWT token
export const validateToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        valid: false,
        message: 'No token provided or invalid format'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user details
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        valid: false,
        message: 'User not found'
      });
    }

    res.json({
      valid: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        profileImage: user.profileImage
      }
    });
  } catch (error) {

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        valid: false,
        message: 'Token expired'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        valid: false,
        message: 'Invalid token'
      });
    } else {
      return res.status(500).json({
        valid: false,
        message: 'Server error'
      });
    }
  }
};

// Get current user profile (protected route)
export const getCurrentUser = async (req, res) => {
  try {
    // User is already attached to req by middleware
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify Firebase ID token and login/register user
export const verifyFirebaseOTP = async (req, res) => {
  try {
    const { idToken, name } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'Firebase ID token is required' });
    }

    // Verify Firebase token
    const tokenResult = await verifyFirebaseToken(idToken);

    if (!tokenResult.success) {
      return res.status(400).json({ message: tokenResult.error });
    }

    const firebaseUser = tokenResult.user;

    if (!firebaseUser.phoneNumber) {
      return res.status(400).json({ message: 'Phone number not found in Firebase token' });
    }

    // Check if user exists with this phone number
    let user = await User.findOne({ phone: firebaseUser.phoneNumber });

    if (!user) {
      // Create new user if doesn't exist
      const userName = name || firebaseUser.name || `User_${Date.now()}`;

      user = new User({
        name: userName,
        phone: firebaseUser.phoneNumber,
        email: firebaseUser.email || null,
        isPhoneVerified: true,
        firebaseUid: firebaseUser.uid
      });

      await user.save();
      // console.log('✅ New user created:', user.phone);
    } else {
      // Update phone verification status and Firebase UID
      user.isPhoneVerified = true;
      user.firebaseUid = firebaseUser.uid;
      if (firebaseUser.email && !user.email) {
        user.email = firebaseUser.email;
      }
      await user.save();
      // console.log('✅ Existing user updated:', user.phone);
    }

    // Generate JWT token for our application
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        profileImage: user.profileImage,
        isPhoneVerified: user.isPhoneVerified
      },
      message: 'Login successful'
    });
  } catch (error) {
    // console.error('Firebase OTP verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

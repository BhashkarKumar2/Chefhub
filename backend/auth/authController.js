import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import PendingRegistration from '../models/PendingRegistration.js';
import { sendVerificationEmail } from '../controllers/emailVerificationController.js';
import { signAuthToken, verifyAuthToken } from './tokenService.js';
import {
  BCRYPT_ROUNDS,
  OTP_TTL_MS,
  MAX_OTP_ATTEMPTS,
  MAX_FAILED_LOGINS,
  LOGIN_LOCK_MS,
  normalizeEmail,
  findUserByEmail,
  generateOtp,
  hashOtp,
  hashesMatch,
  validatePassword
} from './credentials.js';

// Compared against when the account doesn't exist, so a login for an unknown
// email takes as long as one for a real account (no timing-based enumeration).
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('chefhub-timing-equalizer', BCRYPT_ROUNDS);

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password || typeof name !== 'string') {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      return res.status(400).json({ message: 'Please provide a valid email' });
    }

    const existing = await findUserByEmail(email, '_id');
    if (existing) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const otp = generateOtp();
    const pending = await PendingRegistration.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
      otpHash: hashOtp(otp),
      expiresAt: new Date(Date.now() + OTP_TTL_MS)
    });

    try {
      await sendVerificationEmail({ name: pending.name, email: normalizedEmail }, otp);
    } catch (emailError) {
      await PendingRegistration.deleteOne({ _id: pending._id });
      return res.status(500).json({
        message: 'Failed to send verification email. Please check your email address.',
        emailSent: false
      });
    }

    res.status(200).json({
      message: 'Verification code sent! Please check your email and enter the code within 10 minutes.',
      emailSent: true,
      expiresIn: '10 minutes',
      // The code only verifies this signup attempt
      registrationId: pending._id
    });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
};

// Complete a signup: the code must belong to this registrationId
export const verifyRegistration = async (req, res) => {
  try {
    const { registrationId, otp } = req.body;

    if (!mongoose.Types.ObjectId.isValid(registrationId) || !/^\d{6}$/.test(String(otp || ''))) {
      return res.status(400).json({
        success: false,
        message: 'Please enter the 6-digit code from your email.'
      });
    }

    const pending = await PendingRegistration.findById(registrationId);
    if (!pending) {
      return res.status(400).json({
        success: false,
        message: 'No pending registration found. Please register again.',
        expired: true
      });
    }

    if (pending.expiresAt <= new Date()) {
      await PendingRegistration.deleteOne({ _id: pending._id });
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please register again.',
        expired: true
      });
    }

    if (!hashesMatch(hashOtp(otp), pending.otpHash)) {
      // Atomic increment so parallel guesses can't exceed the limit
      const updated = await PendingRegistration.findOneAndUpdate(
        { _id: pending._id },
        { $inc: { attempts: 1 } },
        { new: true }
      );

      if (!updated || updated.attempts >= MAX_OTP_ATTEMPTS) {
        await PendingRegistration.deleteOne({ _id: pending._id });
        return res.status(400).json({
          success: false,
          message: 'Too many incorrect codes. Please register again.',
          expired: true
        });
      }

      const left = MAX_OTP_ATTEMPTS - updated.attempts;
      return res.status(400).json({
        success: false,
        message: `Incorrect code. ${left} attempt${left === 1 ? '' : 's'} left.`
      });
    }

    // Consume the signup before creating the account so one code can't be used twice
    const consumed = await PendingRegistration.findOneAndDelete({ _id: pending._id, otpHash: pending.otpHash });
    if (!consumed) {
      return res.status(400).json({
        success: false,
        message: 'No pending registration found. Please register again.',
        expired: true
      });
    }

    let newUser;
    try {
      newUser = await User.create({
        name: consumed.name,
        email: consumed.email,
        password: consumed.passwordHash,
        isEmailVerified: true
      });
    } catch (createError) {
      if (createError.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists. Please log in.'
        });
      }
      throw createError;
    }

    res.json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during verification'
    });
  }
};

// Send a fresh code for the same signup attempt. The attempt counter is not
// reset, so resending can't be used to get more guesses.
export const resendRegistrationCode = async (req, res) => {
  try {
    const { registrationId } = req.body;

    const pending = mongoose.Types.ObjectId.isValid(registrationId)
      ? await PendingRegistration.findById(registrationId)
      : null;

    if (!pending) {
      return res.status(404).json({
        success: false,
        message: 'No pending registration found. Please register again.'
      });
    }

    const otp = generateOtp();
    pending.otpHash = hashOtp(otp);
    pending.expiresAt = new Date(Date.now() + OTP_TTL_MS);
    await pending.save();

    await sendVerificationEmail({ name: pending.name, email: pending.email }, otp);

    res.json({
      success: true,
      message: 'New verification code sent! Please check your email.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification email'
    });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const invalidCredentials = () => res.status(401).json({ message: 'Invalid email or password' });

  try {
    if (typeof email !== 'string' || typeof password !== 'string' || !password) {
      return invalidCredentials();
    }

    const user = await findUserByEmail(email, '+password +tokenVersion +failedLoginAttempts +lockUntil');

    // Unknown email, or an old social-login account that never set a password
    if (!user || !user.password) {
      await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
      return invalidCredentials();
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      return res.status(429).json({
        message: 'Too many failed attempts. Try again in 15 minutes or reset your password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const updated = await User.findOneAndUpdate(
        { _id: user._id },
        { $inc: { failedLoginAttempts: 1 } },
        { new: true }
      ).select('+failedLoginAttempts');

      if (updated && updated.failedLoginAttempts >= MAX_FAILED_LOGINS) {
        await User.updateOne(
          { _id: user._id },
          { $set: { failedLoginAttempts: 0, lockUntil: new Date(Date.now() + LOGIN_LOCK_MS) } }
        );
      }
      return invalidCredentials();
    }

    // Only reveal verification status to someone who knows the password
    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in.',
        emailNotVerified: true
      });
    }

    const updates = { $set: { failedLoginAttempts: 0 }, $unset: { lockUntil: 1 } };
    // Upgrade hashes created with a lower bcrypt cost
    if (bcrypt.getRounds(user.password) < BCRYPT_ROUNDS) {
      updates.$set.password = await bcrypt.hash(password, BCRYPT_ROUNDS);
    }
    await User.updateOne({ _id: user._id }, updates);

    res.json({
      token: signAuthToken(user),
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        profileImage: user.profileImage
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed. Please try again.' });
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

    const user = await verifyAuthToken(authHeader.substring(7));

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
    } else if (error.name === 'JsonWebTokenError' || error.name === 'AuthTokenError') {
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
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

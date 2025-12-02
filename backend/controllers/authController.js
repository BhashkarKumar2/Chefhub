import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { verifyFirebaseToken, getFirebaseUserByPhone } from '../services/smsService.js';

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  // console.log('Registration request:', req.body);
  
  try {
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hash = await bcrypt.hash(password, 10);
    const newUser = new User({ 
      name, 
      email, 
      password: hash,
      isEmailVerified: false 
    });
    await newUser.save();
    
    // console.log('âœ… User registered successfully:', newUser.email);
    res.status(201).json({ 
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (err) {
    // console.error('âŒ Registration error:', err);
    res.status(500).json({ message: err.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  // console.log(req.body);
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(400).json({ message: "User not found" });

    // Check if user has a password (might be OAuth-only user)
    if (!user.password) {
      return res.status(400).json({ 
        message: "No password set for this account. Please use 'Continue with Google' or set a password first.",
        isOAuthUser: true
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ 
      id: user._id,
      name: user.name,
      email: user.email 
    }, process.env.JWT_SECRET, { expiresIn: "1d" });

    // Remove password from user object before sending
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ token, user: userResponse });
  } catch (err) {
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
    // console.error('Token validation error:', error);
    
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
    // console.error('Get current user error:', error);
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
      // console.log('âœ… New user created:', user.phone);
    } else {
      // Update phone verification status and Firebase UID
      user.isPhoneVerified = true;
      user.firebaseUid = firebaseUser.uid;
      if (firebaseUser.email && !user.email) {
        user.email = firebaseUser.email;
      }
      await user.save();
      // console.log('âœ… Existing user updated:', user.phone);
    }
    
    // Generate JWT token for our application
    const token = jwt.sign({ 
      id: user._id,
      name: user.name,
      email: user.email 
    }, process.env.JWT_SECRET, { expiresIn: "1d" });
    
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

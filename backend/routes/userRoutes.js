import express from 'express';
const router = express.Router();
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import User from '../models/User.js';
import { verifyToken, optionalAuth } from '../auth/authMiddleware.js';

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});
// @route   POST /api/users/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/login
// @desc    Login user and return JWT
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Create JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile/:id
// @desc    Update user profile
// @access  Private (protected with auth middleware)
router.put('/profile/:id', verifyToken, async (req, res) => {
  console.log('\n🔥 === USER PROFILE UPDATE STARTED ===');
  console.log('📝 User ID:', req.params.id);
  console.log('📝 Update Data:', JSON.stringify(req.body, null, 2));
  
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('❌ Invalid ObjectId format');
      return res.status(400).json({ 
        message: 'Invalid user ID format',
        error: 'User ID must be a valid MongoDB ObjectId (24-character hex string)',
        receivedId: id,
        suggestion: 'Please provide a valid user ID from login response'
      });
    }
    
    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password'); // Don't return password
    
    if (!updatedUser) {
      console.log('❌ User not found');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('✅ User profile updated successfully');
    console.log('👤 Updated user:', updatedUser);
    console.log('🔥 === USER PROFILE UPDATE COMPLETED ===\n');
    
    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (err) {
    console.error('\n❌ === USER PROFILE UPDATE FAILED ===');
    console.error('🚨 Error:', err);
    console.error('🔥 === ERROR HANDLING COMPLETED ===\n');
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   GET /api/users/profile/:id
// @desc    Get user profile by ID
// @access  Public (with optional auth for own profile)
router.get('/profile/:id', optionalAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/upload-profile-image/:id
// @desc    Upload profile image for user
// @access  Private
router.post('/upload-profile-image/:id', verifyToken, upload.single('profileImage'), async (req, res) => {
  console.log('\n🔥 === USER PROFILE IMAGE UPLOAD STARTED ===');
  console.log('📝 User ID:', req.params.id);
  console.log('📎 File uploaded:', req.file ? `Yes (${req.file.originalname}, ${req.file.size} bytes)` : 'No');
  
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('❌ Invalid ObjectId format');
      return res.status(400).json({ 
        message: 'Invalid user ID format',
        error: 'User ID must be a valid MongoDB ObjectId'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ 
        message: 'No image file provided',
        error: 'Please select an image file to upload'
      });
    }

    // Find user
    const user = await User.findById(id);
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('🖼️ Processing image upload...');
    
    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    
    console.log('☁️ Uploading to Cloudinary...');
    
    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: 'user-profiles',
      transformation: [
        { width: 400, height: 400, crop: 'fill' },
        { quality: 'auto', fetch_format: 'auto' }
      ],
      public_id: `user-${id}-${Date.now()}`
    });

    console.log('✅ Cloudinary upload successful:', uploadResult.secure_url);

    // Delete old image from Cloudinary if exists
    if (user.profileImage && user.profileImage.includes('cloudinary')) {
      try {
        const publicId = user.profileImage.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`user-profiles/${publicId}`);
        console.log('🗑️ Old profile image deleted from Cloudinary');
      } catch (deleteError) {
        console.log('⚠️ Could not delete old image:', deleteError.message);
      }
    }

    // Update user with new profile image
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { profileImage: uploadResult.secure_url },
      { new: true, runValidators: true }
    ).select('-password');

    console.log('✅ User profile image updated successfully');
    console.log('🔥 === USER PROFILE IMAGE UPLOAD COMPLETED ===\n');
    
    res.json({
      message: 'Profile image uploaded successfully',
      user: updatedUser,
      imageUrl: uploadResult.secure_url
    });

  } catch (err) {
    console.error('\n❌ === USER PROFILE IMAGE UPLOAD FAILED ===');
    console.error('🚨 Error:', err);
    console.error('🔥 === ERROR HANDLING COMPLETED ===\n');
    res.status(500).json({ 
      message: 'Failed to upload profile image', 
      error: err.message 
    });
  }
});

export default router;

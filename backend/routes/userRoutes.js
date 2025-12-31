import express from 'express';
const router = express.Router();
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import User from '../models/User.js';
import Testimonial from '../models/Testimonial.js';
import { verifyToken, optionalAuth } from '../auth/authMiddleware.js';
import { validate, updateProfileValidationRules } from '../middleware/validationMiddleware.js';

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
// DEPRECATED: Registration and Login have been moved to /api/auth
// Use authRoutes for better security (OTP, OAuth, standardized error messages)

// router.post('/register', ...) - Removed
// router.post('/login', ...) - Removed

// @route   PUT /api/users/profile/:id
// @desc    Update user profile
// @access  Private (protected with auth middleware)
router.put('/profile/:id', verifyToken, updateProfileValidationRules(), validate, async (req, res) => {
  // console.log('\nðŸ”¥ === USER PROFILE UPDATE STARTED ===');
  // console.log('ðŸ“ User ID:', req.params.id);
  // console.log('ðŸ“ Update Data:', JSON.stringify(req.body, null, 2));

  try {
    const { id } = req.params;
    const updateData = req.body;

    // SECURITY: Ownership check - users can only update their own profile
    if (req.user.id.toString() !== id.toString() && req.user._id?.toString() !== id.toString()) {
      return res.status(403).json({
        message: 'Access denied. You can only update your own profile.'
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      // console.log('âŒ Invalid ObjectId format');
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
      // console.log('âŒ User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    // console.log('âœ… User profile updated successfully');
    // console.log('ðŸ‘¤ Updated user:', updatedUser);
    // console.log('ðŸ”¥ === USER PROFILE UPDATE COMPLETED ===\n');

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (err) {
    // console.error('\n❌ === USER PROFILE UPDATE FAILED ===');
    // console.error('🚨 Error:', err);
    // console.error('🔥 === ERROR HANDLING COMPLETED ===\n');

    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        message: errors[0] || 'Validation failed',
        errors: errors
      });
    }

    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        message: `This ${field} is already registered`
      });
    }

    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   GET /api/users/profile/:id
// @desc    Get user profile by ID
// @access  Public (with optional auth for own profile)
router.get('/profile/:id', optionalAuth, async (req, res) => {
  // console.log('ðŸ” Getting user profile for ID:', req.params.id);
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      // console.log('âŒ User not found:', req.params.id);
      return res.status(404).json({ message: 'User not found' });
    }
    // console.log('âœ… User profile found:', user.email);
    res.json(user);
  } catch (err) {
    // console.error('âŒ Get user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/upload-profile-image/:id
// @desc    Upload profile image for user
// @access  Private
router.post('/upload-profile-image/:id', verifyToken, upload.single('profileImage'), async (req, res) => {
  // console.log('\nðŸ”¥ === USER PROFILE IMAGE UPLOAD STARTED ===');
  // console.log('ðŸ“ User ID:', req.params.id);
  // console.log('ðŸ“Ž File uploaded:', req.file ? `Yes (${req.file.originalname}, ${req.file.size} bytes)` : 'No');

  try {
    const { id } = req.params;

    // SECURITY: Ownership check - users can only upload their own profile image
    if (req.user.id.toString() !== id.toString() && req.user._id?.toString() !== id.toString()) {
      return res.status(403).json({
        message: 'Access denied. You can only update your own profile image.'
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      // console.log('âŒ Invalid ObjectId format');
      return res.status(400).json({
        message: 'Invalid user ID format',
        error: 'User ID must be a valid MongoDB ObjectId'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      // console.log('âŒ No file uploaded');
      return res.status(400).json({
        message: 'No image file provided',
        error: 'Please select an image file to upload'
      });
    }

    // Find user
    const user = await User.findById(id);
    if (!user) {
      // console.log('âŒ User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    // console.log('🖼️ Processing image upload...');

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // console.log('â˜ï¸ Uploading to Cloudinary...');

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: 'user-profiles',
      transformation: [
        { width: 400, height: 400, crop: 'fill' },
        { quality: 'auto', fetch_format: 'auto' }
      ],
      public_id: `user-${id}-${Date.now()}`
    });

    // console.log('âœ… Cloudinary upload successful:', uploadResult.secure_url);

    // Delete old image from Cloudinary if exists
    if (user.profileImage && user.profileImage.includes('cloudinary')) {
      try {
        const publicId = user.profileImage.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`user-profiles/${publicId}`);
        // console.log('ðŸ—‘ï¸ Old profile image deleted from Cloudinary');
      } catch (deleteError) {
        // console.log('âš ï¸ Could not delete old image:', deleteError.message);
      }
    }

    // Update user with new profile image
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { profileImage: uploadResult.secure_url },
      { new: true, runValidators: true }
    ).select('-password');

    // console.log('âœ… User profile image updated successfully');
    // console.log('ðŸ”¥ === USER PROFILE IMAGE UPLOAD COMPLETED ===\n');

    res.json({
      message: 'Profile image uploaded successfully',
      user: updatedUser,
      imageUrl: uploadResult.secure_url
    });

  } catch (err) {
    // console.error('\nâŒ === USER PROFILE IMAGE UPLOAD FAILED ===');
    // console.error('ðŸš¨ Error:', err);
    // console.error('📍¥ === ERROR HANDLING COMPLETED ===\n');
    res.status(500).json({
      message: 'Failed to upload profile image',
      error: err.message
    });
  }
});

// @route   GET /api/user/dashboard/batch
// @desc    Get all dashboard data in one request (batched)
// @access  Private
router.get('/dashboard/batch', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch data in parallel
    const [user, recentBookings, bookingStats, reviewCount] = await Promise.all([
      User.findById(userId).select('-password').lean(),

      // Get recent bookings for the list
      mongoose.model('Booking').find({ user: userId })
        .populate('chef', 'name profileImage specialty')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      // Aggregate booking stats (total spent, counts)
      mongoose.model('Booking').aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            totalSpent: { $sum: { $cond: [{ $in: ["$status", ["confirmed", "completed"]] }, "$totalPrice", 0] } },
            totalBookings: { $sum: 1 },
            completedCount: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
            upcomingCount: { $sum: { $cond: [{ $in: ["$status", ["confirmed", "pending"]] }, 1, 0] } }
          }
        }
      ]),

      // Count reviews given by user
      Testimonial.countDocuments({ user: userId })
    ]);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const stats = bookingStats[0] || { totalSpent: 0, totalBookings: 0, completedCount: 0, upcomingCount: 0 };

    res.json({
      user,
      bookings: recentBookings || [],
      stats: {
        totalBookings: stats.totalBookings,
        upcomingBookings: stats.upcomingCount,
        completedBookings: stats.completedCount,
        favoriteChefs: user.favorites ? user.favorites.length : 0,
        totalSpent: stats.totalSpent,
        reviewsGiven: reviewCount
      }
    });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch dashboard data',
      error: err.message
    });
  }
});

// @route   GET /api/user/favorites
// @desc    Get user favorites
// @access  Private
router.get('/favorites', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'favorites',
      select: 'name profileImage specialty pricePerHour averageRating totalReviews locationCoords city state bio experienceYears photo serviceableLocations'
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      favorites: user.favorites || []
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   POST /api/user/favorites/:chefId
// @desc    Add chef to favorites
// @access  Private
router.post('/favorites/:chefId', verifyToken, async (req, res) => {
  try {
    const { chefId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(chefId)) {
      return res.status(400).json({ message: 'Invalid chef ID' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already in favorites
    if (user.favorites.includes(chefId)) {
      return res.status(400).json({ message: 'Chef already in favorites' });
    }

    // Add to favorites (limit check handled by schema validation if any, but good to check here too)
    if (user.favorites.length >= 100) {
      return res.status(400).json({ message: 'Favorites limit reached' });
    }

    user.favorites.push(chefId);
    await user.save();

    res.json({ message: 'Added to favorites', favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   DELETE /api/user/favorites/:chefId
// @desc    Remove chef from favorites
// @access  Private
router.delete('/favorites/:chefId', verifyToken, async (req, res) => {
  try {
    const { chefId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove from favorites
    user.favorites = user.favorites.filter(favId => favId.toString() !== chefId);
    await user.save();

    res.json({ message: 'Removed from favorites', favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;

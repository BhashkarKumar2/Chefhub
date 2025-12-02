import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // Essential fields for authentication
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: { 
    type: String, 
    unique: true, 
    sparse: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  
  // OAuth integration fields
  googleId: { 
    type: String, 
    unique: true, 
    sparse: true,
    trim: true
  },
  facebookId: { 
    type: String, 
    unique: true, 
    sparse: true,
    trim: true
  },
  firebaseUid: { 
    type: String, 
    unique: true, 
    sparse: true,
    trim: true
  },
  phone: { 
    type: String, 
    unique: true, 
    sparse: true,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty phone (optional field)
        return /^\+?[1-9]\d{9,14}$/.test(v); // Min 10 digits, max 15 with country code
      },
      message: 'Please provide a valid phone number'
    }
  },
  
  // Optional profile fields (can be updated later)
  profileImage: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Profile image must be a valid URL']
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  
  // Location (simplified)
  city: {
    type: String,
    trim: true,
    maxlength: [100, 'City name cannot exceed 100 characters']
  },
  state: {
    type: String,
    trim: true,
    maxlength: [100, 'State name cannot exceed 100 characters']
  },
  country: {
    type: String,
    trim: true,
    maxlength: [100, 'Country name cannot exceed 100 characters']
  },
  
  // Preferences (simplified)
  cuisinePreferences: {
    type: [String],
    validate: {
      validator: function(arr) {
        return arr.length <= 20;
      },
      message: 'Cannot have more than 20 cuisine preferences'
    }
  },
  
  // Verification status
  isPhoneVerified: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  
  // Password reset fields
  resetPasswordToken: {
    type: String,
    select: false // Don't include in queries by default for security
  },
  resetPasswordExpire: {
    type: Date,
    select: false
  },
  
  // Email verification fields
  emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerificationExpire: {
    type: Date,
    select: false
  },
  
  // Core functionality
  favorites: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chef' }],
    validate: {
      validator: function(arr) {
        return arr.length <= 100;
      },
      message: 'Cannot have more than 100 favorites'
    }
  }
}, {
  timestamps: true
});

// Additional indexes for better query performance
// Note: email, googleId, facebookId, firebaseUid, phone already have indexes via unique: true
userSchema.index({ favorites: 1 }); // For favorite queries

export default mongoose.model('User', userSchema);

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // Essential fields for authentication
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  password: String,
  
  // OAuth integration fields
  googleId: { type: String, unique: true, sparse: true },
  facebookId: { type: String, unique: true, sparse: true },
  firebaseUid: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  
  // Optional profile fields (can be updated later)
  profileImage: String,
  bio: String,
  
  // Location (simplified)
  city: String,
  state: String,
  country: String,
  
  // Preferences (simplified)
  cuisinePreferences: [String],
  
  // Verification status
  isPhoneVerified: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  
  // Password reset fields
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  // Email verification fields
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  
  // Core functionality
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chef' }]
}, {
  timestamps: true
});

// Additional indexes for better query performance
// Note: email, googleId, facebookId, firebaseUid, phone already have indexes via unique: true
userSchema.index({ favorites: 1 }); // For favorite queries

export default mongoose.model('User', userSchema);

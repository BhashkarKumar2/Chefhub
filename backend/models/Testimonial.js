import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  userName: {
    type: String,
    required: [true, 'User name is required'],
    trim: true
  },
  userEmail: {
    type: String,
    required: [true, 'User email is required'],
    trim: true
  },
  userLocation: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  userProfileImage: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  testimonial: {
    type: String,
    required: [true, 'Testimonial text is required'],
    trim: true,
    minlength: [20, 'Testimonial must be at least 20 characters'],
    maxlength: [500, 'Testimonial cannot exceed 500 characters']
  },
  chef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chef'
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  isApproved: {
    type: Boolean,
    default: true // Auto-approve for now, will change to false when admin system is implemented
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
testimonialSchema.index({ user: 1, createdAt: -1 });
testimonialSchema.index({ chef: 1, isApproved: 1 });
testimonialSchema.index({ isApproved: 1, isFeatured: 1, createdAt: -1 });

export default mongoose.model('Testimonial', testimonialSchema);

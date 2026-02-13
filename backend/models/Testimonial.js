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
testimonialSchema.index({ booking: 1 }, { unique: true, sparse: true }); // Prevent duplicate reviews per booking
testimonialSchema.index({ isApproved: 1, isFeatured: 1, createdAt: -1 });
testimonialSchema.index({ isPublic: 1, isFeatured: -1, createdAt: -1 }); // Optimized for home page query

// Post-save hook to update chef rating when testimonial is created or updated
testimonialSchema.post('save', async function () {
  if (this.chef && this.isApproved) {
    try {
      const Chef = mongoose.model('Chef');

      // Aggregate all approved testimonials for this chef
      const stats = await mongoose.model('Testimonial').aggregate([
        {
          $match: {
            chef: this.chef,
            isApproved: true
          }
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 }
          }
        }
      ]);

      if (stats.length > 0) {
        await Chef.findByIdAndUpdate(this.chef, {
          averageRating: Math.round(stats[0].averageRating * 10) / 10, // Round to 1 decimal
          totalReviews: stats[0].totalReviews
        });
      }
    } catch (error) {
      console.error('Error updating chef rating:', error);
    }
  }
});

// Post-remove hook to update chef rating when testimonial is deleted
testimonialSchema.post('findOneAndDelete', async function (doc) {
  if (doc && doc.chef && doc.isApproved) {
    try {
      const Chef = mongoose.model('Chef');

      // Recalculate ratings after deletion
      const stats = await mongoose.model('Testimonial').aggregate([
        {
          $match: {
            chef: doc.chef,
            isApproved: true
          }
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 }
          }
        }
      ]);

      if (stats.length > 0) {
        await Chef.findByIdAndUpdate(doc.chef, {
          averageRating: Math.round(stats[0].averageRating * 10) / 10,
          totalReviews: stats[0].totalReviews
        });
      } else {
        // No reviews left, reset to default
        await Chef.findByIdAndUpdate(doc.chef, {
          averageRating: 0,
          totalReviews: 0
        });
      }
    } catch (error) {
      console.error('Error updating chef rating after deletion:', error);
    }
  }
});

export default mongoose.model('Testimonial', testimonialSchema);

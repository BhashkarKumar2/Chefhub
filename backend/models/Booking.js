import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow bookings without user accounts
  },
  chef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chef',
    required: [true, 'Chef is required for booking']
  },
  date: {
    type: Date,
    required: [true, 'Booking date is required'],
    validate: {
      validator: function(value) {
        return value >= new Date();
      },
      message: 'Booking date cannot be in the past'
    }
  },
  time: {
    type: String,
    required: [true, 'Booking time is required'],
    trim: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 hour'],
    max: [24, 'Duration cannot exceed 24 hours']
  },
  guestCount: {
    type: Number,
    required: [true, 'Guest count is required'],
    min: [1, 'Guest count must be at least 1'],
    max: [1000, 'Guest count cannot exceed 1000']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    minlength: [5, 'Location must be at least 5 characters'],
    maxlength: [300, 'Location cannot exceed 300 characters']
  },
  locationCoords: {
    lat: {
      type: Number,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    lon: {
      type: Number,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    }
  },
  serviceType: {
    type: String,
    required: [true, 'Service type is required'],
    enum: {
      values: ['birthday', 'marriage', 'daily'],
      message: '{VALUE} is not a valid service type'
    },
    index: true
  },
  specialRequests: {
    type: String,
    default: '',
    trim: true,
    maxlength: [1000, 'Special requests cannot exceed 1000 characters']
  },
  addOns: {
    type: [{
      type: String,
      trim: true,
      maxlength: 100
    }],
    validate: {
      validator: function(arr) {
        return arr.length <= 20;
      },
      message: 'Cannot have more than 20 add-ons'
    }
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Price cannot be negative'],
    max: [10000000, 'Price cannot exceed 10,000,000']
  },
  contactInfo: {
    name: {
      type: String,
      trim: true,
      minlength: [2, 'Contact name must be at least 2 characters'],
      maxlength: [100, 'Contact name cannot exceed 100 characters']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true; // Allow empty phone (optional field)
          return /^\+?[1-9]\d{9,14}$/.test(v); // Min 10 digits, max 15 with country code
        },
        message: 'Please provide a valid phone number'
      }
    }
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'cancelled', 'completed'],
      message: '{VALUE} is not a valid status'
    },
    default: 'pending',
    index: true
  },
  paymentStatus: {
    type: String,
    enum: {
      values: ['pending', 'paid', 'failed', 'refunded'],
      message: '{VALUE} is not a valid payment status'
    },
    default: 'pending'
  },
  paymentId: {
    type: String,
    trim: true,
    maxlength: [200, 'Payment ID cannot exceed 200 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  },
  // Service-specific details
  serviceDetails: {
    // For birthday parties
    birthday: {
      ageGroup: {
        type: String,
        enum: {
          values: ['child', 'teen', 'adult'],
          message: '{VALUE} is not a valid age group'
        }
      },
      theme: {
        type: String,
        trim: true,
        maxlength: [100, 'Theme cannot exceed 100 characters']
      },
      cakeRequired: Boolean,
      decorationLevel: {
        type: String,
        enum: {
          values: ['basic', 'premium', 'luxury'],
          message: '{VALUE} is not a valid decoration level'
        }
      }
    },
    // For marriage ceremonies
    marriage: {
      ceremonyType: {
        type: String,
        trim: true,
        maxlength: [100, 'Ceremony type cannot exceed 100 characters']
      },
      cuisineStyle: {
        type: String,
        trim: true,
        maxlength: [100, 'Cuisine style cannot exceed 100 characters']
      },
      servingStyle: {
        type: String,
        enum: {
          values: ['buffet', 'plated', 'family-style'],
          message: '{VALUE} is not a valid serving style'
        }
      },
      vegetarianOnly: Boolean
    },
    // For daily cooking
    daily: {
      mealTypes: {
        type: [{
          type: String,
          enum: {
            values: ['breakfast', 'lunch', 'dinner', 'snacks'],
            message: '{VALUE} is not a valid meal type'
          }
        }],
        validate: {
          validator: function(arr) {
            // Only validate if mealTypes array exists and has items
            if (!arr || arr.length === 0) return true;
            return arr.length <= 4;
          },
          message: 'Cannot select more than 4 meal types'
        }
      },
      dietaryRestrictions: {
        type: [String],
        validate: {
          validator: function(arr) {
            return arr.length <= 10;
          },
          message: 'Cannot have more than 10 dietary restrictions'
        }
      },
      cuisinePreference: {
        type: String,
        trim: true,
        maxlength: [100, 'Cuisine preference cannot exceed 100 characters']
      },
      frequency: {
        type: String,
        enum: {
          values: ['daily', 'weekly', 'bi-weekly', 'monthly'],
          message: '{VALUE} is not a valid frequency'
        }
      },
      startDate: {
        type: Date,
        validate: {
          validator: function(value) {
            return !value || value >= new Date();
          },
          message: 'Start date cannot be in the past'
        }
      },
      endDate: {
        type: Date,
        validate: {
          validator: function(value) {
            return !value || !this.serviceDetails?.daily?.startDate || value > this.serviceDetails.daily.startDate;
          },
          message: 'End date must be after start date'
        }
      }
    }
  },
  // Legacy fields for backward compatibility
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  chefId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chef'
  },
  chefName: {
    type: String,
    trim: true,
    maxlength: [100, 'Chef name cannot exceed 100 characters']
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
bookingSchema.index({ chef: 1, date: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ status: 1, serviceType: 1 });
bookingSchema.index({ date: 1, status: 1 });

// Legacy indexes
bookingSchema.index({ chefId: 1, userId: 1 });

// Virtual for booking duration in a readable format
bookingSchema.virtual('durationText').get(function() {
  if (this.duration === 1) return '1 hour';
  return `${this.duration} hours`;
});

// Virtual for formatted date
bookingSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for service type display name
bookingSchema.virtual('serviceTypeDisplay').get(function() {
  const displayNames = {
    birthday: 'Birthday Party',
    marriage: 'Marriage Ceremony',
    daily: 'Daily Cooking'
  };
  return displayNames[this.serviceType] || this.serviceType;
});

// Pre-save middleware to update the updatedAt field and maintain legacy fields
bookingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Maintain backward compatibility
  if (this.user && !this.userId) this.userId = this.user;
  if (this.chef && !this.chefId) this.chefId = this.chef;
  
  next();
});

// Static method to get bookings by date range
bookingSchema.statics.getBookingsByDateRange = function(startDate, endDate) {
  return this.find({
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).populate('chef user');
};

// Static method to get popular service types
bookingSchema.statics.getServiceTypeStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$serviceType',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' },
        averagePrice: { $avg: '$totalPrice' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Instance method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const bookingDate = new Date(this.date);
  const timeDifference = bookingDate.getTime() - now.getTime();
  const hoursDifference = timeDifference / (1000 * 3600);
  
  // Can be cancelled if more than 24 hours before the booking
  return hoursDifference > 24 && this.status === 'pending';
};

// Instance method to calculate refund amount
bookingSchema.methods.getRefundAmount = function() {
  if (!this.canBeCancelled()) return 0;
  
  const now = new Date();
  const bookingDate = new Date(this.date);
  const timeDifference = bookingDate.getTime() - now.getTime();
  const hoursDifference = timeDifference / (1000 * 3600);
  
  // Refund policy based on cancellation time
  if (hoursDifference > 72) return this.totalPrice; // Full refund
  if (hoursDifference > 48) return this.totalPrice * 0.8; // 80% refund
  if (hoursDifference > 24) return this.totalPrice * 0.5; // 50% refund
  return 0; // No refund
};

// Instance method to check if booking is eligible for review (within 48 hours of completion)
bookingSchema.methods.isReviewEligible = function() {
  if (this.status !== 'completed' || !this.completedAt) {
    return false;
  }
  
  const now = Date.now();
  const completionTime = new Date(this.completedAt).getTime();
  const hoursSinceCompletion = (now - completionTime) / (1000 * 60 * 60);
  
  // Review window is exactly 48 hours after completion
  return hoursSinceCompletion <= 48;
};

export default mongoose.model('Booking', bookingSchema);

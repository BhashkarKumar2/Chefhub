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
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  guestCount: {
    type: Number,
    required: true,
    min: 1
  },
  location: {
    type: String,
    required: true
  },
  locationCoords: {
    lat: {
      type: Number
    },
    lon: {
      type: Number
    }
  },
  serviceType: {
    type: String,
    required: true,
    enum: ['birthday', 'marriage', 'daily'],
    index: true
  },
  specialRequests: {
    type: String,
    default: ''
  },
  addOns: [{
    type: String
  }],
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  contactInfo: {
    name: String,
    email: String,
    phone: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
    index: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String
  },
  notes: {
    type: String
  },
  // Service-specific details
  serviceDetails: {
    // For birthday parties
    birthday: {
      ageGroup: String, // child, teen, adult
      theme: String,
      cakeRequired: Boolean,
      decorationLevel: String // basic, premium, luxury
    },
    // For marriage ceremonies
    marriage: {
      ceremonyType: String, // sangam, reception, mehendi, etc.
      cuisineStyle: String, // north-indian, south-indian, continental, etc.
      servingStyle: String, // buffet, plated, family-style
      vegetarianOnly: Boolean
    },
    // For daily cooking
    daily: {
      mealTypes: [String], // breakfast, lunch, dinner
      dietaryRestrictions: [String],
      cuisinePreference: String,
      frequency: String, // daily, weekly, monthly
      startDate: Date,
      endDate: Date
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
  chefName: String,
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

export default mongoose.model('Booking', bookingSchema);

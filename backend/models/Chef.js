import mongoose from 'mongoose';

const chefSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Chef name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: { 
    type: String, 
    unique: true, 
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
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
  },
  specialty: { 
    type: String, 
    required: [true, 'Specialty/cuisine is required'],
    trim: true,
    minlength: [2, 'Specialty must be at least 2 characters'],
    maxlength: [100, 'Specialty cannot exceed 100 characters']
  },
  address: { 
    type: String,
    trim: true,
    maxlength: [300, 'Address cannot exceed 300 characters']
  }, // Complete address for geocoding
  city: { 
    type: String,
    trim: true,
    maxlength: [100, 'City name cannot exceed 100 characters']
  }, // City for filtering and disambiguation
  state: { 
    type: String,
    trim: true,
    maxlength: [100, 'State name cannot exceed 100 characters']
  }, // State for filtering and disambiguation
  serviceableLocations: {
    type: [{ type: String, trim: true, maxlength: 100 }],
    validate: {
      validator: function(arr) {
        return arr.length <= 50;
      },
      message: 'Cannot have more than 50 serviceable locations'
    }
  }, // Array of locations where chef can provide services
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
  }, // Primary location coordinates for distance calculations
  bio: { 
    type: String, 
    required: [true, 'Bio is required'],
    trim: true,
    minlength: [20, 'Bio must be at least 20 characters'],
    maxlength: [2000, 'Bio cannot exceed 2000 characters']
  },
  pricePerHour: { 
    type: Number, 
    required: [true, 'Price per hour is required'],
    min: [0, 'Price cannot be negative'],
    max: [100000, 'Price per hour cannot exceed 100,000']
  },
  experienceYears: { 
    type: Number, 
    required: [true, 'Experience years is required'],
    min: [0, 'Experience years cannot be negative'],
    max: [80, 'Experience years cannot exceed 80']
  },
  certifications: { 
    type: String,
    trim: true,
    maxlength: [1000, 'Certifications cannot exceed 1000 characters']
  },
  availability: { 
    type: String, 
    default: 'full-time',
    enum: {
      values: ['full-time', 'part-time', 'weekends-only', 'on-demand', 'seasonal'],
      message: '{VALUE} is not a valid availability option'
    }
  },
  profileImage: {
    url: { 
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, 'Profile image URL must be valid']
    },
    publicId: { 
      type: String,
      trim: true
    }
  },
  averageRating: { 
    type: Number, 
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot exceed 5']
  },
  totalReviews: { 
    type: Number, 
    default: 0,
    min: [0, 'Reviews count cannot be negative']
  },
  // Legacy fields for backward compatibility
  rating: { 
    type: Number, 
    default: 0
  },
  reviewsCount: { 
    type: Number, 
    default: 0
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true
});

// Indexes for better query performance
// Note: email already has an index via unique: true
chefSchema.index({ specialty: 1 }); // For cuisine filtering
chefSchema.index({ city: 1 }); // For location filtering
chefSchema.index({ isActive: 1 }); // For filtering active chefs
chefSchema.index({ averageRating: -1 }); // For sorting by rating
chefSchema.index({ rating: -1 }); // Legacy index for backward compatibility
chefSchema.index({ pricePerHour: 1 }); // For price range filtering
chefSchema.index({ 'locationCoords.lat': 1, 'locationCoords.lon': 1 }); // For geo queries
chefSchema.index({ name: 'text', bio: 'text', specialty: 'text' }); // For text search

// Pre-save hook to sync legacy fields for backward compatibility
chefSchema.pre('save', function(next) {
  // Sync new fields to legacy fields
  this.rating = this.averageRating;
  this.reviewsCount = this.totalReviews;
  next();
});

export default mongoose.model('Chef', chefSchema);

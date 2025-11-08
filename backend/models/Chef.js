import mongoose from 'mongoose';

const chefSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String },
  specialty: { type: String, required: true },
  address: { type: String }, // Complete address for geocoding
  city: { type: String }, // City for filtering and disambiguation
  state: { type: String }, // State for filtering and disambiguation
  serviceableLocations: [{ type: String }], // Array of locations where chef can provide services
  locationCoords: {
    lat: { type: Number },
    lon: { type: Number }
  }, // Primary location coordinates for distance calculations
  bio: { type: String, required: true },
  pricePerHour: { type: Number, required: true },
  experienceYears: { type: Number, required: true },
  certifications: { type: String },
  availability: { type: String, default: 'full-time' },
  profileImage: {
    url: { type: String },
    publicId: { type: String }
  },
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Indexes for better query performance
// Note: email already has an index via unique: true
chefSchema.index({ specialty: 1 }); // For cuisine filtering
chefSchema.index({ city: 1 }); // For location filtering
chefSchema.index({ isActive: 1 }); // For filtering active chefs
chefSchema.index({ rating: -1 }); // For sorting by rating
chefSchema.index({ pricePerHour: 1 }); // For price range filtering
chefSchema.index({ 'locationCoords.lat': 1, 'locationCoords.lon': 1 }); // For geo queries
chefSchema.index({ name: 'text', bio: 'text', specialty: 'text' }); // For text search

export default mongoose.model('Chef', chefSchema);

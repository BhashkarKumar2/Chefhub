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

export default mongoose.model('Chef', chefSchema);

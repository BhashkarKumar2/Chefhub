import mongoose from 'mongoose';

// A signup waiting for its email OTP. Lives only in MongoDB and is removed
// automatically by the TTL index once it expires.
//
// Deliberately not unique per email: each signup attempt is its own document
// and a code only verifies the attempt that requested it (by _id). Otherwise
// anyone could re-register a victim's pending email with their own password
// and have the victim's code activate it.
const pendingRegistrationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  // bcrypt hash - the plain password is never stored
  passwordHash: {
    type: String,
    required: true
  },
  // sha256 of the 6-digit code
  otpHash: {
    type: String,
    required: true
  },
  // Wrong codes entered for the current OTP; the signup is discarded at the limit
  attempts: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

pendingRegistrationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('PendingRegistration', pendingRegistrationSchema);

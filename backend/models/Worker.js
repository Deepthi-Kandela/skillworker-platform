const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  category: { type: String, required: true },
  skills: [{ type: String }],
  bio: { type: String, maxlength: 500 },
  experience: { type: Number, default: 0 },
  hourlyRate: { type: Number, required: true },
  portfolio: [{ type: String }],
  idProof: { type: String },
  isVerified: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  availability: {
    days: [{ type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }],
    startTime: { type: String, default: '09:00' },
    endTime: { type: String, default: '18:00' },
  },
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  totalBookings: { type: Number, default: 0 },
  earnings: { type: Number, default: 0 },
  isPremium: { type: Boolean, default: false },
  premiumExpiry: { type: Date },
  walletBalance: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Worker', workerSchema);

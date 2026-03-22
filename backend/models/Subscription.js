const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  worker:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan:      { type: String, enum: ['basic', 'premium', 'pro'], default: 'basic' },
  price:     { type: Number, required: true },
  startDate: { type: Date, default: Date.now },
  endDate:   { type: Date, required: true },
  isActive:  { type: Boolean, default: true },
  features:  [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);

const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  against:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  booking:    { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  subject:    { type: String, required: true },
  description:{ type: String, required: true, maxlength: 1000 },
  status:     { type: String, enum: ['open', 'in-review', 'resolved', 'closed'], default: 'open' },
  adminNote:  { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);

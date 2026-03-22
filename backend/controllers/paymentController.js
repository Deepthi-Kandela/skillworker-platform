const Booking = require('../models/Booking');
const { sendEmail } = require('../services/emailService');

// GET /api/payments/config
const getConfig = (req, res) => {
  res.json({
    upiId: process.env.UPI_ID || 'skillconnect@upi',
    upiName: process.env.UPI_NAME || 'Skill Connect',
    paymentLink: process.env.PAYMENT_LINK || 'http://localhost:3000/pay',
  });
};

// POST /api/payments/confirm-manual
const confirmManual = async (req, res) => {
  try {
    const { bookingId, name, amount } = req.body;
    const screenshotUrl = req.file?.path || null;
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { paymentStatus: 'pending', paymentMethod: 'upi', paymentId: `manual_${Date.now()}` },
      { new: true }
    ).populate('customer', 'email name');

    if (booking?.customer?.email) {
      sendEmail(booking.customer.email, 'payment_receipt', [
        booking.customer.name, booking.service, amount, `UPI_${Date.now()}`
      ]);
    }
    console.log(`[Payment] Booking: ${bookingId} | Name: ${name} | Amount: ₹${amount} | Screenshot: ${screenshotUrl}`);
    res.json({ message: 'Payment confirmation received' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getConfig, confirmManual };

const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { sendEmail } = require('../services/emailService');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const order = await razorpay.orders.create({
      amount: booking.amount * 100,
      currency: 'INR',
      receipt: bookingId,
    });

    booking.orderId = order.id;
    await booking.save();
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency, key: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/payments/confirm-manual — UPI screenshot confirmation
const confirmManual = async (req, res) => {
  try {
    const { bookingId, name, amount } = req.body;
    const screenshotUrl = req.file?.path || null;
    await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: 'pending',
      paymentMethod: 'upi',
      paymentId: `manual_${Date.now()}`,
    });
    console.log(`[Manual Payment] Booking: ${bookingId} | Name: ${name} | Amount: ₹${amount} | Screenshot: ${screenshotUrl}`);
    res.json({ message: 'Payment confirmation received' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(sign).digest('hex');

    if (expectedSign !== razorpay_signature)
      return res.status(400).json({ message: 'Payment verification failed' });

    await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'paid', paymentId: razorpay_payment_id });
    // Send payment receipt email
    const booking = await Booking.findById(bookingId).populate('customer', 'email name');
    if (booking?.customer?.email) {
      sendEmail(booking.customer.email, 'payment_receipt', [booking.customer.name, booking.service, booking.amount, razorpay_payment_id]);
    }
    res.json({ message: 'Payment verified successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createOrder, verifyPayment, confirmManual };

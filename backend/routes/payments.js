const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, confirmManual } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.post('/confirm-manual', protect, upload.single('screenshot'), confirmManual);

// GET /api/payments/config — serve UPI config to frontend
router.get('/config', (req, res) => {
  res.json({
    upiId: process.env.UPI_ID || 'skillconnect@upi',
    upiName: process.env.UPI_NAME || 'Skill Connect',
    paymentLink: process.env.PAYMENT_LINK || 'http://localhost:3000/pay',
  });
});

module.exports = router;

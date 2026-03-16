const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Worker = require('../models/Worker');
const { sendOTP, verifyOTP } = require('../services/otpService');
const { sendEmail } = require('../services/emailService');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/send-otp
const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone number required' });
    const otp = sendOTP(phone);
    // In production: otp is sent via SMS. In dev: visible in server console.
    res.json({ message: `OTP sent to ${phone}`, ...(process.env.NODE_ENV !== 'production' && { otp }) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/verify-otp
const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const result = verifyOTP(phone, otp);
    if (!result.valid) return res.status(400).json({ message: result.message });
    res.json({ message: 'OTP verified successfully', verified: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, address } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already exists' });

    const user = await User.create({ name, email, password, phone, role, address });
    // Send welcome email
    sendEmail(email, 'account_verified', [name]);
    const userObj = user.toObject();
    delete userObj.password;
    res.status(201).json({ token: generateToken(user._id), user: userObj });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.isActive)
      return res.status(403).json({ message: 'Account suspended' });

    const userObj = user.toObject();
    delete userObj.password;
    res.json({ token: generateToken(user._id), user: userObj });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    let workerProfile = null;
    if (user.role === 'worker') workerProfile = await Worker.findOne({ user: user._id });
    res.json({ user, workerProfile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    if (req.file) updates.avatar = req.file.path;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, getProfile, updateProfile, sendOtp, verifyOtp };

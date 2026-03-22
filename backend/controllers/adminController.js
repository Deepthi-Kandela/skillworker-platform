const User = require('../models/User');
const Worker = require('../models/Worker');
const Booking = require('../models/Booking');
const Category = require('../models/Category');
const Complaint = require('../models/Complaint');

const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalWorkers, totalBookings, pendingVerifications] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'worker' }),
      Booking.countDocuments(),
      Worker.countDocuments({ isVerified: false }),
    ]);

    const recentBookings = await Booking.find()
      .populate('customer', 'name')
      .populate('worker', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const revenue = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.json({ totalUsers, totalWorkers, totalBookings, pendingVerifications, recentBookings, revenue: revenue[0]?.total || 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Analytics: bookings per day last 7 days
const getAnalytics = async (req, res) => {
  try {
    const days = 7;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const bookingsByDay = await Booking.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 }, revenue: { $sum: '$amount' } } },
      { $sort: { _id: 1 } },
    ]);

    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const topWorkers = await Worker.find({ isVerified: true })
      .populate('user', 'name avatar')
      .sort({ totalBookings: -1, rating: -1 })
      .limit(5);

    res.json({ bookingsByDay, usersByRole, bookingsByStatus, topWorkers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).select('-password').skip((page - 1) * limit).limit(Number(limit));
    const total = await User.countDocuments(filter);
    res.json({ users, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'suspended'}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const verifyWorker = async (req, res) => {
  try {
    const worker = await Worker.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
    await User.findByIdAndUpdate(worker.user, { isVerified: true });
    res.json({ message: 'Worker verified successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const manageCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getDashboardStats, getAllUsers, toggleUserStatus, verifyWorker, manageCategories, createCategory, getAnalytics };

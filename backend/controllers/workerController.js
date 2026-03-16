const Worker = require('../models/Worker');
const User = require('../models/User');

const createWorkerProfile = async (req, res) => {
  try {
    const existing = await Worker.findOne({ user: req.user._id });
    if (existing) return res.status(400).json({ message: 'Profile already exists' });

    const worker = await Worker.create({ user: req.user._id, ...req.body });
    await User.findByIdAndUpdate(req.user._id, { role: 'worker' });
    res.status(201).json(worker);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateWorkerProfile = async (req, res) => {
  try {
    const updates = req.body;
    if (req.files?.portfolio) updates.portfolio = req.files.portfolio.map(f => f.path);
    if (req.files?.idProof) updates.idProof = req.files.idProof[0].path;
    const worker = await Worker.findOneAndUpdate({ user: req.user._id }, updates, { new: true });
    res.json(worker);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const searchWorkers = async (req, res) => {
  try {
    const { category, city, minRate, maxRate, rating, page = 1, limit = 10 } = req.query;
    const filter = { isVerified: true, isAvailable: true };
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (minRate || maxRate) filter.hourlyRate = {};
    if (minRate) filter.hourlyRate.$gte = Number(minRate);
    if (maxRate) filter.hourlyRate.$lte = Number(maxRate);
    if (rating) filter.rating = { $gte: Number(rating) };

    let query = Worker.find(filter).populate('user', 'name avatar address phone');

    if (city) {
      query = query.where('user.address.city').equals(city);
      const users = await User.find({ 'address.city': { $regex: city, $options: 'i' } }).select('_id');
      const userIds = users.map(u => u._id);
      filter.user = { $in: userIds };
    }

    const workers = await Worker.find(filter)
      .populate('user', 'name avatar address phone')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ rating: -1 });

    const total = await Worker.countDocuments(filter);
    res.json({ workers, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getWorkerById = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id).populate('user', '-password');
    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    res.json(worker);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getNearbyWorkers = async (req, res) => {
  try {
    const { lng, lat, maxDistance = 10000, category } = req.query;
    const filter = { isVerified: true, isAvailable: true };
    if (category) filter.category = category;

    const nearbyUsers = await User.find({
      location: { $near: { $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] }, $maxDistance: Number(maxDistance) } },
      role: 'worker',
    }).select('_id');

    const userIds = nearbyUsers.map(u => u._id);
    filter.user = { $in: userIds };

    const workers = await Worker.find(filter).populate('user', 'name avatar address phone location');
    res.json(workers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Smart recommendation: sort by rating desc, price asc, verified first
const getRecommendedWorkers = async (req, res) => {
  try {
    const { category, limit = 6 } = req.query;
    const filter = { isVerified: true, isAvailable: true };
    if (category) filter.category = { $regex: category, $options: 'i' };

    const workers = await Worker.find(filter)
      .populate('user', 'name avatar address phone')
      .sort({ rating: -1, hourlyRate: 1, totalBookings: -1 })
      .limit(Number(limit));

    res.json(workers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createWorkerProfile, updateWorkerProfile, searchWorkers, getWorkerById, getNearbyWorkers, getRecommendedWorkers };

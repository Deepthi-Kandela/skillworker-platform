const Complaint = require('../models/Complaint');

const createComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.create({ user: req.user._id, ...req.body });
    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user._id })
      .populate('against', 'name')
      .populate('booking', 'service')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('user', 'name email')
      .populate('against', 'name')
      .populate('booking', 'service')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createComplaint, getMyComplaints, getAllComplaints, updateComplaint };

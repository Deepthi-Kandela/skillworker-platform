const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Worker = require('../models/Worker');

const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking || booking.customer.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    if (booking.isReviewed)
      return res.status(400).json({ message: 'Already reviewed' });

    const review = await Review.create({ booking: bookingId, customer: req.user._id, worker: booking.worker, rating, comment });
    booking.isReviewed = true;
    await booking.save();

    const reviews = await Review.find({ worker: booking.worker });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Worker.findOneAndUpdate({ user: booking.worker }, { rating: avgRating.toFixed(1), totalReviews: reviews.length });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getWorkerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ worker: req.params.workerId })
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createReview, getWorkerReviews };

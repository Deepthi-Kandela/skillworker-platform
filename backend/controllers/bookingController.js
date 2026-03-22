const Booking = require('../models/Booking');
const Worker = require('../models/Worker');
const User = require('../models/User');
const { sendSMS } = require('../services/snsService');
const { sendEmail } = require('../services/emailService');
const { createNotification } = require('./notificationController');

const createBooking = async (req, res) => {
  try {
    const booking = await Booking.create({ customer: req.user._id, ...req.body });

    // Notify worker of new job
    const worker = await User.findById(booking.worker).select('phone preferredLang');
    const customer = await User.findById(booking.customer).select('name');
    if (worker?.phone) {
      sendSMS(worker.phone, 'new_job', [booking.service, customer?.name || 'Customer'], worker.preferredLang || 'te');
    }
    // Email worker about new job
    const workerUser = await User.findById(booking.worker).select('email name');
    if (workerUser?.email) sendEmail(workerUser.email, 'worker_new_job', [workerUser.name, booking.service, customer?.name || 'Customer']);

    // In-app notification to worker
    await createNotification(booking.worker, '🔔 New Job Request', `${customer?.name} booked you for ${booking.service}`, 'booking', '/worker/dashboard');

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const filter = req.user.role === 'customer' ? { customer: req.user._id } : { worker: req.user._id };
    const bookings = await Booking.find(filter)
      .populate('customer', 'name phone avatar')
      .populate('worker', 'name phone avatar')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name phone preferredLang')
      .populate('worker', 'name phone preferredLang');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = status;
    await booking.save();

    const custLang = booking.customer?.preferredLang || 'te';
    const workLang = booking.worker?.preferredLang || 'te';

    if (status === 'accepted') {
      if (booking.customer?.phone) {
        sendSMS(booking.customer.phone, 'booking_confirmed', [booking.service, booking.worker?.name || 'Worker'], custLang);
      }
      // Email customer booking confirmed
      const custUser = await User.findById(booking.customer._id).select('email name');
      if (custUser?.email) sendEmail(custUser.email, 'booking_confirmed', [custUser.name, booking.service, new Date(booking.scheduledDate).toLocaleDateString(), booking.worker?.name || 'Worker']);
      await createNotification(booking.customer._id, '✅ Booking Accepted', `Your booking for ${booking.service} has been accepted`, 'booking', '/my-bookings');
    }

    if (status === 'completed') {
      await Worker.findOneAndUpdate({ user: booking.worker._id }, { $inc: { totalBookings: 1, earnings: booking.amount } });
      // Notify customer: job completed
      if (booking.customer?.phone) {
        sendSMS(booking.customer.phone, 'job_completed', [booking.service], custLang);
      }
      // Notify worker: job completed confirmation
      if (booking.worker?.phone) {
        sendSMS(booking.worker.phone, 'job_completed', [booking.service], workLang);
      }
      await createNotification(booking.customer._id, '🎉 Job Completed', `Your ${booking.service} job has been completed`, 'booking', '/my-bookings');
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name phone avatar address')
      .populate('worker', 'name phone avatar');
    if (!booking) return res.status(404).json({ message: 'Not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createBooking, getMyBookings, updateBookingStatus, getBookingById };

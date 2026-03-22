const Message = require('../models/Message');
const Booking = require('../models/Booking');

const getMessages = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const isParticipant =
      booking.customer.toString() === req.user._id.toString() ||
      booking.worker.toString() === req.user._id.toString();
    if (!isParticipant) return res.status(403).json({ message: 'Not authorized' });

    const messages = await Message.find({ booking: bookingId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { booking: bookingId, receiver: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { text } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const receiverId =
      booking.customer.toString() === req.user._id.toString()
        ? booking.worker
        : booking.customer;

    const message = await Message.create({
      booking: bookingId,
      sender: req.user._id,
      receiver: receiverId,
      text,
    });

    const populated = await message.populate('sender', 'name avatar');

    // Emit via socket if available
    if (req.app.get('io')) {
      req.app.get('io').to(bookingId).emit('newMessage', populated);
    }

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMessages, sendMessage };

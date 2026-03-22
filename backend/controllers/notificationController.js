const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);
    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const markRead = async (req, res) => {
  try {
    if (req.params.id === 'all') {
      await Notification.updateMany({ user: req.user._id }, { isRead: true });
    } else {
      await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Helper to create notification (used internally)
const createNotification = async (userId, title, message, type = 'system', link = '') => {
  try {
    await Notification.create({ user: userId, title, message, type, link });
  } catch (err) {
    console.error('[NOTIFICATION ERROR]', err.message);
  }
};

module.exports = { getNotifications, markRead, createNotification };

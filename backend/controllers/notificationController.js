const Notification = require("../models/Notification");

//get all notifications for logged in user
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate("sender", "name profilePic")
      .sort({ createdAt: -1 })
      .limit(30);

    res.status(200).json({ notifications });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//mark as read
const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//mark all as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true },
    );
    res.status(200).json({ message: "All marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };

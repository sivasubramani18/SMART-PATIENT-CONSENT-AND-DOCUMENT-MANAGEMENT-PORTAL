import Notification from '../models/Notification.js';

export async function getMyNotifications(req, res, next) {
  try {
    const userId = req.user._id;

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(40),
      Notification.countDocuments({ userId, read: false })
    ]);

    return res.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    const unreadCount = await Notification.countDocuments({ userId: req.user._id, read: false });

    return res.json({
      success: true,
      notification,
      unreadCount
    });
  } catch (error) {
    next(error);
  }
}

export async function markAllAsRead(req, res, next) {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );

    return res.json({
      success: true,
      message: 'All notifications marked as read.',
      unreadCount: 0
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteNotification(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await Notification.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    const unreadCount = await Notification.countDocuments({ userId: req.user._id, read: false });

    return res.json({
      success: true,
      message: 'Notification deleted.',
      unreadCount
    });
  } catch (error) {
    next(error);
  }
}

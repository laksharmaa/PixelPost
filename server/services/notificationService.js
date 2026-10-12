import Notification from '../mongodb/models/notification.js';
import User from '../mongodb/models/user.js';

export const createNotification = async (io, notificationData) => {
  if (notificationData.fromUser && notificationData.fromUser.userId) {
    if (!notificationData.fromUser.username || notificationData.fromUser.username === notificationData.fromUser.userId) {
      const user = await User.findOne({ userId: notificationData.fromUser.userId });
      if (user && user.username) {
        notificationData.fromUser.username = user.username;
      }
    }
  }

  const notification = await Notification.create(notificationData);
  if (io) {
    io.to(notificationData.userId).emit('notification', notification);
  }

  return notification;
};

export const getUserNotifications = async (userId, page, limit) => {
  const pageLimit = parseInt(limit);
  const [notifications, unreadCount, totalCount] = await Promise.all([
    Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(pageLimit)
      .skip((page - 1) * pageLimit),
    Notification.countDocuments({ userId, isRead: false }),
    Notification.countDocuments({ userId })
  ]);

  return {
    notifications,
    unreadCount,
    totalCount,
    hasMore: totalCount > page * limit
  };
};

export const markNotificationAsRead = (notificationId) =>
  Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });

export const markAllNotificationsAsRead = (userId) =>
  Notification.updateMany({ userId, isRead: false }, { isRead: true });

export const deleteNotification = (notificationId) =>
  Notification.findByIdAndDelete(notificationId);
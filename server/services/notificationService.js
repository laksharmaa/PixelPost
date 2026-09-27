// services/notificationService.js or utils/notificationService.js
import Notification from '../mongodb/models/notification.js';
import User from '../mongodb/models/user.js';

/**
 * Create a notification and emit a socket event
 * 
 * @param {Object} req - Express request object containing the io instance
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Object>} The created notification
 */
// services/notificationService.js
export const createNotification = async (req, notificationData) => {
  if (notificationData.fromUser && notificationData.fromUser.userId) {
    if (!notificationData.fromUser.username || notificationData.fromUser.username === notificationData.fromUser.userId) {
      const user = await User.findOne({ userId: notificationData.fromUser.userId });
      if (user && user.username) {
        notificationData.fromUser.username = user.username;
      }
    }
  }

  const notification = await Notification.create(notificationData);
  const io = req.app.get('io');

  if (io) {
    io.to(notificationData.userId).emit('notification', notification);
  }

  return notification;
};
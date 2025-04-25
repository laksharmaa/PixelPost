// services/notificationService.js or utils/notificationService.js
import Notification from '../mongodb/models/notification.js';

/**
 * Create a notification and emit a socket event
 * 
 * @param {Object} req - Express request object containing the io instance
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Object>} The created notification
 */
// services/notificationService.js
export const createNotification = async (req, notificationData) => {
  try {
    console.log('Creating notification:', notificationData);
    
    // If notification data includes Auth0 user ID in fromUser.username, try to replace it with actual username from user schema
    if (notificationData.fromUser && notificationData.fromUser.userId) {
      // Check if we need to fetch the proper username
      if (!notificationData.fromUser.username || notificationData.fromUser.username === notificationData.fromUser.userId) {
        // Find the user from the database to get their username
        const User = mongoose.model('User');
        const user = await User.findOne({ userId: notificationData.fromUser.userId });
        if (user && user.username) {
          notificationData.fromUser.username = user.username;
        }
      }
    }
    
    // Create notification in the database
    const notification = await Notification.create(notificationData);
    console.log('Notification created:', notification);
    
    // Get the io instance from the request object
    const io = req.app.get('io');
    
    // Emit the notification to the specific user's room
    if (io) {
      console.log(`Emitting notification to user ${notificationData.userId}`);
      io.to(notificationData.userId).emit('notification', notification);
      console.log('Notification emitted via Socket.IO');
    } else {
      console.warn('Socket.IO instance not available in request');
    }
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};
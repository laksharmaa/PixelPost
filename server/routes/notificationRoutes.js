// routes/notificationRoutes.js
import express from 'express';
import Notification from '../mongodb/models/notification.js';

const router = express.Router();

// Get all notifications for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    console.log(`Fetching notifications for userId: ${userId}`);
    console.log(`Auth info:`, req.auth || 'No auth info available'); // Debug auth
    
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((page - 1) * parseInt(limit));
    
    console.log(`Found ${notifications.length} notifications`);
    
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });
    const totalCount = await Notification.countDocuments({ userId });
    
    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
      totalCount,
      hasMore: totalCount > page * limit
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Error fetching notifications' });
  }
});

// Mark notification as read
router.put('/read/:notificationId', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Error updating notification' });
  }
});

// Mark all notifications as read for a user
router.put('/read-all/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
    
    res.status(200).json({ 
      success: true, 
      message: 'All notifications marked as read' 
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, message: 'Error updating notifications' });
  }
});

// Delete a notification
router.delete('/:notificationId', async (req, res) => {
  try {
    const result = await Notification.findByIdAndDelete(req.params.notificationId);
    
    if (!result) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Notification deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, message: 'Error deleting notification' });
  }
});

export default router;
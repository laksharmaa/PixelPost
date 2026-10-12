import {
  deleteNotification,
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead
} from '../services/notificationService.js';

export const listForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const result = await getUserNotifications(userId, page, limit);

    res.status(200).json({
      success: true,
      data: result.notifications,
      unreadCount: result.unreadCount,
      totalCount: result.totalCount,
      hasMore: result.hasMore
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Error fetching notifications' });
  }
};

export const markRead = async (req, res) => {
  try {
    const notification = await markNotificationAsRead(req.params.notificationId);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Error updating notification' });
  }
};

export const markAllRead = async (req, res) => {
  try {
    await markAllNotificationsAsRead(req.params.userId);
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, message: 'Error updating notifications' });
  }
};

export const remove = async (req, res) => {
  try {
    const notification = await deleteNotification(req.params.notificationId);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, message: 'Error deleting notification' });
  }
};
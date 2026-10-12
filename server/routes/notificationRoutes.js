// routes/notificationRoutes.js
import express from 'express';
import * as notificationController from '../controllers/notificationController.js';

const router = express.Router();

// Get all notifications for a user
router.get('/:userId', notificationController.listForUser);

// Mark notification as read
router.put('/read/:notificationId', notificationController.markRead);

// Mark all notifications as read for a user
router.put('/read-all/:userId', notificationController.markAllRead);

// Delete a notification
router.delete('/:notificationId', notificationController.remove);

export default router;
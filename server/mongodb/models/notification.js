// mongodb/models/notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: {
    type: String, // ID of the user receiving the notification
    required: true,
    index: true, // Add index for faster lookup by userId
  },
  message: {
    type: String, // Notification message (e.g., "UserX liked your post")
    required: true,
  },
  type: {
    type: String, // Type of notification
    enum: ['like', 'comment', 'follow', 'bookmark', 'reaction'], // Added 'reaction'
    required: true,
  },
  // For reaction notifications
  reactionType: {
    type: String,
    enum: ['like', 'love', 'haha', 'wow', 'fire'],
    // Required only when type is 'reaction'
  },
  fromUser: {
    userId: String,
    username: String,
  },
  postId: {
    type: String, // Optional reference to the post
  },
  postImage: {
    type: String, // Optional image URL for the post
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create index for sorting and filtering
notificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
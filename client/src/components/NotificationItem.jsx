// src/components/NotificationItem.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  BookmarkIcon,
  UserPlusIcon,
  FireIcon,
  FaceSmileIcon
} from '@heroicons/react/24/solid';

const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
  // Determine notification icon based on type
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'like':
        return <HeartIcon className="w-5 h-5 text-red-500" />;
      case 'comment':
        return <ChatBubbleLeftIcon className="w-5 h-5 text-blue-500" />;
      case 'follow':
        return <UserPlusIcon className="w-5 h-5 text-purple-500" />;
      case 'bookmark':
        return <BookmarkIcon className="w-5 h-5 text-yellow-500" />;
      case 'reaction':
        // Show different icons based on reaction subtype
        switch (notification.reactionType) {
          case 'like':
            return <HeartIcon className="w-5 h-5 text-yellow-500" />;
          case 'love':
            return <HeartIcon className="w-5 h-5 text-red-500" />;
          case 'haha':
            return <FaceSmileIcon className="w-5 h-5 text-yellow-500" />;
          case 'wow':
            return <FaceSmileIcon className="w-5 h-5 text-purple-500" />;
          case 'fire':
            return <FireIcon className="w-5 h-5 text-orange-500" />;
          default:
            return <FaceSmileIcon className="w-5 h-5 text-blue-500" />;
        }
      default:
        return <HeartIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  // Format time as "5 minutes ago" etc.
  const timeAgo = notification.createdAt 
    ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
    : '';

  // Generate appropriate link based on notification type
  const getNotificationLink = () => {
    switch (notification.type) {
      case 'like':
      case 'comment':
      case 'bookmark':
      case 'reaction':
        return notification.postId ? `/post/${notification.postId}` : '#';
      case 'follow':
        return notification.fromUser?.userId ? `/profile/${notification.fromUser.userId}` : '#';
      default:
        return '#';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`
        border-b last:border-b-0 dark:border-gray-700
        p-4 transition-colors duration-200
        ${notification.isRead ? 
          'bg-white dark:bg-gray-800' : 
          'bg-blue-50 dark:bg-blue-900/20'
        }
        ${notification.isRead ? '' : 'border-l-4 border-l-blue-500'}
      `}
    >
      <Link 
        to={getNotificationLink()} 
        className="flex items-start gap-3"
        onClick={() => !notification.isRead && onMarkAsRead(notification._id)}
      >
        {/* User image or notification icon */}
        <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          {notification.fromUser?.profileImage ? (
            <img 
              src={notification.fromUser.profileImage} 
              alt={notification.fromUser.username || "User"} 
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="p-2">
              {getNotificationIcon()}
            </div>
          )}
        </div>
        
        {/* Notification content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-800 dark:text-gray-200">
            {notification.message}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {timeAgo}
          </p>
        </div>
        
        {/* Post thumbnail if available */}
        {notification.postImage && (
          <div className="h-12 w-12 flex-shrink-0 rounded overflow-hidden">
            <img 
              src={notification.postImage} 
              alt="Post thumbnail" 
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </Link>
      
      {/* Actions menu */}
      <div className="mt-2 flex justify-end items-center space-x-2">
        {!notification.isRead && (
          <button 
            onClick={() => onMarkAsRead(notification._id)}
            className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Mark as read
          </button>
        )}
        <button 
          onClick={() => onDelete(notification._id)}
          className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        >
          Delete
        </button>
      </div>
    </motion.div>
  );
};

export default NotificationItem;
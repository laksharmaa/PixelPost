// src/components/NotificationToast.jsx
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  HeartIcon, 
  ChatBubbleLeftIcon,
  BookmarkIcon,
  UserPlusIcon,
  FireIcon,
  FaceSmileIcon,
  XMarkIcon
} from '@heroicons/react/24/solid';

const NotificationToast = ({ notification, onClose, autoClose = true }) => {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto close after 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

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

  // Generate link based on notification type
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
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className={`
        fixed top-5 right-5 z-50 max-w-sm w-full 
        bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden
        border border-gray-100 dark:border-gray-700
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          {/* Notification icon */}
          <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 rounded-full p-2 mr-3">
            {getNotificationIcon()}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <Link to={getNotificationLink()} onClick={onClose}>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                New notification
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {notification.message}
              </p>
            </Link>
          </div>
          
          {/* Close button */}
          <button 
            onClick={onClose}
            className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Progress bar for auto-close */}
        {autoClose && (
          <div className="h-1 bg-gray-100 dark:bg-gray-700 mt-3 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 5, ease: "linear" }}
              className="h-full bg-blue-500"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NotificationToast;
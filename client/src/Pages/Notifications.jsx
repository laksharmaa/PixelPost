import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth0 } from '@auth0/auth0-react';
import io from 'socket.io-client';
import NotificationItem from '../components/NotificationItem';
import { 
  CheckIcon,
  ExclamationCircleIcon,
  BellIcon,
  BellSlashIcon
} from '@heroicons/react/24/outline';

// Socket.io connection
let socket;

const Notifications = () => {
  const { user, getAccessTokenSilently } = useAuth0();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);

  // Function to fetch notifications
  const fetchNotifications = useCallback(async (pageNumber = 1, append = false) => {
    if (!user?.sub) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching notifications for user:", user.sub);
      console.log("API URL:", `${import.meta.env.VITE_BASE_URL}/api/v1/notifications/${encodeURIComponent(user.sub)}?page=${pageNumber}&limit=10`);
      
      const token = await getAccessTokenSilently();
      
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/notifications/${encodeURIComponent(user.sub)}?page=${pageNumber}&limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error (${response.status}):`, errorText);
        throw new Error(`Failed to fetch notifications: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log("Notifications response:", responseData);
      
      if (responseData.success) {
        setNotifications(prev => append ? [...prev, ...responseData.data] : responseData.data);
        setUnreadCount(responseData.unreadCount);
        setHasMore(responseData.hasMore);
        setPage(pageNumber);
      } else {
        setError('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [user, getAccessTokenSilently]);

  // Initialize and connect to socket
  useEffect(() => {
    if (!user?.sub) return;
    
    // Connect to Socket.io server
    socket = io(import.meta.env.VITE_BASE_URL);
    
    // Join the user's notification room
    socket.emit('join', user.sub);
    
    // Listen for new notifications
    socket.on('notification', (newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(count => count + 1);
    });
    
    // Fetch initial notifications
    fetchNotifications();
    
    // Cleanup
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user, fetchNotifications]);

  // Function to mark a notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = await getAccessTokenSilently();
      
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/notifications/read/${notificationId}`,
        {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({})
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      const responseData = await response.json();
      
      if (responseData.success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === notificationId 
              ? { ...notification, isRead: true } 
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Function to mark all notifications as read
  const handleMarkAllAsRead = async () => {
    if (!user?.sub) return;
    
    try {
      const token = await getAccessTokenSilently();
      
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/notifications/read-all/${encodeURIComponent(user.sub)}`,
        {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({})
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
      
      const responseData = await response.json();
      
      if (responseData.success) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Function to delete a notification
  const handleDeleteNotification = async (notificationId) => {
    try {
      const token = await getAccessTokenSilently();
      
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/notifications/${notificationId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }
      
      const responseData = await response.json();
      
      if (responseData.success) {
        const deleted = notifications.find(n => n._id === notificationId);
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        
        if (deleted && !deleted.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Function to load more notifications
  const loadMoreNotifications = () => {
    if (hasMore && !loading) {
      fetchNotifications(page + 1, true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-24 lg:pb-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-6"
      >
        <h1 className="text-2xl font-bold dark:text-white flex items-center">
          <BellIcon className="w-6 h-6 mr-2" />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 text-sm bg-blue-500 text-white px-2 py-1 rounded-full">
              {unreadCount} new
            </span>
          )}
        </h1>
        
        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className={`text-sm px-3 py-1 rounded-md flex items-center
              ${unreadCount > 0
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/50'
                : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed'
              }`}
          >
            <CheckIcon className="w-4 h-4 mr-1" />
            Mark all as read
          </button>
        )}
      </motion.div>
      
      {/* Error state */}
      {error && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg mb-6 flex items-center"
        >
          <ExclamationCircleIcon className="w-5 h-5 text-red-500 mr-2" />
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </motion.div>
      )}
      
      {/* Loading state for initial load */}
      {loading && notifications.length === 0 && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="border dark:border-gray-700 rounded-lg p-4 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Empty state */}
      {!loading && notifications.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 border dark:border-gray-700 rounded-lg"
        >
          <div className="flex justify-center">
            <BellSlashIcon className="w-16 h-16 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
            No notifications yet
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            When someone likes, comments, or bookmarks your posts, you'll see notifications here.
          </p>
        </motion.div>
      )}
      
      {/* Notification list */}
      <div className="border dark:border-gray-700 rounded-lg overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
        <AnimatePresence>
          {notifications.map(notification => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDeleteNotification}
            />
          ))}
        </AnimatePresence>
      </div>
      
      {/* Load more button */}
      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={loadMoreNotifications}
            disabled={loading}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              'Load more'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;
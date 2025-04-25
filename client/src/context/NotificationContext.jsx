import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import io from 'socket.io-client';
import NotificationToast from '../components/NotificationToast';

// Create context
const NotificationContext = createContext();

// Socket.io connection
let socket;

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNotification, setLatestNotification] = useState(null);
  const [showToast, setShowToast] = useState(false);

  // Fetch unread notification count on initial load
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!isAuthenticated || !user?.sub) return;
      
      try {
        const token = await getAccessTokenSilently();
        
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/v1/notifications/${encodeURIComponent(user.sub)}?page=1&limit=1`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch notification count');
        }
        
        const data = await response.json();
        if (data.success) {
          setUnreadCount(data.unreadCount);
        }
      } catch (error) {
        console.error('Error fetching notification count:', error);
      }
    };

    fetchUnreadCount();
  }, [isAuthenticated, user, getAccessTokenSilently]);

  // Connect to Socket.io for real-time notifications
  useEffect(() => {
    if (!isAuthenticated || !user?.sub) return;
    
    // Connect to Socket.io server
    socket = io(import.meta.env.VITE_BASE_URL);
    
    // Join user's notification room
    socket.emit('join', user.sub);
    
    // Listen for new notifications
    socket.on('notification', (newNotification) => {
      setUnreadCount(count => count + 1);
      setLatestNotification(newNotification);
      setShowToast(true);
    });
    
    // Cleanup
    return () => {
      if (socket) socket.disconnect();
    };
  }, [isAuthenticated, user]);

  const markAsRead = async (notificationId) => {
    if (!isAuthenticated) return;
    
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
      
      const data = await response.json();
      if (data.success) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!isAuthenticated || !user?.sub) return;
    
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

      const data = await response.json();
      if (data.success) {
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const resetUnreadCount = () => {
    setUnreadCount(0);
  };

  const hideToast = () => {
    setShowToast(false);
  };

  return (
    <NotificationContext.Provider value={{
      unreadCount,
      markAsRead,
      markAllAsRead,
      resetUnreadCount
    }}>
      {children}
      
      {/* Toast notification */}
      {showToast && latestNotification && (
        <NotificationToast
          notification={latestNotification}
          onClose={hideToast}
        />
      )}
    </NotificationContext.Provider>
  );
};

// Custom hook for easier context use
export const useNotifications = () => useContext(NotificationContext);

export default NotificationContext;
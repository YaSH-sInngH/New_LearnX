import React, { createContext, useContext, useState, useEffect } from 'react';
import socketService from '../services/socketService';
import { getNotifications } from '../api/notifications';
import { useAuth } from '../auth/AuthProvider';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      connectSocket();
    }
    return () => {
      socketService.disconnect();
    };
    // eslint-disable-next-line
  }, [user]);

  const connectSocket = () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const socket = socketService.connect(token);
        socketService.onNewNotification((newNotification) => {
          console.log('Received notification:', newNotification);
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        });
      }
    } catch (error) {
      console.warn('Failed to connect to socket:', error.message);
      // Don't throw error, just continue without socket
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (error) {
      console.warn('Failed to fetch notifications:', error.message);
      // Don't throw error, just set empty state
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      setNotifications,
      unreadCount,
      setUnreadCount,
      fetchNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}

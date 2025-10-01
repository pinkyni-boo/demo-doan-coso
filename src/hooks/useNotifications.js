import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const useNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newNotifications, setNewNotifications] = useState([]);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !isOnline) return;

      const response = await axios.get(
        'http://localhost:5000/api/notifications/unread-count',
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000 // 5 second timeout
        }
      );

      if (response.data.success) {
        setUnreadCount(response.data.count);
        setIsOnline(true);
        setRetryCount(0);
      }
    } catch (error) {
      console.warn('Could not fetch notifications - server may be offline');
      setIsOnline(false);
      setRetryCount(prev => prev + 1);
      
      // Don't stop completely, just extend the interval
      if (retryCount < 3) {
        // Keep trying with longer intervals
        setTimeout(() => {
          setIsOnline(true);
        }, 30000); // Wait 30 seconds before trying again
      }
    }
  }, [isOnline, retryCount]);

  // Fetch all notifications
  const fetchNotifications = useCallback(async (page = 1, limit = 20) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(
        `http://localhost:5000/api/notifications?page=${page}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch new notifications since last check
  const fetchNewNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !lastFetchTime || !isOnline) return;

      const response = await axios.get(
        `http://localhost:5000/api/notifications?since=${lastFetchTime.toISOString()}&limit=5`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        }
      );

      if (response.data.success && response.data.notifications.length > 0) {
        const newNotifs = response.data.notifications;
        setNewNotifications(prev => [...newNotifs, ...prev.slice(0, 2)]); // Keep max 3 new notifications
        setUnreadCount(response.data.unreadCount);
        
        // Update notifications list
        setNotifications(prev => {
          const existingIds = prev.map(n => n._id);
          const filtered = newNotifs.filter(n => !existingIds.includes(n._id));
          return [...filtered, ...prev];
        });
        
        setIsOnline(true);
        setRetryCount(0);
      }
    } catch (error) {
      console.warn('Could not fetch new notifications');
      setIsOnline(false);
    }
  }, [lastFetchTime, isOnline]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.patch(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true, readAt: new Date() }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Remove from new notifications
      setNewNotifications(prev => 
        prev.filter(notif => notif._id !== notificationId)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.patch(
        'http://localhost:5000/api/notifications/read-all',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true, readAt: new Date() }))
      );
      setUnreadCount(0);
      setNewNotifications([]);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);

  // Remove new notification from toast
  const removeNewNotification = useCallback((notificationId) => {
    setNewNotifications(prev => 
      prev.filter(notif => notif._id !== notificationId)
    );
  }, []);

  // Auto refresh unread count and check for new notifications
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Initial fetch with delay to avoid spam
    const initialTimeout = setTimeout(() => {
      fetchUnreadCount();
      setLastFetchTime(new Date());
    }, 1000);

    // Set up interval for auto refresh with longer intervals
    const countInterval = setInterval(fetchUnreadCount, 60000); // 60 seconds
    const newNotifInterval = setInterval(fetchNewNotifications, 30000); // 30 seconds

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(countInterval);
      clearInterval(newNotifInterval);
    };
  }, [fetchUnreadCount, fetchNewNotifications]);

  // Initialize unreadCount to 0 if token exists but count is undefined
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && unreadCount === undefined) {
      setUnreadCount(0);
    }
  }, [unreadCount]);

  // Update last fetch time when notifications are fetched
  useEffect(() => {
    if (notifications.length > 0) {
      setLastFetchTime(new Date());
    }
  }, [notifications]);

  return {
    unreadCount,
    notifications,
    newNotifications,
    loading,
    fetchUnreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    removeNewNotification
  };
};

export default useNotifications;
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export default function useNotifications(user) {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    // Only fetch if user is logged in
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUnreadCount(0);
        return;
      }

      const res = await axios.get("/api/notifications/unread-count", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.log("Failed to fetch notifications:", err.message);
      setUnreadCount(0);
    }
  }, [user]);

  useEffect(() => {
    // Only start fetching if user exists
    if (!user) {
      setUnreadCount(0);
      return;
    }

    fetchUnreadCount(); // Lần đầu load
    const interval = setInterval(fetchUnreadCount, 10000); // Mỗi 10s
    return () => clearInterval(interval);
  }, [fetchUnreadCount, user]);

  return { unreadCount };
}

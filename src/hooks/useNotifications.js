import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export default function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/notifications/unread-count", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount(); // Lần đầu load
    const interval = setInterval(fetchUnreadCount, 10000); // Mỗi 10s
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return { unreadCount };
}
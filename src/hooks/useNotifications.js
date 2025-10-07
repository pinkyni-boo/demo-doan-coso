import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getToken } from "../utils/tokenUtils";

export default function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) {
        setUnreadCount(0);
        return;
      }

      const res = await axios.get("/api/notifications/unread-count", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.log("Notifications fetch error:", err.response?.status);
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    if (getToken()) {
      fetchUnreadCount(); // Lần đầu load
      const interval = setInterval(fetchUnreadCount, 10000); // Mỗi 10s
      return () => clearInterval(interval);
    }
  }, [fetchUnreadCount]);

  return { unreadCount };
}

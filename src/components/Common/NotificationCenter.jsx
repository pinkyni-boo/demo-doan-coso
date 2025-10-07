import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Bell,
  X,
  Check,
  Calendar,
  CreditCard,
  Users,
  Info,
  CheckCircle2,
  Eye,
  ChevronRight,
} from "lucide-react";

const NotificationCenter = ({
  isOpen,
  onClose,
  userRole,
  onUnreadCountChange,
}) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const modalRef = useRef(null);
  const navigate = useNavigate();

  // Handle click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("No auth token found");
        setNotifications([]);
        setUnreadCount(0);
        if (onUnreadCountChange) {
          onUnreadCountChange(0);
        }
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/notifications",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const userNotifications = response.data.notifications || [];
        setNotifications(userNotifications);
        // Chỉ đếm thông báo chưa đọc của user hiện tại
        const userUnreadCount = userNotifications.filter(
          (n) => !n.isRead
        ).length;
        setUnreadCount(userUnreadCount);
        // Thông báo cho parent component
        if (onUnreadCountChange) {
          onUnreadCountChange(userUnreadCount);
        }
      } else {
        console.log("API returned unsuccessful response");
        setNotifications([]);
        setUnreadCount(0);
        if (onUnreadCountChange) {
          onUnreadCountChange(0);
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      console.log("API error - setting empty notifications");
      setNotifications([]);
      setUnreadCount(0);
      if (onUnreadCountChange) {
        onUnreadCountChange(0);
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to get navigation path based on notification type
  const getNavigationPath = (notification) => {
    // If notification has explicit navigationPath, use it
    if (notification.navigationPath) {
      return notification.navigationPath;
    }

    // Otherwise, determine based on type and user role
    switch (notification.type) {
      case "schedule":
        if (userRole === "admin") return "/admin/dashboard";
        if (userRole === "trainer") return "/trainer/schedule-requests";
        return "/my-classes";
      case "payment":
      case "payment-rejected":
        return "/payment";
      case "attendance":
        return "/classes";
      case "membership":
        return "/membership";
      case "trainer":
        return "/trainer/schedule";
      case "admin":
        return "/admin/dashboard";
      default:
        return "/club"; // Default fallback
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      markAsRead(notification._id);
    }

    // Navigate to relevant page
    const path = getNavigationPath(notification);
    navigate(path);

    // Close the notification center
    onClose();
  };

  const markAsRead = async (notificationId) => {
    try {
      // Cập nhật state local ngay lập tức
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );

      // Cập nhật unread count
      const newUnreadCount = Math.max(0, unreadCount - 1);
      setUnreadCount(newUnreadCount);
      if (onUnreadCountChange) {
        onUnreadCountChange(newUnreadCount);
      }

      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("No auth token found");
        return;
      }

      await axios.patch(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId
            ? { ...notif, isRead: true, readAt: new Date() }
            : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("No auth token found");
        return;
      }

      await axios.patch(
        "http://localhost:5000/api/notifications/read-all",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true, readAt: new Date() }))
      );
      setUnreadCount(0);
      if (onUnreadCountChange) {
        onUnreadCountChange(0);
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const getNotificationIcon = (type) => {
    try {
      switch (type) {
        case "schedule":
          return <Calendar className="h-4 w-4 text-blue-600" />;
        case "payment":
          return <CreditCard className="h-4 w-4 text-green-600" />;
        case "payment-rejected":
          return <CreditCard className="h-4 w-4 text-red-600" />;
        case "attendance":
          return <Users className="h-4 w-4 text-purple-600" />;
        default:
          return <Info className="h-4 w-4 text-gray-600" />;
      }
    } catch (error) {
      console.error("Error getting notification icon:", error);
      return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationBg = (type) => {
    switch (type) {
      case "schedule":
        return "bg-blue-50 border-blue-200";
      case "payment":
        return "bg-green-50 border-green-200";
      case "payment-rejected":
        return "bg-red-50 border-red-200";
      case "attendance":
        return "bg-purple-50 border-purple-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const formatTime = (date) => {
    if (!date) return "Không rõ thời gian";

    try {
      const now = new Date();
      const notificationDate = new Date(date);

      // Check if date is valid
      if (isNaN(notificationDate.getTime())) {
        return "Thời gian không hợp lệ";
      }

      const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));

      if (diffInMinutes < 1) {
        return "Vừa xong";
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes} phút trước`;
      } else if (diffInMinutes < 1440) {
        // 24 hours
        const hours = Math.floor(diffInMinutes / 60);
        return `${hours} giờ trước`;
      } else if (diffInMinutes < 10080) {
        // 7 days
        const days = Math.floor(diffInMinutes / 1440);
        return `${days} ngày trước`;
      } else {
        return notificationDate.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      }
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Lỗi thời gian";
    }
  };

  if (!isOpen) return null;

  console.log("NotificationCenter render:", {
    notifications,
    loading,
    unreadCount,
  });

  return (
    <div
      ref={modalRef}
      className="w-96 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col overflow-hidden relative"
      style={{
        maxWidth: "calc(100vw - 2rem)",
        maxHeight: "calc(100vh - 6rem)",
        zIndex: 100000,
      }}
    >
      {/* Arrow pointer */}
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45"></div>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
        <h3 className="text-lg font-bold text-gray-900">Thông báo</h3>

        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:bg-blue-50 px-2 py-1 rounded-md transition-colors"
            >
              Đọc tất cả
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
              <p className="text-sm text-gray-500">Đang tải...</p>
            </div>
          </div>
        ) : (notifications || []).length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center px-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bell className="h-6 w-6 text-gray-400" />
              </div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">
                Không có thông báo
              </h4>
              <p className="text-xs text-gray-500">
                Bạn sẽ nhận được thông báo khi có hoạt động mới
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full">
            {(notifications || []).slice(0, 6).map((notification, index) => {
              // Safe guard for notification object
              if (!notification || !notification._id) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="p-3 bg-red-50 text-red-600 text-xs"
                  >
                    Empty notification at index {index}
                  </div>
                );
              }

              return (
                <div
                  key={notification._id}
                  className={`group p-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                    !notification.isRead ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        notification.type === "schedule"
                          ? "bg-blue-100"
                          : notification.type === "payment"
                          ? "bg-green-100"
                          : notification.type === "payment-rejected"
                          ? "bg-red-100"
                          : notification.type === "attendance"
                          ? "bg-purple-100"
                          : "bg-gray-100"
                      }`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Content */}
                      <div className="mb-2">
                        <h4
                          className={`text-sm font-semibold mb-1 ${
                            notification.isRead
                              ? "text-gray-700"
                              : "text-gray-900"
                          }`}
                        >
                          {notification.title || "Thông báo"}
                        </h4>
                        {notification.message && (
                          <p
                            className={`text-xs leading-4 ${
                              notification.isRead
                                ? "text-gray-500"
                                : "text-gray-600"
                            }`}
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              wordBreak: "break-word",
                            }}
                          >
                            {notification.message}
                          </p>
                        )}
                        {/* Navigation hint */}
                        <p className="text-xs text-blue-500 mt-1">
                          👆 Nhấp để xem chi tiết
                        </p>
                      </div>

                      {/* Time and actions */}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-blue-600 font-medium">
                          {formatTime(notification.createdAt)}
                        </span>

                        <div className="flex items-center space-x-2">
                          {!notification.isRead && (
                            <>
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification._id);
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                              >
                                Đọc
                              </button>
                            </>
                          )}
                          {/* Navigate arrow - always visible */}
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0">
        {(notifications || []).length > 6 && (
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 text-center">
            <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
              Xem thêm {(notifications || []).length - 6} thông báo
            </button>
          </div>
        )}

        {(notifications || []).length > 0 &&
          (notifications || []).length <= 6 && (
            <div className="px-3 py-1 bg-gray-50 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">
                {(notifications || []).length} thông báo
              </p>
            </div>
          )}
      </div>
    </div>
  );
};

export default NotificationCenter;

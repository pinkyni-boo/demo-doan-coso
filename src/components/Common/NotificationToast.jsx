import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info,
  X,
  Bell
} from "lucide-react";

const NotificationToast = ({ notifications, onRemove, onMarkAsRead }) => {
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    if (notifications && notifications.length > 0) {
      // Chỉ hiển thị tối đa 3 notifications cùng lúc
      const newNotifications = notifications.slice(0, 3).map(notif => ({
        ...notif,
        id: notif._id || Math.random().toString(),
        timestamp: Date.now()
      }));
      
      setVisibleNotifications(prev => [...newNotifications, ...prev.slice(0, 2)]);

      // Auto remove after 8 seconds
      newNotifications.forEach(notif => {
        setTimeout(() => {
          removeNotification(notif.id);
        }, 8000);
      });
    }
  }, [notifications]);

  const removeNotification = (id) => {
    setVisibleNotifications(prev => prev.filter(notif => notif.id !== id));
    if (onRemove) onRemove(id);
  };

  const handleMarkAsRead = (notification) => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification._id);
    }
    removeNotification(notification.id);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'schedule':
        return <Info className="h-5 w-5" />;
      case 'payment':
        return <CheckCircle className="h-5 w-5" />;
      case 'attendance':
        return <Bell className="h-5 w-5" />;
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'error':
        return <XCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getColors = (type) => {
    switch (type) {
      case 'schedule':
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-500',
          title: 'text-blue-900',
          message: 'text-blue-700'
        };
      case 'payment':
        return {
          bg: 'bg-green-50 border-green-200', 
          icon: 'text-green-500',
          title: 'text-green-900',
          message: 'text-green-700'
        };
      case 'attendance':
        return {
          bg: 'bg-purple-50 border-purple-200',
          icon: 'text-purple-500', 
          title: 'text-purple-900',
          message: 'text-purple-700'
        };
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          icon: 'text-green-500',
          title: 'text-green-900', 
          message: 'text-green-700'
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          icon: 'text-red-500',
          title: 'text-red-900',
          message: 'text-red-700'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-500',
          title: 'text-yellow-900',
          message: 'text-yellow-700'
        };
      default:
        return {
          bg: 'bg-gray-50 border-gray-200',
          icon: 'text-gray-500',
          title: 'text-gray-900',
          message: 'text-gray-700'
        };
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 max-w-sm">
      <AnimatePresence>
        {visibleNotifications.map((notification, index) => {
          const colors = getColors(notification.type);
          const icon = getIcon(notification.type);

          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 400, scale: 0.3 }}
              animate={{ 
                opacity: 1, 
                x: 0, 
                scale: 1,
                transition: { 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }
              }}
              exit={{ 
                opacity: 0, 
                x: 400, 
                scale: 0.3,
                transition: { duration: 0.3 }
              }}
              className={`${colors.bg} border rounded-lg shadow-lg p-4 cursor-pointer hover:shadow-xl transition-shadow`}
              onClick={() => handleMarkAsRead(notification)}
            >
              <div className="flex items-start space-x-3">
                {/* Icon */}
                <div className={`flex-shrink-0 mt-0.5 ${colors.icon}`}>
                  {icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h4 className={`text-sm font-semibold ${colors.title}`}>
                      {notification.title}
                    </h4>
                    
                    {/* Close button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                      className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <p className={`text-sm mt-1 ${colors.message}`}>
                    {notification.message}
                  </p>

                  {/* Timestamp */}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {new Date(notification.createdAt || notification.timestamp).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>

                    {!notification.isRead && (
                      <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                        Mới
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-gray-300 rounded-b-lg overflow-hidden"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 8, ease: "linear" }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default NotificationToast;
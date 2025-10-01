import NotificationService from "../services/NotificationService.js";

// Lấy thông báo của user
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const result = await NotificationService.getUserNotifications(
      userId,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông báo"
    });
  }
};

// Đánh dấu thông báo đã đọc
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await NotificationService.markAsRead(id, userId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông báo"
      });
    }

    res.json({
      success: true,
      message: "Đã đánh dấu thông báo là đã đọc"
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật thông báo"
    });
  }
};

// Đánh dấu tất cả thông báo đã đọc
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await NotificationService.markAllAsRead(userId);

    res.json({
      success: true,
      message: "Đã đánh dấu tất cả thông báo là đã đọc"
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật thông báo"
    });
  }
};

// Lấy số thông báo chưa đọc
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await NotificationService.getUserNotifications(userId, 1, 1);

    res.json({
      success: true,
      unreadCount: result.unreadCount
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy số thông báo chưa đọc"
    });
  }
};
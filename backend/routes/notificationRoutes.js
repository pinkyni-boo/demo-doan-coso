import express from "express";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount
} from "../controllers/notificationController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Tất cả routes cần authentication
router.use(verifyToken);

// Lấy thông báo của user
router.get("/", getUserNotifications);

// Lấy số thông báo chưa đọc
router.get("/unread-count", getUnreadCount);

// Đánh dấu thông báo đã đọc
router.patch("/:id/read", markNotificationAsRead);

// Đánh dấu tất cả thông báo đã đọc
router.patch("/read-all", markAllNotificationsAsRead);

export default router;
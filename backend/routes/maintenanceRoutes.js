import express from "express";
import {
  getAllMaintenanceSchedules,
  createMaintenanceSchedule,
  updateMaintenanceSchedule,
  updateMaintenanceStatus,
  getUpcomingMaintenance,
  getOverdueMaintenance,
  getMaintenanceReport,
  getMaintenanceSchedulesForTrainer,
  checkMaintenanceConflicts,
} from "../controllers/maintenanceController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes for trainers and users - Xem lịch bảo trì
router.get("/trainer", verifyToken, getMaintenanceSchedulesForTrainer); // Trainer xem lịch bảo trì
router.get("/user", verifyToken, getMaintenanceSchedulesForTrainer); // User cũng có thể xem lịch bảo trì
router.get("/check-conflicts", verifyToken, checkMaintenanceConflicts); // Kiểm tra xung đột bảo trì

// Admin routes - Quản lý lịch bảo trì
router.get("/", verifyToken, verifyAdmin, getAllMaintenanceSchedules); // Lấy danh sách lịch bảo trì
router.post("/", verifyToken, verifyAdmin, createMaintenanceSchedule); // Tạo lịch bảo trì mới
router.put("/:id", verifyToken, verifyAdmin, updateMaintenanceSchedule); // Cập nhật thông tin lịch bảo trì
router.patch("/:id/status", verifyToken, verifyAdmin, updateMaintenanceStatus); // Cập nhật trạng thái

// Dashboard routes
router.get("/upcoming", verifyToken, verifyAdmin, getUpcomingMaintenance); // Lịch sắp tới
router.get("/overdue", verifyToken, verifyAdmin, getOverdueMaintenance); // Lịch quá hạn
router.get("/report", verifyToken, verifyAdmin, getMaintenanceReport); // Báo cáo bảo trì

export default router;

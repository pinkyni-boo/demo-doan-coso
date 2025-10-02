import express from "express";
import {
  createIssueReport,
  getMyIssueReports,
  getAllIssueReports,
  getIssueReportById,
  acknowledgeIssueReport,
  createMaintenanceFromReport,
  resolveIssueReport,
  deleteIssueReport,
} from "../controllers/issueReportController.js";
import {
  verifyToken,
  verifyAdmin,
  verifyAdminOrTrainer,
} from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Trainer routes - Báo cáo vấn đề
router.post("/", verifyToken, upload.array("images", 5), createIssueReport); // Tạo báo cáo mới với hình ảnh
router.get("/my-reports", verifyToken, getMyIssueReports); // Lấy báo cáo của trainer

// Admin routes - Xử lý báo cáo
router.get("/", verifyToken, verifyAdmin, getAllIssueReports); // Lấy tất cả báo cáo
router.get("/:id", verifyToken, verifyAdmin, getIssueReportById); // Lấy chi tiết báo cáo theo ID
router.patch(
  "/:id/acknowledge",
  verifyToken,
  verifyAdmin,
  acknowledgeIssueReport
); // Xác nhận báo cáo
router.post(
  "/:reportId/create-maintenance",
  verifyToken,
  createMaintenanceFromReport
); // Tạo lịch bảo trì từ báo cáo - TẠM THỜI CHO TẤT CẢ USER
router.patch("/:id/resolve", verifyToken, verifyAdmin, resolveIssueReport); // Đánh dấu đã giải quyết
router.delete("/:id", verifyToken, verifyAdmin, deleteIssueReport); // Xóa báo cáo

export default router;

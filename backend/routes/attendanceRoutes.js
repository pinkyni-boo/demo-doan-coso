import express from "express";
import mongoose from "mongoose";
import {
  createSession,
  markAttendance,
  getSessionAttendance,
  getClassReport,
  getClassSessions,
  updateClassSession,
  getPaidStudentsCount,
} from "../controllers/attendanceController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Tạo buổi học mới
router.post("/session", verifyToken, createSession);

// Cập nhật session hiện tại của lớp
router.put("/class/:classId/session", verifyToken, updateClassSession);

// Điểm danh học viên
router.post("/mark", verifyToken, markAttendance);

// Lấy danh sách điểm danh của một buổi học
router.get(
  "/session/:classId/:sessionNumber",
  verifyToken,
  getSessionAttendance
);

// Lấy báo cáo điểm danh của lớp
router.get("/class/:classId/report", verifyToken, getClassReport);

// Lấy danh sách sessions
router.get("/class/:classId/sessions", verifyToken, getClassSessions);

// Thêm route mới
router.get("/class/:classId/paid-students", verifyToken, getPaidStudentsCount);

// Route tạm thời để reset
router.delete("/force-reset", verifyToken, async (req, res) => {
  try {
    console.log("🗑️ Dropping attendances collection...");
    await mongoose.connection.db.collection("attendances").drop();
    console.log("✅ Collection dropped successfully");
    res.json({ message: "Đã reset toàn bộ attendance collection và indexes" });
  } catch (error) {
    console.error("Error resetting collection:", error);
    if (error.message.includes("ns not found")) {
      res.json({ message: "Collection không tồn tại hoặc đã được xóa" });
    } else {
      res
        .status(500)
        .json({ message: "Lỗi khi reset collection", error: error.message });
    }
  }
});

// Get user attendance report
router.get("/user/:userId/report", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Kiểm tra quyền truy cập
    if (req.user.id !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Bạn không có quyền xem thông tin này",
      });
    }

    // Tạm thời trả về dữ liệu rỗng
    res.json({
      attendanceRecords: [],
      stats: {
        totalSessions: 0,
        attendedSessions: 0,
        missedSessions: 0,
        attendanceRate: 0,
      },
    });
  } catch (error) {
    console.error("Error fetching attendance report:", error);
    res.status(500).json({
      message: "Lỗi server khi lấy báo cáo điểm danh",
    });
  }
});

export default router;

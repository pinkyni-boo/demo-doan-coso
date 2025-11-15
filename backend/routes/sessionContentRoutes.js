import express from "express";
import {
  createOrUpdateSessionContent,
  getSessionContent,
  getClassSessionContents,
  deleteSessionContent
} from "../controllers/sessionContentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Tạo hoặc cập nhật nội dung buổi học (trainer only)
router.post("/", verifyToken, createOrUpdateSessionContent);

// Lấy tất cả nội dung các buổi học của một lớp (PHẢI ĐẶT TRƯỚC route động)
router.get("/class/:classId", verifyToken, getClassSessionContents);

// Lấy nội dung một buổi học cụ thể
router.get("/:classId/:sessionNumber", verifyToken, getSessionContent);

// Xóa nội dung buổi học (trainer only)
router.delete("/:classId/:sessionNumber", verifyToken, deleteSessionContent);

export default router;

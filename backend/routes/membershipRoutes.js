import express from "express";
import {
  createMembership,
  getUserMembership,
  updateMembership,
  cancelMembership,
  getAllMemberships,
  upgradeMembership,
  getMembershipById,
  deleteMembership,
} from "../controllers/membershipController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Đăng ký thẻ thành viên mới
router.post("/", verifyToken, createMembership);

// Lấy thông tin thẻ thành viên của user
router.get("/user/:userId", verifyToken, getUserMembership);

// Cập nhật thông tin thẻ thành viên
router.put("/:membershipId", verifyToken, updateMembership);

// Hủy thẻ thành viên
router.delete("/:membershipId", verifyToken, cancelMembership);

// Admin - lấy danh sách tất cả thẻ thành viên
router.get("/", verifyToken, verifyAdmin, getAllMemberships);

// Nâng cấp thẻ thành viên
router.put("/upgrade/:id", verifyToken, upgradeMembership);

// Lấy thông tin thẻ thành viên theo ID
router.get("/:membershipId", verifyToken, getMembershipById);

// Xóa thẻ thành viên vĩnh viễn (chỉ cho admin)
router.delete(
  "/permanent/:membershipId",
  verifyToken,
  verifyAdmin,
  deleteMembership
);

export default router;

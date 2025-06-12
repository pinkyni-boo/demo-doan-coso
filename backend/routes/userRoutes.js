import express from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  getUserById,
  updateUserById,
  getAllUsers,
  deleteUser,
  createUserByAdmin,
} from "../controllers/userController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes (cần login) - cho phép cả user và admin
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);
router.put("/change-password", verifyToken, changePassword);

// Admin routes
router.get("/", verifyToken, verifyAdmin, getAllUsers);
router.post("/admin/create", verifyToken, verifyAdmin, createUserByAdmin);
// Cho phép admin xem user theo ID mà không cần verifyAdmin riêng
router.get("/:id", verifyToken, getUserById); // Bỏ verifyAdmin để admin có thể xem
router.put("/:id", verifyToken, verifyAdmin, updateUserById);
router.delete("/:id", verifyToken, verifyAdmin, deleteUser);

export default router;

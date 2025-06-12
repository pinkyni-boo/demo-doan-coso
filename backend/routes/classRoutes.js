import express from "express";
import {
  getAllClasses,
  createClass,
  updateClass,
  deleteClass,
  enrollClass,
  getClassMembers,
  getUserClasses,
  deleteEnrollment,
  getClassById,
  getClassDetails,
} from "../controllers/classController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Debug middleware
const debugMiddleware = (req, res, next) => {
  console.log("=== DEBUG REQUEST ===");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  console.log("User:", req.user);
  console.log("====================");
  next();
};

// Public routes (đặt specific routes trước dynamic routes)
router.get("/", getAllClasses);

// User routes
router.post("/enroll", debugMiddleware, verifyToken, enrollClass);
router.get("/user/:userId", verifyToken, getUserClasses);
router.delete("/enrollment/:enrollmentId", verifyToken, deleteEnrollment);

// Admin routes
router.post("/", verifyToken, verifyAdmin, createClass);
router.put("/:id", verifyToken, verifyAdmin, updateClass);
router.delete("/:id", verifyToken, verifyAdmin, deleteClass);
router.get("/:classId/members", verifyToken, verifyAdmin, getClassMembers);

// Dynamic routes (đặt cuối cùng)
router.get("/:id/details", getClassDetails);
router.get("/:id", getClassById);

export default router;

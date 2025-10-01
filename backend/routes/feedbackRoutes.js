import express from "express";
import {
  createFeedback,
  getFeedbacks,
  getUserFeedbacks,
  updateFeedback,
  deleteFeedback,
  getClubFeedbackStats,
  getAllFeedbacksForAdmin,
  approveFeedback,
  rejectFeedback,
  respondToFeedback,
  getFeedbackStatsForAdmin,
} from "../controllers/feedbackController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getFeedbacks);
router.get("/club/:clubId/stats", getClubFeedbackStats);

// Protected routes (cần đăng nhập)
router.post("/", verifyToken, createFeedback);
router.get("/my-feedbacks", verifyToken, getUserFeedbacks);
router.put("/:id", verifyToken, updateFeedback);
router.delete("/:id", verifyToken, deleteFeedback);

// Admin routes
router.get("/admin/all", verifyToken, verifyAdmin, getAllFeedbacksForAdmin);
router.get("/admin/stats", verifyToken, verifyAdmin, getFeedbackStatsForAdmin);
router.patch("/admin/:id/approve", verifyToken, verifyAdmin, approveFeedback);
router.patch("/admin/:id/reject", verifyToken, verifyAdmin, rejectFeedback);
router.post("/admin/:id/respond", verifyToken, verifyAdmin, respondToFeedback);

export default router;

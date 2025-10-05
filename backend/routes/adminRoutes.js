import express from "express";
import {
  getAllScheduleChangeRequests,
  updateScheduleChangeRequestStatus,
  addMakeupSchedule,
  getAllTrainers,
  getTrainerSchedule,
  getDashboardStats,
  getAllUsers,
  getAllClasses,
} from "../controllers/adminController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Dashboard statistics
router.get("/dashboard-stats", verifyToken, verifyAdmin, getDashboardStats);
router.get("/users", verifyToken, verifyAdmin, getAllUsers);
router.get("/classes", verifyToken, verifyAdmin, getAllClasses);

// Schedule change request routes
router.get("/schedule-change-requests", verifyToken, verifyAdmin, getAllScheduleChangeRequests);
router.put("/schedule-change-requests/:id/:action", verifyToken, verifyAdmin, updateScheduleChangeRequestStatus);
router.post("/schedule-change-requests/:id/makeup-schedule", verifyToken, verifyAdmin, addMakeupSchedule);

// Trainer management routes
router.get("/trainers", verifyToken, verifyAdmin, getAllTrainers);
router.get("/trainer-schedule/:trainerId", verifyToken, verifyAdmin, getTrainerSchedule);

export default router;
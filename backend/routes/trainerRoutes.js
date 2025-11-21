import express from "express";
import {
  getAllTrainers,
  createTrainer,
  updateTrainer,
  deleteTrainer,
  updateTrainerStatus,
  getAssignedClasses,
  getClassDetail,
  getClassFullSchedule,
  createScheduleChangeRequest,
  getScheduleChangeRequests,
  checkTrainerScheduleConflict,
  checkMakeupScheduleConflict,
} from "../controllers/trainerController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin routes
router.get("/", verifyToken, getAllTrainers);
router.post("/", verifyToken, verifyAdmin, createTrainer);
router.put("/:id", verifyToken, verifyAdmin, updateTrainer);
router.put("/:id/status", verifyToken, verifyAdmin, updateTrainerStatus);
router.delete("/:id", verifyToken, verifyAdmin, deleteTrainer);

// Trainer routes
router.get("/assigned-classes", verifyToken, getAssignedClasses);
router.get("/class/:classId", verifyToken, getClassDetail);
router.get("/class/:classId/full-schedule", verifyToken, getClassFullSchedule);

// Schedule change request routes
router.post(
  "/schedule-change-request",
  verifyToken,
  createScheduleChangeRequest
);
router.get("/schedule-change-requests", verifyToken, getScheduleChangeRequests);

// Check trainer schedule conflict (for admin when creating/editing class)
router.get(
  "/check-schedule-conflict",
  verifyToken,
  checkTrainerScheduleConflict
);

// Check trainer makeup schedule conflict (for trainer when requesting schedule change)
router.get(
  "/check-makeup-schedule-conflict",
  verifyToken,
  checkMakeupScheduleConflict
);

export default router;

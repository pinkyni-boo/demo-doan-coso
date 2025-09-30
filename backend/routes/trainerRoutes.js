import express from "express";
import {
  getAllTrainers,
  createTrainer,
  updateTrainer,
  deleteTrainer,
  updateTrainerStatus,
  getAssignedClasses,
  getClassDetail,
  createScheduleChangeRequest,
  getScheduleChangeRequests,
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

// Schedule change request routes
router.post("/schedule-change-request", verifyToken, createScheduleChangeRequest);
router.get("/schedule-change-requests", verifyToken, getScheduleChangeRequests);

export default router;
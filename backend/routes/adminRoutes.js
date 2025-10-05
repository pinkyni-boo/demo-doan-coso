import express from "express";
import {
  getAllScheduleChangeRequests,
  updateScheduleChangeRequestStatus,
  addMakeupSchedule,
} from "../controllers/adminController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Schedule change request routes
router.get("/schedule-change-requests", verifyToken, verifyAdmin, getAllScheduleChangeRequests);
router.put("/schedule-change-requests/:id/:action", verifyToken, verifyAdmin, updateScheduleChangeRequestStatus);
router.post("/schedule-change-requests/:id/makeup-schedule", verifyToken, verifyAdmin, addMakeupSchedule);

export default router;
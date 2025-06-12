import express from "express";
import { getDashboardStats, getDetailedStats } from "../controllers/statsController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", verifyToken, verifyAdmin, getDashboardStats);
router.get("/detailed", verifyToken, verifyAdmin, getDetailedStats);

export default router;
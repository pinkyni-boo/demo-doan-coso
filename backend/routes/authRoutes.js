import express from "express";
import { signup, login } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/status", (req, res) => {
  res.status(200).json({ 
    status: "online", 
    timestamp: new Date().toISOString(),
    message: "Backend server is running" 
  });
});

export default router;

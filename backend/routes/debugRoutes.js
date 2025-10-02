import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Debug route để test trainer data
router.get("/test-trainers", async (req, res) => {
  try {
    console.log("=== DEBUG: Testing trainer data ===");

    // Get all users to see what roles exist
    const allUsers = await User.find({}).select("username fullName role email");
    console.log("All users:", allUsers);

    // Get specifically trainers
    const trainers = await User.find({ role: "trainer" }).select(
      "_id username fullName email avatar role"
    );
    console.log("Trainers found:", trainers);

    // Test different variations
    const trainerVariations = await User.find({
      $or: [{ role: "trainer" }, { role: "Trainer" }, { role: "TRAINER" }],
    }).select("_id username fullName email avatar role");
    console.log("Trainer variations:", trainerVariations);

    res.json({
      success: true,
      data: {
        allUsers,
        trainers,
        trainerVariations,
        totalUsers: allUsers.length,
        totalTrainers: trainers.length,
      },
    });
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Test route for trainers without auth (for debugging)
router.get("/trainers-no-auth", async (req, res) => {
  try {
    console.log("=== DEBUG: Testing trainers without auth ===");

    const trainers = await User.find({ role: "trainer" })
      .select("_id username fullName email avatar")
      .sort({ fullName: 1 });

    console.log("Trainers found in database:", trainers.length);
    console.log("Trainers data:", trainers);

    res.json({
      success: true,
      data: trainers,
      message: "Lấy danh sách huấn luyện viên thành công (no auth)",
    });
  } catch (error) {
    console.error("Error fetching trainers:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách huấn luyện viên",
    });
  }
});

export default router;

import express from "express";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import ClassEnrollment from "../models/ClassEnrollment.js";
import Membership from "../models/Membership.js";
import NotificationService from "../services/NotificationService.js";

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

// Debug route để test payment rejection
router.get("/test-payment-rejection/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;
    console.log("=== DEBUG: Testing payment rejection ===");

    // Tìm payment
    const payment = await Payment.findById(paymentId).populate(
      "user",
      "username email fullName"
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy payment",
      });
    }

    console.log("Payment found:", {
      id: payment._id,
      user: payment.user?.username,
      amount: payment.amount,
      status: payment.status,
      paymentType: payment.paymentType,
      registrationIds: payment.registrationIds,
    });

    // Kiểm tra trạng thái các registration
    const registrationStatus = [];
    for (const regId of payment.registrationIds || []) {
      const classEnrollment = await ClassEnrollment.findById(regId);
      if (classEnrollment) {
        registrationStatus.push({
          id: regId,
          type: "class_enrollment",
          paymentStatus: classEnrollment.paymentStatus,
          status: classEnrollment.status,
        });
      }

      const membership = await Membership.findById(regId);
      if (membership) {
        registrationStatus.push({
          id: regId,
          type: "membership",
          paymentStatus: membership.paymentStatus,
          status: membership.status,
        });
      }
    }

    res.json({
      success: true,
      data: {
        payment,
        registrationStatus,
        canReject: payment.status === "pending",
      },
      message: "Payment debug info retrieved successfully",
    });
  } catch (error) {
    console.error("Debug payment rejection error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Debug route để lấy danh sách pending payments
router.get("/pending-payments", async (req, res) => {
  try {
    console.log("=== DEBUG: Getting pending payments ===");

    const payments = await Payment.find({ status: "pending" })
      .populate("user", "username email fullName")
      .sort({ createdAt: -1 })
      .limit(10);

    console.log(`Found ${payments.length} pending payments`);

    res.json({
      success: true,
      data: payments,
      message: `Found ${payments.length} pending payments`,
    });
  } catch (error) {
    console.error("Debug pending payments error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;

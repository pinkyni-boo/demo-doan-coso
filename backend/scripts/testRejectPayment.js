import mongoose from "mongoose";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import ClassEnrollment from "../models/ClassEnrollment.js";
import NotificationService from "../services/NotificationService.js";

// Kết nối MongoDB
mongoose.connect("mongodb://localhost:27017/gym-management");

async function testRejectPayment() {
  try {
    console.log("=== TEST REJECT PAYMENT ===");

    // Tìm một payment pending
    const pendingPayment = await Payment.findOne({
      status: "pending",
    }).populate("user", "username fullName email");

    if (!pendingPayment) {
      console.log("Không tìm thấy payment pending để test");
      return;
    }

    console.log("Found pending payment:", {
      id: pendingPayment._id,
      user: pendingPayment.user?.username,
      amount: pendingPayment.amount,
      status: pendingPayment.status,
      registrationIds: pendingPayment.registrationIds,
    });

    // Kiểm tra registrations trước khi reject
    if (
      pendingPayment.registrationIds &&
      pendingPayment.registrationIds.length > 0
    ) {
      console.log("\n=== BEFORE REJECTION ===");

      for (const regId of pendingPayment.registrationIds) {
        const enrollment = await ClassEnrollment.findById(regId);
        if (enrollment) {
          console.log(`ClassEnrollment ${regId}:`, {
            paymentStatus: enrollment.paymentStatus,
            status: enrollment.status,
          });
        }
      }
    }

    // Tìm admin user để test
    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      console.log("Không tìm thấy admin user");
      return;
    }

    console.log("Using admin:", admin.username);

    // Test reject payment logic
    console.log("\n=== REJECTING PAYMENT ===");

    const rejectionReason = "Test rejection - payment method invalid";

    // Update payment status
    pendingPayment.status = "cancelled";
    pendingPayment.rejectionReason = rejectionReason;
    pendingPayment.rejectedAt = new Date();
    pendingPayment.rejectedBy = admin._id;
    await pendingPayment.save();

    console.log("Payment updated to cancelled");

    // Process registrations
    if (
      pendingPayment.registrationIds &&
      pendingPayment.registrationIds.length > 0
    ) {
      for (const regId of pendingPayment.registrationIds) {
        const enrollment = await ClassEnrollment.findById(regId);
        if (enrollment) {
          enrollment.paymentStatus = false;
          enrollment.status = "cancelled";
          await enrollment.save();
          console.log(`ClassEnrollment ${regId} marked as cancelled`);
        }
      }
    }

    // Test notification
    console.log("\n=== SENDING NOTIFICATION ===");

    try {
      await NotificationService.notifyUserPaymentRejected(
        pendingPayment,
        admin,
        rejectionReason
      );
      console.log("Notification sent successfully");
    } catch (notifyError) {
      console.error("Error sending notification:", notifyError);
    }

    // Verify results
    console.log("\n=== AFTER REJECTION ===");

    const updatedPayment = await Payment.findById(pendingPayment._id);
    console.log("Updated payment:", {
      id: updatedPayment._id,
      status: updatedPayment.status,
      rejectionReason: updatedPayment.rejectionReason,
      rejectedAt: updatedPayment.rejectedAt,
      rejectedBy: updatedPayment.rejectedBy,
    });

    if (
      pendingPayment.registrationIds &&
      pendingPayment.registrationIds.length > 0
    ) {
      for (const regId of pendingPayment.registrationIds) {
        const enrollment = await ClassEnrollment.findById(regId);
        if (enrollment) {
          console.log(`ClassEnrollment ${regId}:`, {
            paymentStatus: enrollment.paymentStatus,
            status: enrollment.status,
          });
        }
      }
    }

    console.log("\n=== TEST COMPLETED ===");
  } catch (error) {
    console.error("Test error:", error);
  } finally {
    mongoose.connection.close();
  }
}

testRejectPayment();

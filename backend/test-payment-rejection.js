/**
 * Script kiểm tra chức năng từ chối thanh toán
 * Chạy script này để test việc từ chối payment và trả về trạng thái ban đầu
 */

import mongoose from "mongoose";
import Payment from "./models/Payment.js";
import ClassEnrollment from "./models/ClassEnrollment.js";
import Membership from "./models/Membership.js";
import User from "./models/User.js";
import NotificationService from "./services/NotificationService.js";

// Kết nối database
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/gym-management";

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

// Test function cho việc từ chối payment
async function testPaymentRejection() {
  try {
    console.log("\n🧪 Testing Payment Rejection Logic...");

    // Tìm một payment pending để test
    const pendingPayment = await Payment.findOne({
      status: "pending",
    }).populate("user", "username email fullName");

    if (!pendingPayment) {
      console.log("❌ Không tìm thấy payment pending nào để test");
      return;
    }

    console.log("📋 Payment tìm thấy:", {
      id: pendingPayment._id,
      user: pendingPayment.user.username,
      amount: pendingPayment.amount,
      paymentType: pendingPayment.paymentType,
      registrationIds: pendingPayment.registrationIds,
    });

    // Kiểm tra trạng thái hiện tại của các registration
    console.log("\n📊 Trạng thái hiện tại của registrations:");
    for (const regId of pendingPayment.registrationIds) {
      const classEnrollment = await ClassEnrollment.findById(regId);
      if (classEnrollment) {
        console.log(
          `  Class Enrollment ${regId}: paymentStatus=${classEnrollment.paymentStatus}, status=${classEnrollment.status}`
        );
      }

      const membership = await Membership.findById(regId);
      if (membership) {
        console.log(
          `  Membership ${regId}: paymentStatus=${membership.paymentStatus}, status=${membership.status}`
        );
      }
    }

    // Simulate admin rejection
    const rejectionReason = "Test từ chối thanh toán - kiểm tra hệ thống";

    // Cập nhật payment status
    pendingPayment.status = "cancelled";
    pendingPayment.rejectionReason = rejectionReason;
    pendingPayment.rejectedAt = new Date();
    pendingPayment.rejectedBy = "test-admin";
    await pendingPayment.save();

    console.log("\n✅ Payment đã được cập nhật status = cancelled");

    // Xử lý registrations
    const updateResults = [];
    for (const regId of pendingPayment.registrationIds) {
      const classEnrollment = await ClassEnrollment.findById(regId);
      if (classEnrollment) {
        // Xóa class enrollment (trả về trạng thái chưa đăng ký)
        await ClassEnrollment.findByIdAndDelete(regId);
        updateResults.push({
          type: "class",
          id: regId,
          action: "deleted",
        });
        console.log(`  ✅ Đã xóa class enrollment ${regId}`);
      }

      const membership = await Membership.findById(regId);
      if (membership) {
        // Reset membership về pending_payment
        membership.status = "pending_payment";
        membership.paymentStatus = false;
        await membership.save();
        updateResults.push({
          type: "membership",
          id: regId,
          action: "reset_to_pending",
        });
        console.log(`  ✅ Đã reset membership ${regId} về pending_payment`);
      }
    }

    // Gửi thông báo
    await NotificationService.notifyUserPaymentRejected(
      pendingPayment,
      rejectionReason
    );
    console.log("✅ Đã gửi thông báo cho user");

    console.log("\n🎉 Test hoàn thành! Kết quả:");
    console.log("  - Payment đã được từ chối");
    console.log("  - Registrations đã được trả về trạng thái ban đầu");
    console.log("  - Thông báo đã được gửi cho user");
    console.log("  - Update results:", updateResults);
  } catch (error) {
    console.error("❌ Lỗi khi test payment rejection:", error);
  }
}

// Chạy test
async function runTest() {
  await connectDB();
  await testPaymentRejection();
  await mongoose.disconnect();
  console.log("🔚 Test hoàn thành, đã ngắt kết nối database");
}

// Chỉ chạy nếu file này được gọi trực tiếp
if (import.meta.url === `file://${process.argv[1]}`) {
  runTest().catch(console.error);
}

export { testPaymentRejection };

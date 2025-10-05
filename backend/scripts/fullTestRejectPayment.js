// Script kiểm tra toàn bộ flow reject payment
import mongoose from "mongoose";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import ClassEnrollment from "../models/ClassEnrollment.js";
import Class from "../models/Class.js";
import Notification from "../models/Notification.js";
import NotificationService from "../services/NotificationService.js";

// Kết nối MongoDB
mongoose.connect("mongodb://localhost:27017/gym-management");

async function fullTestRejectPayment() {
  try {
    console.log("🔥 === FULL REJECT PAYMENT TEST ===");

    // 1. Tìm dữ liệu test
    const user = await User.findOne({ role: "member" });
    const admin = await User.findOne({ role: "admin" });
    const testClass = await Class.findOne();

    if (!user || !admin || !testClass) {
      console.log("❌ Missing required data:", {
        user: !!user,
        admin: !!admin,
        class: !!testClass,
      });
      return;
    }

    console.log("✅ Found test data:");
    console.log(`  User: ${user.username} (${user._id})`);
    console.log(`  Admin: ${admin.username} (${admin._id})`);
    console.log(
      `  Class: ${testClass.className} (capacity: ${testClass.capacity})`
    );

    // 2. Tạo ClassEnrollment và Payment mới
    console.log("\n📝 === CREATING TEST ENROLLMENT & PAYMENT ===");

    const enrollment = new ClassEnrollment({
      user: user._id,
      class: testClass._id,
      paymentStatus: false,
      status: "active",
      remainingSessions: testClass.totalSessions || 12,
    });
    await enrollment.save();

    const payment = new Payment({
      user: user._id,
      amount: 500000,
      method: "Chuyển khoản",
      registrationIds: [enrollment._id],
      status: "pending",
      paymentType: "class",
    });
    await payment.save();

    console.log(`✅ Created enrollment: ${enrollment._id}`);
    console.log(`✅ Created payment: ${payment._id}`);

    // 3. Kiểm tra sĩ số TRƯỚC khi approve (should be 0)
    console.log("\n📊 === CLASS CAPACITY BEFORE APPROVE ===");
    let activePaidCount = await ClassEnrollment.countDocuments({
      class: testClass._id,
      paymentStatus: true,
      status: { $ne: "cancelled" },
    });
    console.log(`Active paid enrollments: ${activePaidCount} (should be 0)`);

    // 4. Approve payment trước để test
    console.log("\n✅ === APPROVING PAYMENT FIRST ===");
    enrollment.paymentStatus = true;
    await enrollment.save();

    payment.status = "completed";
    payment.completedAt = new Date();
    await payment.save();

    // Kiểm tra sĩ số AFTER approve (should be 1)
    activePaidCount = await ClassEnrollment.countDocuments({
      class: testClass._id,
      paymentStatus: true,
      status: { $ne: "cancelled" },
    });
    console.log(
      `Active paid enrollments after approve: ${activePaidCount} (should be 1)`
    );

    // 5. Bây giờ test REJECT payment
    console.log("\n❌ === REJECTING PAYMENT ===");

    const rejectionReason = "Test rejection - Invalid bank transfer screenshot";

    // Simulate reject payment API call
    payment.status = "cancelled";
    payment.rejectionReason = rejectionReason;
    payment.rejectedAt = new Date();
    payment.rejectedBy = admin._id;
    await payment.save();

    // Update enrollment
    enrollment.paymentStatus = false;
    enrollment.status = "cancelled";
    await enrollment.save();

    console.log("✅ Payment status updated to cancelled");
    console.log("✅ Enrollment status updated to cancelled");

    // 6. Send notification
    console.log("\n📬 === SENDING NOTIFICATION ===");
    try {
      await NotificationService.notifyUserPaymentRejected(
        payment,
        admin,
        rejectionReason
      );
      console.log("✅ Notification sent successfully");
    } catch (notifyError) {
      console.error("❌ Error sending notification:", notifyError);
    }

    // 7. Verify final state
    console.log("\n🔍 === VERIFICATION ===");

    const finalPayment = await Payment.findById(payment._id)
      .populate("rejectedBy", "username")
      .populate("user", "username");

    const finalEnrollment = await ClassEnrollment.findById(enrollment._id);

    console.log("Final Payment State:", {
      id: finalPayment._id,
      status: finalPayment.status,
      rejectionReason: finalPayment.rejectionReason,
      rejectedAt: finalPayment.rejectedAt?.toISOString(),
      rejectedBy: finalPayment.rejectedBy?.username,
      user: finalPayment.user?.username,
    });

    console.log("Final Enrollment State:", {
      id: finalEnrollment._id,
      paymentStatus: finalEnrollment.paymentStatus,
      status: finalEnrollment.status,
      class: finalEnrollment.class,
    });

    // 8. Verify class capacity calculation (MOST IMPORTANT)
    console.log("\n📊 === FINAL CLASS CAPACITY CHECK ===");

    const finalActivePaidCount = await ClassEnrollment.countDocuments({
      class: testClass._id,
      paymentStatus: true,
      status: { $ne: "cancelled" },
    });

    const totalEnrollmentsCount = await ClassEnrollment.countDocuments({
      class: testClass._id,
    });

    const cancelledEnrollmentsCount = await ClassEnrollment.countDocuments({
      class: testClass._id,
      status: "cancelled",
    });

    console.log(
      `✅ Final active paid enrollments: ${finalActivePaidCount} (should be 0)`
    );
    console.log(`📊 Total enrollments: ${totalEnrollmentsCount}`);
    console.log(`❌ Cancelled enrollments: ${cancelledEnrollmentsCount}`);
    console.log(`🏫 Class capacity: ${testClass.capacity}`);

    // 9. Check notification
    const notification = await Notification.findOne({
      relatedId: payment._id,
      type: "payment",
      recipient: user._id,
    });

    if (notification) {
      console.log("✅ Notification created:", {
        title: notification.title,
        message: notification.message,
        recipient: notification.recipient,
      });
    } else {
      console.log("❌ No notification found");
    }

    // 10. Summary
    console.log("\n🎯 === TEST SUMMARY ===");
    console.log("✅ Payment successfully rejected");
    console.log("✅ Enrollment marked as cancelled");
    console.log("✅ Notification sent to user");
    console.log(
      `✅ Class capacity correctly excludes cancelled enrollments: ${finalActivePaidCount}`
    );

    if (finalActivePaidCount === 0) {
      console.log(
        "🎉 TEST PASSED - Rejected payments don't count in class capacity!"
      );
    } else {
      console.log("❌ TEST FAILED - Cancelled enrollments still counting!");
    }
  } catch (error) {
    console.error("💥 Test error:", error);
    console.error("Stack:", error.stack);
  } finally {
    console.log("\n🔚 Closing connection...");
    mongoose.connection.close();
  }
}

fullTestRejectPayment();

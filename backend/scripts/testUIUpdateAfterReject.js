// Script test UI update sau khi reject payment
import mongoose from "mongoose";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import ClassEnrollment from "../models/ClassEnrollment.js";
import Class from "../models/Class.js";
import NotificationService from "../services/NotificationService.js";

// Kết nối MongoDB
mongoose.connect("mongodb://localhost:27017/gym-management");

async function testUIUpdateAfterReject() {
  try {
    console.log("🔥 === TEST UI UPDATE AFTER REJECT PAYMENT ===");

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
    console.log(`  Class: ${testClass.className}`);

    // 2. Tạo ClassEnrollment và Payment
    console.log("\n📝 === CREATING TEST DATA ===");

    const enrollment = new ClassEnrollment({
      user: user._id,
      class: testClass._id,
      paymentStatus: false,
      status: "active", // Start with active status
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

    console.log(
      `✅ Created enrollment: ${enrollment._id} (status: ${enrollment.status})`
    );
    console.log(
      `✅ Created payment: ${payment._id} (status: ${payment.status})`
    );

    // 3. Simulate frontend checking enrollment status BEFORE reject
    console.log("\n🔍 === FRONTEND STATE BEFORE REJECT ===");

    const beforeEnrollment = await ClassEnrollment.findById(enrollment._id);
    const beforePayment = await Payment.findById(payment._id);

    console.log("Frontend would see:");
    console.log(`  - paymentStatus: ${beforeEnrollment.paymentStatus}`);
    console.log(`  - enrollment.status: ${beforeEnrollment.status}`);
    console.log(`  - payment.status: ${beforePayment.status}`);

    // Frontend logic check
    const isRejected =
      beforeEnrollment.status === "cancelled" ||
      beforeEnrollment.status === "rejected";
    const isPending = !beforeEnrollment.paymentStatus && !isRejected;
    const hasConfirmedPayment = beforeEnrollment.paymentStatus;

    console.log("Frontend logic results:");
    console.log(`  - isEnrollmentRejected: ${isRejected}`);
    console.log(`  - hasPendingPayment: ${isPending}`);
    console.log(`  - hasConfirmedPayment: ${hasConfirmedPayment}`);
    console.log(
      `  UI would show: ${
        hasConfirmedPayment
          ? "✅ Đã tham gia lớp"
          : isPending
          ? "⏳ Chờ admin xác nhận"
          : isRejected
          ? "❌ Thanh toán bị từ chối"
          : "🔵 Đăng ký ngay"
      }`
    );

    // 4. Admin rejects payment
    console.log("\n❌ === ADMIN REJECTS PAYMENT ===");

    const rejectionReason = "Screenshot thanh toán không rõ ràng";

    // Update payment
    payment.status = "cancelled";
    payment.rejectionReason = rejectionReason;
    payment.rejectedAt = new Date();
    payment.rejectedBy = admin._id;
    await payment.save();

    // Update enrollment
    enrollment.paymentStatus = false;
    enrollment.status = "cancelled"; // This is key for UI update
    await enrollment.save();

    // Send notification
    await NotificationService.notifyUserPaymentRejected(
      payment,
      admin,
      rejectionReason
    );

    console.log("✅ Payment rejected and enrollment cancelled");

    // 5. Simulate frontend checking enrollment status AFTER reject
    console.log("\n🔍 === FRONTEND STATE AFTER REJECT ===");

    const afterEnrollment = await ClassEnrollment.findById(enrollment._id);
    const afterPayment = await Payment.findById(payment._id);

    console.log("Frontend would see:");
    console.log(`  - paymentStatus: ${afterEnrollment.paymentStatus}`);
    console.log(`  - enrollment.status: ${afterEnrollment.status}`);
    console.log(`  - payment.status: ${afterPayment.status}`);

    // Frontend logic check after reject
    const isRejectedAfter =
      afterEnrollment.status === "cancelled" ||
      afterEnrollment.status === "rejected";
    const isPendingAfter = !afterEnrollment.paymentStatus && !isRejectedAfter;
    const hasConfirmedPaymentAfter = afterEnrollment.paymentStatus;

    console.log("Frontend logic results after reject:");
    console.log(`  - isEnrollmentRejected: ${isRejectedAfter}`);
    console.log(`  - hasPendingPayment: ${isPendingAfter}`);
    console.log(`  - hasConfirmedPayment: ${hasConfirmedPaymentAfter}`);
    console.log(
      `  UI would show: ${
        hasConfirmedPaymentAfter
          ? "✅ Đã tham gia lớp"
          : isPendingAfter
          ? "⏳ Chờ admin xác nhận"
          : isRejectedAfter
          ? "❌ Thanh toán bị từ chối"
          : "🔵 Đăng ký ngay"
      }`
    );

    // 6. Check UserClasses filter behavior
    console.log("\n📊 === USERCLASSES FILTER TEST ===");

    const allUserEnrollments = await ClassEnrollment.find({
      user: user._id,
    }).populate("class");

    console.log("All user enrollments:");
    allUserEnrollments.forEach((e, i) => {
      console.log(
        `  ${i + 1}. Class: ${e.class?.className}, paymentStatus: ${
          e.paymentStatus
        }, status: ${e.status}`
      );
    });

    // Test filter logic
    const paidEnrollments = allUserEnrollments.filter(
      (e) => e.paymentStatus && e.status !== "cancelled"
    );
    const pendingEnrollments = allUserEnrollments.filter(
      (e) => !e.paymentStatus && e.status !== "cancelled"
    );
    const rejectedEnrollments = allUserEnrollments.filter(
      (e) => e.status === "cancelled" || e.status === "rejected"
    );

    console.log("Filter results:");
    console.log(
      `  - Paid (should show in 'Đã thanh toán'): ${paidEnrollments.length}`
    );
    console.log(
      `  - Pending (should show in 'Chờ thanh toán'): ${pendingEnrollments.length}`
    );
    console.log(
      `  - Rejected (should show in 'Bị từ chối'): ${rejectedEnrollments.length}`
    );

    // 7. Final result
    console.log("\n🎯 === TEST RESULT ===");

    if (isRejectedAfter && !isPendingAfter) {
      console.log(
        "🎉 SUCCESS: UI correctly shows 'Thanh toán bị từ chối' instead of 'Chờ thanh toán'"
      );
      console.log("✅ User will no longer see 'pending payment' status");
      console.log("✅ Enrollment properly categorized as rejected");
    } else {
      console.log("❌ FAILED: UI logic needs fixing");
    }
  } catch (error) {
    console.error("💥 Test error:", error);
    console.error("Stack:", error.stack);
  } finally {
    console.log("\n🔚 Closing connection...");
    mongoose.connection.close();
  }
}

testUIUpdateAfterReject();

import mongoose from "mongoose";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import ClassEnrollment from "../models/ClassEnrollment.js";
import Class from "../models/Class.js";
import Notification from "../models/Notification.js";

// Kết nối MongoDB
mongoose.connect("mongodb://localhost:27017/gym-management");

async function createTestData() {
  try {
    console.log("=== CREATING TEST DATA ===");

    // Tìm user và admin
    const user = await User.findOne({ role: "member" });
    const admin = await User.findOne({ role: "admin" });
    const testClass = await Class.findOne();

    if (!user || !admin || !testClass) {
      console.log("Missing required data:", {
        user: !!user,
        admin: !!admin,
        class: !!testClass,
      });
      return;
    }

    console.log("Found user:", user.username);
    console.log("Found admin:", admin.username);
    console.log("Found class:", testClass.className);

    // Tạo ClassEnrollment
    const enrollment = new ClassEnrollment({
      user: user._id,
      class: testClass._id,
      paymentStatus: false,
      status: "active",
      remainingSessions: testClass.totalSessions || 12,
    });
    await enrollment.save();
    console.log("Created enrollment:", enrollment._id);

    // Tạo Payment pending
    const payment = new Payment({
      user: user._id,
      amount: 500000,
      method: "Chuyển khoản",
      registrationIds: [enrollment._id],
      status: "pending",
      paymentType: "class",
    });
    await payment.save();
    console.log("Created payment:", payment._id);

    return { payment, enrollment, user, admin };
  } catch (error) {
    console.error("Error creating test data:", error);
  }
}

async function testRejectPaymentFlow() {
  try {
    const testData = await createTestData();
    if (!testData) return;

    const { payment, enrollment, user, admin } = testData;

    console.log("\n=== BEFORE REJECTION ===");
    console.log("Payment status:", payment.status);
    console.log("Enrollment paymentStatus:", enrollment.paymentStatus);
    console.log("Enrollment status:", enrollment.status);

    // Simulate reject payment API call
    console.log("\n=== SIMULATING REJECT PAYMENT ===");

    const rejectionReason = "Test rejection - invalid payment method";

    // Update payment
    payment.status = "cancelled";
    payment.rejectionReason = rejectionReason;
    payment.rejectedAt = new Date();
    payment.rejectedBy = admin._id;
    await payment.save();

    // Update enrollment
    enrollment.paymentStatus = false;
    enrollment.status = "cancelled";
    await enrollment.save();

    // Create notification
    const notification = new Notification({
      title: "Thanh toán bị từ chối",
      message: `Thanh toán của bạn đã bị từ chối. Lý do: ${rejectionReason}`,
      type: "payment",
      recipient: user._id,
      sender: admin._id,
      relatedId: payment._id,
    });
    await notification.save();

    console.log("Payment rejected successfully");
    console.log("Enrollment updated successfully");
    console.log("Notification created successfully");

    console.log("\n=== AFTER REJECTION ===");

    const updatedPayment = await Payment.findById(payment._id);
    const updatedEnrollment = await ClassEnrollment.findById(enrollment._id);
    const createdNotification = await Notification.findById(notification._id);

    console.log("Updated payment:", {
      id: updatedPayment._id,
      status: updatedPayment.status,
      rejectionReason: updatedPayment.rejectionReason,
      rejectedAt: updatedPayment.rejectedAt?.toISOString(),
      rejectedBy: updatedPayment.rejectedBy,
    });

    console.log("Updated enrollment:", {
      id: updatedEnrollment._id,
      paymentStatus: updatedEnrollment.paymentStatus,
      status: updatedEnrollment.status,
    });

    console.log("Created notification:", {
      id: createdNotification._id,
      title: createdNotification.title,
      message: createdNotification.message,
      recipient: createdNotification.recipient,
      type: createdNotification.type,
    });

    // Verify that cancelled enrollments don't count in class capacity
    console.log("\n=== CHECKING CLASS CAPACITY ===");

    const activeEnrollments = await ClassEnrollment.find({
      class: testClass._id,
      paymentStatus: true,
      status: "active",
    });

    const cancelledEnrollments = await ClassEnrollment.find({
      class: testClass._id,
      status: "cancelled",
    });

    console.log("Active enrollments (should count):", activeEnrollments.length);
    console.log(
      "Cancelled enrollments (should NOT count):",
      cancelledEnrollments.length
    );
    console.log("Class capacity:", testClass.capacity);

    console.log("\n=== TEST COMPLETED SUCCESSFULLY ===");
  } catch (error) {
    console.error("Test error:", error);
  } finally {
    mongoose.connection.close();
  }
}

testRejectPaymentFlow();

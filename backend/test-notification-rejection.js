/**
 * Script test thông báo từ chối thanh toán
 * Kiểm tra việc gửi thông báo chi tiết cho user khi admin từ chối payment
 */

import mongoose from "mongoose";
import Payment from "./models/Payment.js";
import User from "./models/User.js";
import Notification from "./models/Notification.js";
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

// Test function cho thông báo từ chối payment
async function testRejectionNotification() {
  try {
    console.log("\n🧪 Testing Payment Rejection Notification...");

    // Tìm một payment bị cancelled để test
    const rejectedPayment = await Payment.findOne({
      status: "cancelled",
    }).populate("user", "username email fullName");

    if (!rejectedPayment) {
      console.log("❌ Không tìm thấy payment bị cancelled nào để test");
      console.log("💡 Hãy tạo một payment bị cancelled trước:");
      console.log("   1. Tạo payment với status 'pending'");
      console.log("   2. Từ chối payment đó bằng API /api/payment/reject/:id");
      return;
    }

    console.log("📋 Rejected Payment tìm thấy:", {
      id: rejectedPayment._id,
      user: rejectedPayment.user.username,
      amount: rejectedPayment.amount,
      paymentType: rejectedPayment.paymentType,
      rejectionReason: rejectedPayment.rejectionReason,
      rejectedAt: rejectedPayment.rejectedAt,
    });

    // Kiểm tra thông báo hiện có
    const existingNotifications = await Notification.find({
      recipient: rejectedPayment.user._id,
      type: "payment-rejected",
      relatedId: rejectedPayment._id,
    }).sort({ createdAt: -1 });

    console.log(
      `\n📬 Thông báo hiện có: ${existingNotifications.length} thông báo`
    );
    existingNotifications.forEach((notif, index) => {
      console.log(`  ${index + 1}. ${notif.title}`);
      console.log(`     Tạo lúc: ${notif.createdAt}`);
      console.log(`     Đã đọc: ${notif.isRead ? "Có" : "Chưa"}`);
      console.log(`     Nội dung: ${notif.message.substring(0, 100)}...`);
    });

    // Test gửi thông báo mới
    console.log("\n📤 Đang test gửi thông báo mới...");

    const newNotification = await NotificationService.notifyUserPaymentRejected(
      rejectedPayment,
      rejectedPayment.rejectionReason || "Test notification - payment rejected"
    );

    console.log("✅ Thông báo mới đã được tạo:");
    console.log(`   ID: ${newNotification._id}`);
    console.log(`   Tiêu đề: ${newNotification.title}`);
    console.log(`   Người nhận: ${rejectedPayment.user.username}`);
    console.log(`   Loại: ${newNotification.type}`);
    console.log(`   Tạo lúc: ${newNotification.createdAt}`);

    // Hiển thị nội dung thông báo đầy đủ
    console.log("\n📋 Nội dung thông báo đầy đủ:");
    console.log("=" * 50);
    console.log(`Tiêu đề: ${newNotification.title}`);
    console.log(`Nội dung:\n${newNotification.message}`);
    console.log("=" * 50);

    // Kiểm tra tổng số thông báo của user
    const totalUserNotifications = await Notification.countDocuments({
      recipient: rejectedPayment.user._id,
    });

    const unreadCount = await Notification.countDocuments({
      recipient: rejectedPayment.user._id,
      isRead: false,
    });

    console.log(
      `\n📊 Thống kê thông báo cho user ${rejectedPayment.user.username}:`
    );
    console.log(`   Tổng số thông báo: ${totalUserNotifications}`);
    console.log(`   Chưa đọc: ${unreadCount}`);

    console.log("\n🎉 Test thông báo hoàn thành!");
  } catch (error) {
    console.error("❌ Lỗi khi test rejection notification:", error);
  }
}

// Test function để tạo sample data nếu cần
async function createSampleRejectedPayment() {
  try {
    console.log("\n🔧 Tạo sample rejected payment để test...");

    // Tìm user để tạo payment
    const user = await User.findOne({ role: "user" });
    if (!user) {
      console.log("❌ Không tìm thấy user nào để tạo sample payment");
      return;
    }

    // Tạo payment bị từ chối
    const samplePayment = new Payment({
      user: user._id,
      amount: 500000,
      method: "bank_transfer",
      registrationIds: [],
      paymentType: "membership",
      status: "cancelled",
      rejectionReason: "Thông tin chuyển khoản không chính xác",
      rejectedAt: new Date(),
      rejectedBy: "admin-test",
      createdAt: new Date(),
    });

    await samplePayment.save();

    console.log("✅ Đã tạo sample rejected payment:");
    console.log(`   ID: ${samplePayment._id}`);
    console.log(`   User: ${user.username}`);
    console.log(`   Amount: ${samplePayment.amount.toLocaleString("vi-VN")}đ`);

    return samplePayment;
  } catch (error) {
    console.error("❌ Lỗi khi tạo sample data:", error);
  }
}

// Chạy test
async function runTest() {
  await connectDB();

  console.log("🚀 Bắt đầu test Payment Rejection Notification System");
  console.log("=" * 60);

  // Kiểm tra và tạo sample data nếu cần
  const rejectedPayments = await Payment.countDocuments({
    status: "cancelled",
  });
  if (rejectedPayments === 0) {
    console.log("🔧 Không có rejected payment nào, tạo sample data...");
    await createSampleRejectedPayment();
  }

  await testRejectionNotification();

  await mongoose.disconnect();
  console.log("\n🔚 Test hoàn thành, đã ngắt kết nối database");
}

// Chỉ chạy nếu file này được gọi trực tiếp
if (import.meta.url === `file://${process.argv[1]}`) {
  runTest().catch(console.error);
}

export { testRejectionNotification, createSampleRejectedPayment };

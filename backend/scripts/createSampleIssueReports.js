import mongoose from "mongoose";
import IssueReport from "../models/IssueReport.js";
import Room from "../models/Room.js";
import Equipment from "../models/Equipment.js";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config({ path: "./backend/.env" });

const createSampleIssueReports = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Tìm trainer và admin users
    const trainer = await User.findOne({ role: "trainer" });
    const admin = await User.findOne({ role: "admin" });

    if (!trainer) {
      console.log("❌ No trainer found. Please create a trainer user first.");
      return;
    }

    // Tìm rooms và equipment
    const rooms = await Room.find().limit(3);
    const equipment = await Equipment.find().limit(3);

    console.log(
      `Found ${rooms.length} rooms and ${equipment.length} equipment`
    );

    // Xóa issue reports cũ
    console.log("🗑️ Clearing existing issue reports...");
    await IssueReport.deleteMany({});

    // Tạo sample issue reports
    const sampleReports = [
      {
        reportedBy: trainer._id,
        reportType: "equipment",
        equipment: equipment[0]?._id,
        issueType: "malfunction",
        title: "Máy chạy bộ không hoạt động",
        description:
          "Máy chạy bộ số 3 bị kẹt băng tải, không khởi động được. Đã thử reset nhiều lần nhưng không có tác dụng.",
        severity: "high",
        priority: "high",
        status: "reported",
        images: [
          {
            filename: "sample1.jpg",
            originalName: "machine_error.jpg",
            mimetype: "image/jpeg",
            size: 245632,
            url: "/uploads/issue-reports/sample1.jpg",
          },
        ],
      },
      {
        reportedBy: trainer._id,
        reportType: "room",
        room: rooms[0]?._id,
        issueType: "safety_concern",
        title: "Điều hòa phòng yoga bị rò rỉ nước",
        description:
          "Điều hòa trong phòng yoga bị rò rỉ nước xuống sàn tạo vết nước trơn trượt, có thể gây nguy hiểm cho học viên.",
        severity: "critical",
        priority: "urgent",
        status: "acknowledged",
        acknowledgedBy: admin?._id,
        acknowledgedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        adminNotes:
          "Đã nhận được báo cáo, sẽ liên hệ thợ sửa chữa ngay lập tức.",
        images: [
          {
            filename: "sample2.jpg",
            originalName: "water_leak.jpg",
            mimetype: "image/jpeg",
            size: 189456,
            url: "/uploads/issue-reports/sample2.jpg",
          },
        ],
      },
      {
        reportedBy: trainer._id,
        reportType: "equipment",
        equipment: equipment[1]?._id,
        issueType: "needs_cleaning",
        title: "Thiết bị tạ cần vệ sinh sâu",
        description:
          "Bộ tạ tự do có mùi khó chịu và bám nhiều bụi bẩn. Cần vệ sinh và khử trùng toàn bộ.",
        severity: "medium",
        priority: "normal",
        status: "in_progress",
        acknowledgedBy: admin?._id,
        acknowledgedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        adminNotes: "Đã giao cho bộ phận vệ sinh xử lý.",
      },
      {
        reportedBy: trainer._id,
        reportType: "room",
        room: rooms[1]?._id,
        issueType: "damage",
        title: "Gương phòng tập bị nứt",
        description:
          "Tấm gương lớn ở phòng tập tạ bị nứt góc, có thể rơi và gây nguy hiểm.",
        severity: "high",
        priority: "high",
        status: "resolved",
        acknowledgedBy: admin?._id,
        acknowledgedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        resolvedBy: admin?._id,
        resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        adminNotes: "Đã liên hệ thợ thay gương mới.",
        resolutionNotes:
          "Đã thay thế tấm gương mới an toàn. Kiểm tra và test hoạt động bình thường.",
      },
      {
        reportedBy: trainer._id,
        reportType: "facility",
        issueType: "environmental_issue",
        title: "Hệ thống thông gió kém",
        description:
          "Không khí trong phòng tập bí bách, hệ thống thông gió không hoạt động hiệu quả.",
        severity: "medium",
        priority: "normal",
        status: "reported",
      },
    ];

    console.log("📝 Creating sample issue reports...");
    const createdReports = await IssueReport.create(sampleReports);

    console.log(
      `✅ Successfully created ${createdReports.length} issue reports:`
    );
    createdReports.forEach((report, index) => {
      console.log(
        `   ${index + 1}. ${report.title} - Status: ${report.status}`
      );
    });

    // Stats
    const stats = {
      total: await IssueReport.countDocuments(),
      reported: await IssueReport.countDocuments({ status: "reported" }),
      acknowledged: await IssueReport.countDocuments({
        status: "acknowledged",
      }),
      inProgress: await IssueReport.countDocuments({ status: "in_progress" }),
      resolved: await IssueReport.countDocuments({ status: "resolved" }),
    };

    console.log("\n📊 Issue Report Statistics:");
    console.log(`   Total: ${stats.total}`);
    console.log(`   Reported: ${stats.reported}`);
    console.log(`   Acknowledged: ${stats.acknowledged}`);
    console.log(`   In Progress: ${stats.inProgress}`);
    console.log(`   Resolved: ${stats.resolved}`);
  } catch (error) {
    console.error("❌ Error creating sample issue reports:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
};

createSampleIssueReports();

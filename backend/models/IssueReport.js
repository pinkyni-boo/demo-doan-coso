import mongoose from "mongoose";

const issueReportSchema = new mongoose.Schema(
  {
    // Thông tin người báo cáo (trainer)
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Loại báo cáo
    reportType: {
      type: String,
      enum: ["equipment", "room", "facility"],
      required: true,
    },

    // Tham chiếu đến thiết bị hoặc phòng
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },

    // Chi tiết vấn đề
    issueType: {
      type: String,
      enum: [
        "malfunction",
        "damage",
        "wear",
        "safety_concern",
        "needs_cleaning",
        "needs_repair",
        "not_working",
        "hygiene_issue",
        "environmental_issue",
        "other",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },

    // Hình ảnh minh chứng
    images: [
      {
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number,
        url: String,
        description: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Trạng thái xử lý
    status: {
      type: String,
      enum: ["reported", "acknowledged", "in_progress", "resolved", "rejected"],
      default: "reported",
    },

    // Thông tin xử lý từ admin
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    acknowledgedAt: {
      type: Date,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // có thể assign cho maintenance staff
    },

    adminNotes: {
      type: String,
    },

    // Lịch bảo trì được tạo từ báo cáo này
    maintenanceSchedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MaintenanceSchedule",
    },

    // Ngày dự kiến hoàn thành
    expectedResolutionDate: {
      type: Date,
    },

    // Thông tin hoàn thành
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resolutionNotes: {
      type: String,
    },

    // Chi phí sửa chữa (nếu có)
    repairCost: {
      type: Number,
      min: 0,
    },

    // Follow-up actions needed
    followUpRequired: {
      type: Boolean,
      default: false,
    },
    followUpDate: {
      type: Date,
    },
    followUpNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
issueReportSchema.index({ reportedBy: 1 });
issueReportSchema.index({ status: 1 });
issueReportSchema.index({ severity: 1 });
issueReportSchema.index({ reportType: 1 });
issueReportSchema.index({ equipment: 1 });
issueReportSchema.index({ room: 1 });
issueReportSchema.index({ createdAt: -1 });

const IssueReport = mongoose.model("IssueReport", issueReportSchema);

export default IssueReport;

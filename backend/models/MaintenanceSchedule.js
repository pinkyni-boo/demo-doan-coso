import mongoose from "mongoose";

const maintenanceScheduleSchema = new mongoose.Schema(
  {
    // Tham chiếu đến báo cáo vấn đề (nếu có)
    issueReport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IssueReport",
    },

    // Loại bảo trì
    maintenanceType: {
      type: String,
      enum: [
        "routine",
        "repair",
        "replacement",
        "inspection",
        "emergency",
        "preventive",
      ],
      required: true,
    },

    // Đối tượng bảo trì
    targetType: {
      type: String,
      enum: ["equipment", "room", "facility"],
      required: true,
    },

    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },

    // Thông tin lịch trình
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    scheduledDate: {
      type: Date,
      required: true,
    },

    estimatedDuration: {
      type: Number, // số giờ dự kiến
      required: true,
    },

    // Thông tin người tạo lịch (admin)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Thông tin kỹ thuật viên
    assignedTo: {
      technician: {
        name: String,
        phone: String,
        email: String,
        company: String,
      },
      internalStaff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },

    // Mức độ ưu tiên
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      required: true,
    },

    // Trạng thái
    status: {
      type: String,
      enum: ["scheduled", "in_progress", "completed", "cancelled", "postponed"],
      default: "scheduled",
    },

    // Chi phí dự kiến và thực tế
    estimatedCost: {
      type: Number,
      min: 0,
    },
    actualCost: {
      type: Number,
      min: 0,
    },

    // Thông tin hoàn thành
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },

    // Ghi chú và báo cáo
    preMaintenanceNotes: {
      type: String,
    },
    workPerformed: {
      type: String,
    },
    partsUsed: [
      {
        partName: String,
        quantity: Number,
        cost: Number,
        supplier: String,
      },
    ],

    // Ảnh trước và sau bảo trì
    beforeImages: [String],
    afterImages: [String],

    // Đánh giá kết quả
    qualityRating: {
      type: Number,
      min: 1,
      max: 5,
    },

    // Lịch bảo trì tiếp theo (nếu cần)
    nextMaintenanceDate: {
      type: Date,
    },
    nextMaintenanceType: {
      type: String,
      enum: ["routine", "inspection", "follow_up"],
    },

    // Báo cáo hoàn thành
    completionReport: {
      summary: String,
      issuesFound: [String],
      recommendedActions: [String],
      warrantyAffected: Boolean,
      followUpRequired: Boolean,
      followUpDate: Date,
    },

    // Thông báo và communication
    notifications: [
      {
        type: {
          type: String,
          enum: ["scheduled", "reminder", "started", "completed", "delayed"],
        },
        sentAt: Date,
        sentTo: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
        message: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
maintenanceScheduleSchema.index({ scheduledDate: 1 });
maintenanceScheduleSchema.index({ status: 1 });
maintenanceScheduleSchema.index({ priority: 1 });
maintenanceScheduleSchema.index({ equipment: 1 });
maintenanceScheduleSchema.index({ room: 1 });
maintenanceScheduleSchema.index({ createdBy: 1 });
maintenanceScheduleSchema.index({ maintenanceType: 1 });

const MaintenanceSchedule = mongoose.model(
  "MaintenanceSchedule",
  maintenanceScheduleSchema
);

export default MaintenanceSchedule;

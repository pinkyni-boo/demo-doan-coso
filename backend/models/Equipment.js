import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema(
  {
    equipmentName: {
      type: String,
      required: true,
      trim: true,
    },
    equipmentCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "cardio",
        "strength",
        "free_weights",
        "functional",
        "audio_visual",
        "accessories",
        "other",
      ],
    },
    brand: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    purchaseDate: {
      type: Date,
      required: true,
    },
    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    condition: {
      type: String,
      enum: ["excellent", "good", "fair", "poor", "broken"],
      default: "excellent",
    },
    status: {
      type: String,
      enum: ["available", "in-use", "maintenance", "retired"],
      default: "available",
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    warranty: {
      expiryDate: Date,
      provider: String,
      terms: String,
    },
    lastMaintenanceDate: {
      type: Date,
    },
    nextMaintenanceDate: {
      type: Date,
    },
    specifications: {
      weight: Number,
      dimensions: String,
      powerRequirement: String,
      maxCapacity: Number,
      other: mongoose.Schema.Types.Mixed,
    },
    supplier: {
      name: String,
      contact: String,
      email: String,
    },
    // Thông tin báo cáo từ trainers
    currentIssues: [
      {
        type: String, // mô tả vấn đề hiện tại
      },
    ],
    lastReportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // trainer báo cáo cuối cùng
    },
    lastReportedAt: {
      type: Date,
    },
    // Lịch sử báo cáo từ trainers
    reportHistory: [
      {
        reportedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        reportedAt: {
          type: Date,
          default: Date.now,
        },
        issueType: {
          type: String,
          enum: [
            "malfunction",
            "damage",
            "wear",
            "safety_concern",
            "needs_cleaning",
            "other",
          ],
          required: true,
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
        images: [String], // URLs của hình ảnh minh chứng
        isResolved: {
          type: Boolean,
          default: false,
        },
        resolvedAt: Date,
        resolvedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        adminNotes: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index để tìm kiếm nhanh
equipmentSchema.index({ equipmentCode: 1 });
equipmentSchema.index({ room: 1 });
equipmentSchema.index({ status: 1 });
equipmentSchema.index({ category: 1 });

const Equipment = mongoose.model("Equipment", equipmentSchema);

export default Equipment;

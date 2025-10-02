import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomName: {
      type: String,
      required: true,
      trim: true,
    },
    roomCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    area: {
      type: Number, // diện tích m²
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "maintenance", "inactive"],
      default: "active",
    },
    facilities: [
      {
        type: String, // điều hòa, gương, âm thanh, wifi...
      },
    ],
    description: {
      type: String,
      trim: true,
    },
    // Thông tin cho trainer báo cáo
    currentCondition: {
      type: String,
      enum: ["excellent", "good", "fair", "poor", "needs_attention"],
      default: "good",
    },
    lastInspectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // trainer who last reported
    },
    lastInspectedAt: {
      type: Date,
    },
    // Lịch sử báo cáo từ trainers
    reportHistory: [
      {
        reportedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        reportedAt: {
          type: Date,
          default: Date.now,
        },
        condition: {
          type: String,
          enum: ["excellent", "good", "fair", "poor", "needs_attention"],
        },
        issues: [String], // danh sách vấn đề
        description: String,
        priority: {
          type: String,
          enum: ["low", "medium", "high", "urgent"],
          default: "medium",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Room = mongoose.model("Room", roomSchema);

export default Room;

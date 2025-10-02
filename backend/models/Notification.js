import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: [
        "schedule",
        "payment",
        "attendance",
        "general",
        "issue_reported",
        "issue_acknowledged",
        "issue_resolved",
        "maintenance_scheduled",
        "maintenance_assigned",
        "maintenance_completed",
        "maintenance",
        "equipment",
        "room",
      ],
      default: "general",
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      // Can reference different models based on type
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for performance
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);

import mongoose from "mongoose";

const scheduleChangeRequestSchema = new mongoose.Schema({
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true
  },
  originalDate: {
    type: Date,
    required: true
  },
  requestedDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 500
  },
  urgency: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  adminResponse: {
    type: String,
    maxlength: 500
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  approvedAt: {
    type: Date
  },
  makeupSchedule: {
    date: Date,
    startTime: String,
    endTime: String,
    location: String
  }
}, {
  timestamps: true
});

// Index để tìm kiếm nhanh
scheduleChangeRequestSchema.index({ trainer: 1, status: 1 });
scheduleChangeRequestSchema.index({ class: 1 });
scheduleChangeRequestSchema.index({ createdAt: -1 });

export default mongoose.model("ScheduleChangeRequest", scheduleChangeRequestSchema);
import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionNumber: {
      type: Number,
      required: true,
    },
    sessionDate: {
      type: Date,
      required: true,
    },
    isPresent: {
      type: Boolean,
      default: false,
    },
    checkinTime: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Tạo index mới với field đúng
attendanceSchema.index(
  { classId: 1, userId: 1, sessionNumber: 1 },
  { unique: true }
);

export default mongoose.model("Attendance", attendanceSchema);

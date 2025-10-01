import mongoose from "mongoose";

const trainerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, match: /^\S+@\S+\.\S+$/ },
    phone: { type: String, required: true, unique: true, match: /^[0-9]{9,15}$/ },
    gender: { type: String, enum: ["male", "female"], required: true },
    specialty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    experience: { type: Number, min: 0, required: true },
    status: {
      type: String,
      enum: ["active", "inactive", "terminated"],
      default: "active",
      required: true,
    },
    terminatedReason: { type: String },
    isLocked: { type: Boolean, default: false },
    // Liên kết với tài khoản người dùng
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Trainer", trainerSchema);
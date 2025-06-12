import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    serviceName: {
      type: String,
      required: true,
    },
    instructorName: {
      type: String,
    },
    description: {
      type: String,
    },
    maxMembers: {
      type: Number,
      required: true,
      default: 20,
    },
    currentMembers: {
      type: Number,
      default: 0,
    },
    totalSessions: {
      type: Number,
      required: true,
      default: 12,
    },
    currentSession: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    schedule: [
      {
        dayOfWeek: {
          type: Number, // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7
          required: true,
        },
        startTime: {
          type: String, // "HH:mm"
          required: true,
        },
        endTime: {
          type: String, // "HH:mm"
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
    location: {
      type: String,
      default: "Phòng tập chính",
    },
    requirements: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual để tính số thành viên còn lại
classSchema.virtual("availableSlots").get(function () {
  return this.maxMembers - this.currentMembers;
});

// Middleware để tự động cập nhật status
classSchema.pre("save", function (next) {
  const now = new Date();
  const startDate = new Date(this.startDate);
  const endDate = new Date(this.endDate);

  if (now < startDate) {
    this.status = "upcoming";
  } else if (now >= startDate && now <= endDate) {
    this.status = "ongoing";
  } else if (now > endDate || this.currentSession >= this.totalSessions) {
    this.status = "completed";
  }

  next();
});

// Index để tìm kiếm nhanh
classSchema.index({ serviceName: 1, status: 1 });
classSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.model("Class", classSchema);

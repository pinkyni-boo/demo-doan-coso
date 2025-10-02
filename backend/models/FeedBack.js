import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Liên kết với club, class, service
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: false,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: false,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: false,
    },
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    // Loại feedback
    feedbackType: {
      type: String,
      enum: ["service", "trainer", "facility", "class", "general"],
      required: true,
    },
    // Đánh giá tổng thể (1-5 sao)
    overallRating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    // Đánh giá chi tiết
    ratings: {
      // Chất lượng dịch vụ
      serviceQuality: {
        type: Number,
        min: 1,
        max: 5,
        default: 5,
      },
      // Chất lượng thiết bị
      equipmentQuality: {
        type: Number,
        min: 1,
        max: 5,
        default: 5,
      },
      // Sạch sẽ, vệ sinh
      cleanliness: {
        type: Number,
        min: 1,
        max: 5,
        default: 5,
      },
      // Nhân viên, huấn luyện viên
      staffService: {
        type: Number,
        min: 1,
        max: 5,
        default: 5,
      },
      // Giá cả hợp lý
      valueForMoney: {
        type: Number,
        min: 1,
        max: 5,
        default: 5,
      },
      // Không gian, môi trường
      atmosphere: {
        type: Number,
        min: 1,
        max: 5,
        default: 5,
      },
    },
    // Nội dung feedback
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    // Loại feedback bổ sung (có thể khác với feedbackType)
    type: {
      type: String,
      enum: ["general", "class", "service", "complaint", "suggestion"],
      default: "general",
    },
    // Tags
    tags: [
      {
        type: String,
        enum: [
          "equipment",
          "cleanliness",
          "staff",
          "price",
          "schedule",
          "facilities",
          "music",
          "temperature",
          "crowding",
          "parking",
          "other",
        ],
      },
    ],
    // Điểm mạnh
    pros: {
      type: [String],
      default: [],
    },
    // Điểm cần cải thiện
    cons: {
      type: [String],
      default: [],
    },
    // Gợi ý cải thiện
    suggestions: {
      type: String,
      maxlength: 500,
    },
    // Liên quan đến dịch vụ/lớp học cụ thể
    relatedService: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },
    relatedClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
    relatedTrainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Trainer
    },
    relatedClub: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
    },
    // Trạng thái
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    // Có khuyến nghị không
    wouldRecommend: {
      type: Boolean,
      default: true,
    },
    // Tần suất sử dụng
    usageFrequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "occasionally"],
      default: "weekly",
    },
    // Thời gian là thành viên
    membershipDuration: {
      type: String,
      enum: ["1-3months", "3-6months", "6-12months", "1year+"],
    },
    // Có hiển thị công khai không
    isPublic: {
      type: Boolean,
      default: true,
    },
    // Ẩn danh
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    // Images đính kèm
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    // Admin response
    adminResponse: {
      content: String,
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      respondedAt: Date,
    },
    // Rejection details
    rejectionReason: {
      type: String,
      maxlength: 500,
    },
    rejectedAt: {
      type: Date,
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Approval details
    approvedAt: {
      type: Date,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Metadata
    helpful: {
      type: Number,
      default: 0,
    },
    helpfulUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes để tối ưu hóa truy vấn
feedbackSchema.index({ user: 1, createdAt: -1 });
feedbackSchema.index({ feedbackType: 1, status: 1 });
feedbackSchema.index({ overallRating: -1 });
feedbackSchema.index({ isPublic: 1, status: 1 });

// Virtual để tính rating trung bình
feedbackSchema.virtual("averageRating").get(function () {
  const ratings = this.ratings;
  const values = Object.values(ratings).filter((val) => val > 0);
  if (values.length === 0) return this.overallRating;

  const sum = values.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / values.length) * 10) / 10;
});

// Middleware để cập nhật thống kê
feedbackSchema.post("save", async function () {
  // Có thể thêm logic cập nhật rating trung bình cho service/class/trainer
});

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;

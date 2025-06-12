import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      enum: [
        "Chuyển khoản",
        "Thẻ tín dụng",
        "Ví điện tử",
        "Thẻ ngân hàng",
        "VNPay",
        "Momo",
        "ZaloPay",
      ],
      default: "Chuyển khoản",
    },
    registrationIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
    ],
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled", "failed"],
      default: "pending",
    },
    paymentType: {
      type: String,
      enum: [
        "membership",
        "membership_upgrade",
        "class",
        "personal_training",
        "membership_and_class",
      ],
      default: "membership",
    },
    completedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", PaymentSchema);

export default Payment;

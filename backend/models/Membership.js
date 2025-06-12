import mongoose from "mongoose";

const MembershipSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending_payment", "active", "expired", "cancelled"], // These are the valid values
      default: "pending_payment",
    },
    paymentStatus: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Membership = mongoose.model("Membership", MembershipSchema);

export default Membership;

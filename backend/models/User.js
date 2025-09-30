import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Add the address field to the user schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
      default: "",
    },
    dob: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    role: {
      type: String,
      enum: ["user", "admin", "trainer"],
      default: "user",
    },
    membership: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Membership",
      },
      type: {
        type: String,
      },
      startDate: {
        type: Date,
      },
      endDate: {
        type: Date,
      },
    },
    avatar: {
      public_id: String,
      url: String,
    },
    // Thêm trường theo dõi tài khoản bị khóa
    isAccountLocked: {
      type: Boolean,
      default: false,
    },
    lockReason: String,
    lockUntil: Date,
  },
  { timestamps: true }
);

// Add pre-save hook to hash password
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) {
    console.log('Password không thay đổi, bỏ qua hash');
    return next();
  }

  try {
    console.log('Đang hash password...');
    // Generate a salt
    const salt = await bcrypt.genSalt(10);

    // Hash the password using our new salt
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Hash password thành công');
    next();
  } catch (error) {
    console.error('Lỗi hash password:', error);
    next(error);
  }
});

const User = mongoose.model("User", userSchema);

export default User;

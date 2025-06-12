import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcrypt";

export const signup = async (req, res) => {
  try {
    const { username, email, phone, password, dob, gender, fullName, address } =
      req.body;

    if (!username || !email || !phone || !password || !dob || !gender) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const trimmedUsername = username.trim();
    const trimmedPhone = phone.trim();
    const trimmedFullName = fullName ? fullName.trim() : "";
    const trimmedAddress = address ? address.trim() : "";

    // Check for existing user
    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { username: trimmedUsername },
        { phone: trimmedPhone },
      ],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email, username hoặc phone đã tồn tại!" });
    }

    // Create user with password - will be hashed by pre-save hook
    const newUser = new User({
      username: trimmedUsername,
      email: normalizedEmail,
      phone: trimmedPhone,
      password, // Password will be hashed in the pre-save hook
      fullName: trimmedFullName,
      address: trimmedAddress,
      dob: new Date(dob),
      gender,
    });

    await newUser.save();

    return res.status(201).json({ message: "Đăng ký thành công!" });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Đăng ký thất bại. Lỗi server." });
  }
};

// Update the login function to return the address field
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the identifier is email, username or phone
    const user = await User.findOne({
      $or: [
        { email },
        { username: email }, // Using email field for username/phone too
        { phone: email },
      ],
    });

    // If user not found
    if (!user) {
      return res.status(400).json({ message: "Tài khoản không tồn tại" });
    }

    // Direct password comparison using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu không chính xác" });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || "your-fallback-secret-key",
      { expiresIn: "7d" }
    );

    // Return user info and token
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        membership: user.membership,
        phone: user.phone,
        gender: user.gender,
        dob: user.dob,
        address: user.address, // Include address
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ message: "Đăng nhập thất bại", error: error.message });
  }
};

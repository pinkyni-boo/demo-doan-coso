import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Đăng ký user
export const register = async (req, res) => {
  try {
    const { username, email, password, fullName, phone } = req.body;

    // Kiểm tra user đã tồn tại
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email hoặc tên đăng nhập đã được sử dụng",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo user mới
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      fullName,
      phone,
      role: "user",
    });

    await newUser.save();

    // Tạo JWT token
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Đăng ký thành công",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Lỗi server khi đăng ký" });
  }
};

// Đăng nhập user
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Tìm user theo username hoặc email
    const user = await User.findOne({
      $or: [{ username }, { email: username }],
    });

    if (!user) {
      return res.status(400).json({
        message: "Tên đăng nhập hoặc mật khẩu không đúng",
      });
    }

    // Kiểm tra password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Tên đăng nhập hoặc mật khẩu không đúng",
      });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        address: user.address,
        dob: user.dob,
        gender: user.gender,
      },
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Lỗi server khi đăng nhập" });
  }
};

// Lấy profile user hiện tại
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error getting profile:", error);
    res.status(500).json({ message: "Lỗi server khi lấy thông tin profile" });
  }
};

// Cập nhật profile user hiện tại
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, phone, dob, gender, fullName, address } = req.body;

    // Kiểm tra user tồn tại
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // Kiểm tra username và email có bị trùng không (trừ user hiện tại)
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({
        username,
        _id: { $ne: userId },
      });
      if (existingUsername) {
        return res.status(400).json({
          message: "Tên đăng nhập đã được sử dụng",
        });
      }
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({
        email,
        _id: { $ne: userId },
      });
      if (existingEmail) {
        return res.status(400).json({
          message: "Email đã được sử dụng",
        });
      }
    }

    // Cập nhật các trường
    user.username = username || user.username;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.dob = dob || user.dob;
    user.gender = gender || user.gender;
    user.fullName = fullName || user.fullName;
    user.address = address || user.address;

    await user.save();

    // Trả về user đã cập nhật (không bao gồm password)
    const updatedUser = await User.findById(userId).select("-password");

    res.json({
      message: "Cập nhật thông tin thành công",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Lỗi server khi cập nhật thông tin" });
  }
};

// Lấy thông tin user theo ID (cho admin)
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate input
    if (!id || id === "undefined") {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID format",
      });
    }

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    console.error("Error getting user by ID:", error);
    res.status(500).json({
      message: "Server error while fetching user",
    });
  }
};

// Cập nhật thông tin user theo ID (cho admin)
export const updateUserById = async (req, res) => {
  try {
    const { username, email, phone, dob, gender, fullName, address, role } =
      req.body;

    // Kiểm tra user tồn tại
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    // Kiểm tra username và email có bị trùng không (trừ user hiện tại)
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({
        username,
        _id: { $ne: req.params.id },
      });
      if (existingUsername) {
        return res.status(400).json({
          message: "Tên đăng nhập đã được sử dụng",
        });
      }
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({
        email,
        _id: { $ne: req.params.id },
      });
      if (existingEmail) {
        return res.status(400).json({
          message: "Email đã được sử dụng",
        });
      }
    }

    // Cập nhật các trường
    user.username = username || user.username;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.dob = dob || user.dob;
    user.gender = gender || user.gender;
    user.fullName = fullName || user.fullName;
    user.address = address || user.address;
    if (role) user.role = role; // Chỉ admin mới có thể thay đổi role

    await user.save();

    // Trả về dữ liệu đã cập nhật (không bao gồm password)
    const updatedUser = await User.findById(user._id).select("-password");

    res.json({
      message: "Cập nhật thông tin user thành công",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user by ID:", error);
    res.status(500).json({ message: "Lỗi server khi cập nhật thông tin" });
  }
};

// Đổi mật khẩu
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Mật khẩu mới phải có ít nhất 6 ký tự",
      });
    }

    // Tìm user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // Kiểm tra mật khẩu hiện tại
    const isCurrentPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordCorrect) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    // Hash mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Cập nhật mật khẩu
    await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Lỗi server khi đổi mật khẩu" });
  }
};

// Lấy danh sách tất cả users (cho admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Error getting all users:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách users" });
  }
};

// Xóa user (cho admin)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    // Không cho phép xóa admin
    if (user.role === "admin") {
      return res.status(400).json({ message: "Không thể xóa tài khoản admin" });
    }

    await User.findByIdAndDelete(id);

    res.json({ message: "Xóa user thành công" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Lỗi server khi xóa user" });
  }
};

// Thêm function tạo user từ admin (không cần email verification)
export const createUserByAdmin = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      fullName,
      phone,
      role,
      address,
      dob,
      gender,
    } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Tên đăng nhập, email và mật khẩu là bắt buộc",
      });
    }

    // Kiểm tra user đã tồn tại
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email hoặc tên đăng nhập đã được sử dụng",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo user mới
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      fullName,
      phone,
      role: role || "user",
      address,
      dob,
      gender,
    });

    await newUser.save();

    // Trả về user (không bao gồm password)
    const userResponse = await User.findById(newUser._id).select("-password");

    res.status(201).json({
      message: "Tạo người dùng thành công",
      user: userResponse,
    });
  } catch (error) {
    console.error("Error creating user by admin:", error);
    res.status(500).json({ message: "Lỗi server khi tạo người dùng" });
  }
};

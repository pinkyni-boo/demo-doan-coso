import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware xác thực token
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Không có token xác thực, truy cập bị từ chối",
      });
    }

    // Check if token is not just empty string or invalid format
    if (token.trim() === "" || token === "null" || token === "undefined") {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ, người dùng không tồn tại",
      });
    }

    // Kiểm tra tài khoản có bị khóa không
    if (user.isAccountLocked) {
      return res.status(403).json({ 
        message: "Tài khoản đã bị khóa",
        reason: user.lockReason || "Tài khoản bị khóa bởi admin",
        isLocked: true
      });
    }

    // Gán user vào req
    req.user = user;
    next();
  } catch (error) {
    console.error("Token verification error:", error);

    let message = "Token không hợp lệ";

    if (error.name === "JsonWebTokenError") {
      message = "Token không đúng định dạng";
    } else if (error.name === "TokenExpiredError") {
      message = "Token đã hết hạn";
    }

    res.status(401).json({
      success: false,
      message: message,
    });
  }
};

// Middleware xác thực admin
export const verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Truy cập bị từ chối. Chỉ admin mới có quyền này.",
    });
  }
  next();
};

// Middleware xác thực user hoặc admin
export const verifyUserOrAdmin = (req, res, next) => {
  const { userId } = req.params;

  if (req.user.role === "admin" || req.user._id.toString() === userId) {
    next();
  } else {
    res.status(403).json({
      message: "Truy cập bị từ chối. Bạn chỉ có thể truy cập dữ liệu của mình.",
    });
  }
};

export const verifyTrainer = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Không có thông tin user" });
    }

    if (req.user.role !== "trainer") {
      return res
        .status(403)
        .json({ message: "Chỉ huấn luyện viên mới có quyền truy cập" });
    }

    next();
  } catch (error) {
    console.error("Trainer verification error:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server khi xác thực quyền huấn luyện viên" });
  }
};

export const verifyAdminOrTrainer = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Không có thông tin user" });
    }

    if (req.user.role !== "admin" && req.user.role !== "trainer") {
      return res
        .status(403)
        .json({ message: "Chỉ admin hoặc huấn luyện viên mới có quyền truy cập" });
    }

    next();
  } catch (error) {
    console.error("Admin/Trainer verification error:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server khi xác thực quyền" });
  }
};

// Thêm alias exports để backward compatibility
export const isAuthenticated = verifyToken;
export const isAdmin = verifyAdmin;
export const isTrainer = verifyTrainer;
export const isAdminOrTrainer = verifyAdminOrTrainer;
export const authenticateToken = verifyToken;

export default { verifyToken, verifyAdmin, verifyUserOrAdmin, verifyTrainer, verifyAdminOrTrainer };
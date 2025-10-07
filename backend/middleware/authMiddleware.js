import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    console.log(
      "Authorization header:",
      authHeader ? `${authHeader.substring(0, 30)}...` : "No header"
    );

    // Check if Authorization header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No valid Authorization header");
      return res.status(401).json({
        success: false,
        message: "Không có token xác thực, truy cập bị từ chối",
      });
    }

    const token = authHeader.replace("Bearer ", "");
    console.log(
      "Extracted token:",
      token ? `${token.substring(0, 20)}...` : "null"
    );

    if (!token) {
      console.log("No token provided");
      return res.status(401).json({
        success: false,
        message: "Không có token xác thực, truy cập bị từ chối",
      });
    }

    // Check if token is not just empty string or invalid format
    if (token.trim() === "" || token === "null" || token === "undefined") {
      console.log("Invalid token format:", token);
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded successfully for user:", decoded.userId);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      console.log("User not found for token");
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ, người dùng không tồn tại",
      });
    }

    console.log("User found:", user.username, "Role:", user.role);

    // Kiểm tra tài khoản có bị khóa không
    if (user.isAccountLocked) {
      console.log("Account is locked");
      return res.status(403).json({
        message: "Tài khoản đã bị khóa",
        reason: user.lockReason || "Tài khoản bị khóa bởi admin",
        isLocked: true,
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

// Middleware cho phép admin truy cập tất cả, user chỉ truy cập của mình
export const verifyOwnerOrAdmin = (req, res, next) => {
  const { userId } = req.params;

  // Admin có thể truy cập tất cả
  if (req.user.role === "admin") {
    return next();
  }

  // User chỉ có thể truy cập dữ liệu của mình
  if (req.user._id.toString() === userId) {
    return next();
  }

  return res.status(403).json({
    message: "Truy cập bị từ chối. Bạn chỉ có thể truy cập dữ liệu của mình.",
  });
};

// Middleware cho phép admin hoặc trainer
export const verifyAdminOrTrainer = (req, res, next) => {
  try {
    console.log("=== VERIFY ADMIN OR TRAINER ===");
    console.log("User role:", req.user?.role);

    if (!req.user) {
      console.log("No user found in request");
      return res.status(401).json({ message: "Không có thông tin user" });
    }

    if (req.user.role !== "admin" && req.user.role !== "trainer") {
      console.log("Access denied for role:", req.user.role);
      return res.status(403).json({
        message: "Chỉ admin hoặc huấn luyện viên mới có quyền truy cập",
      });
    }

    console.log("Access granted for role:", req.user.role);
    next();
  } catch (error) {
    console.error("Admin/Trainer verification error:", error);
    return res.status(500).json({ message: "Lỗi server khi xác thực quyền" });
  }
};

// Middleware cho phép tất cả user đã đăng nhập (admin có toàn quyền)
export const verifyAuthenticatedUser = (req, res, next) => {
  // Admin luôn được phép
  if (req.user.role === "admin") {
    return next();
  }

  // Các role khác chỉ cần đã đăng nhập
  if (req.user) {
    return next();
  }

  return res.status(401).json({
    message: "Bạn cần đăng nhập để truy cập.",
  });
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

    // Admin có thể truy cập tất cả chức năng trainer
    if (req.user.role === "admin" || req.user.role === "trainer") {
      return next();
    }

    return res.status(403).json({
      message: "Chỉ admin hoặc huấn luyện viên mới có quyền truy cập",
    });
  } catch (error) {
    console.error("Trainer verification error:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server khi xác thực quyền huấn luyện viên" });
  }
};

// Thêm alias exports để backward compatibility
export const isAuthenticated = verifyToken;
export const isAdmin = verifyAdmin;
export const isTrainer = verifyTrainer;
export const isAdminOrTrainer = verifyAdminOrTrainer;
export const authenticateToken = verifyToken;

export default {
  verifyToken,
  verifyAdmin,
  verifyUserOrAdmin: verifyOwnerOrAdmin, // Update alias
  verifyOwnerOrAdmin,
  verifyTrainer,
  verifyAdminOrTrainer,
  verifyAuthenticatedUser,
};

import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token không được cung cấp" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token received:", token);

    if (!token) {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded successfully:", decoded);

    // Tìm user từ database
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User không tồn tại" });
    }

    // Gán user vào req
    req.user = user;
    console.log("User attached to req:", { id: user._id, role: user.role });

    next();
  } catch (error) {
    console.error("Token verification error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token đã hết hạn" });
    }

    return res.status(500).json({ message: "Lỗi server khi xác thực token" });
  }
};

export const verifyAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Không có thông tin user" });
    }

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Chỉ admin mới có quyền truy cập" });
    }

    next();
  } catch (error) {
    console.error("Admin verification error:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server khi xác thực quyền admin" });
  }
};

// Thêm alias exports để backward compatibility
export const isAuthenticated = verifyToken;
export const isAdmin = verifyAdmin;
export const authenticateToken = verifyToken; // Thêm dòng này

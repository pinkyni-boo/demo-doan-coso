// Complete implementation with better debugging

import Membership from "../models/Membership.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// Đăng ký thẻ thành viên mới
export const createMembership = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, type, startDate, endDate, price } = req.body;

    // Log the request data for debugging
    console.log("Membership request data:", req.body);

    // Validation checks with more detailed logging
    if (!userId) {
      console.log("Missing userId in request");
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "userId is required" });
    }

    if (!type) {
      console.log("Missing type in request");
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "type is required" });
    }

    if (!endDate) {
      console.log("Missing endDate in request");
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "endDate is required" });
    }

    if (!price && price !== 0) {
      console.log("Missing price in request");
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "price is required" });
    }

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log("Invalid userId format:", userId);
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid userId format" });
    }

    // Kiểm tra user có tồn tại không
    const user = await User.findById(userId).session(session);
    if (!user) {
      console.log("User not found for ID:", userId);
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Kiểm tra xem user đã có thẻ thành viên active chưa
    const existingMembership = await Membership.findOne({
      user: userId,
      status: "active",
    }).session(session);

    if (existingMembership) {
      console.log("User already has active membership:", existingMembership);
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Người dùng đã có thẻ thành viên đang hoạt động",
        existingMembership,
      });
    }

    // Tạo thẻ thành viên mới
    const newMembership = new Membership({
      user: userId,
      type,
      startDate: startDate || new Date(),
      endDate,
      price,
      status: "pending_payment", // Chờ thanh toán trước khi kích hoạt
    });

    // Log the membership object before saving
    console.log("Creating new membership:", newMembership);

    const savedMembership = await newMembership.save({ session });
    console.log("Membership saved successfully:", savedMembership);

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: "Đăng ký thẻ thành viên thành công, chờ thanh toán",
      membership: savedMembership,
    });
  } catch (error) {
    console.error("Lỗi khi đăng ký thẻ thành viên:", error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      message: "Không thể đăng ký thẻ thành viên",
      error: error.message,
    });
  }
};

// Lấy thông tin thẻ thành viên của user
export const getUserMembership = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find active membership for user
    const membership = await Membership.findOne({
      user: userId,
      status: "active",
    });

    if (!membership) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thẻ thành viên đang hoạt động" });
    }

    return res.status(200).json(membership);
  } catch (error) {
    console.error("Error getting user membership:", error);
    return res.status(500).json({
      message: "Lỗi khi lấy thông tin thẻ thành viên",
      error: error.message,
    });
  }
};

// Cập nhật thông tin thẻ thành viên
export const updateMembership = async (req, res) => {
  try {
    const { membershipId } = req.params;
    const { type, endDate, status } = req.body;

    const membership = await Membership.findById(membershipId);
    if (!membership) {
      return res.status(404).json({ message: "Không tìm thấy thẻ thành viên" });
    }

    // Cập nhật thông tin
    if (type) membership.type = type;
    if (endDate) membership.endDate = endDate;
    if (status) membership.status = status;

    await membership.save();

    // Nếu cập nhật status thành expired hoặc cancelled, cập nhật lại user
    if (status === "expired" || status === "cancelled") {
      await User.findByIdAndUpdate(
        membership.user,
        { $unset: { membership: "" } },
        { new: true }
      );
    } else if (type || endDate) {
      // Cập nhật thông tin thẻ trong user object
      const user = await User.findById(membership.user);
      if (user) {
        user.membership = {
          id: membership.id,
          type: membership.type,
          startDate: membership.startDate,
          endDate: membership.endDate,
        };
        await user.save();
      }
    }

    return res.status(200).json({
      message: "Cập nhật thẻ thành viên thành công",
      membership,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật thẻ thành viên:", error);
    return res.status(500).json({
      message: "Không thể cập nhật thẻ thành viên",
      error: error.message,
    });
  }
};

// Hủy thẻ thành viên
export const cancelMembership = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { membershipId } = req.params;

    const membership = await Membership.findById(membershipId).session(session);
    if (!membership) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Không tìm thấy thẻ thành viên" });
    }

    // Cập nhật trạng thái thẻ
    membership.status = "cancelled";
    await membership.save({ session });

    // Xóa thông tin thẻ khỏi user
    await User.findByIdAndUpdate(
      membership.user,
      { $unset: { membership: "" } },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Hủy thẻ thành viên thành công",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Lỗi khi hủy thẻ thành viên:", error);
    return res.status(500).json({
      message: "Không thể hủy thẻ thành viên",
      error: error.message,
    });
  }
};

// Lấy danh sách tất cả thẻ thành viên (cho admin)
export const getAllMemberships = async (req, res) => {
  try {
    const memberships = await Membership.find()
      .sort({ createdAt: -1 })
      .populate("user", "username email");

    return res.status(200).json(memberships);
  } catch (error) {
    console.error("Error getting all memberships:", error);
    return res.status(500).json({
      message: "Lỗi khi lấy danh sách thẻ thành viên",
      error: error.message,
    });
  }
};

// Nâng cấp thẻ thành viên
export const upgradeMembership = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params; // ID of current membership
    const { type, startDate, endDate, price } = req.body;

    // Kiểm tra membership hiện tại có tồn tại không
    const currentMembership = await Membership.findById(id).session(session);
    if (!currentMembership) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ message: "Không tìm thấy thẻ thành viên hiện tại" });
    }

    // Kiểm tra status của membership hiện tại
    if (currentMembership.status !== "active") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Chỉ thẻ thành viên đang hoạt động mới có thể nâng cấp",
      });
    }

    // Đánh dấu thẻ cũ là đã được nâng cấp
    currentMembership.status = "upgraded";
    await currentMembership.save({ session });

    // Tạo thẻ thành viên mới với loại nâng cấp
    const newMembership = new Membership({
      user: currentMembership.user,
      type,
      startDate: startDate || new Date(),
      endDate,
      price,
      status: "pending_payment", // Chờ thanh toán trước khi kích hoạt
    });

    await newMembership.save({ session });

    // Cập nhật thông tin membership vào user
    const user = await User.findById(currentMembership.user).session(session);
    if (user) {
      // Dữ liệu thẻ không thay đổi cho đến khi thanh toán thành công
      // Sẽ được cập nhật ở PaymentController khi thanh toán hoàn tất
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Nâng cấp thẻ thành viên thành công, chờ thanh toán",
      membership: newMembership,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Lỗi khi nâng cấp thẻ thành viên:", error);
    return res.status(500).json({
      message: "Không thể nâng cấp thẻ thành viên",
      error: error.message,
    });
  }
};

// Get a specific membership by ID
export const getMembershipById = async (req, res) => {
  try {
    const { membershipId } = req.params;

    const membership = await Membership.findById(membershipId);

    if (!membership) {
      return res.status(404).json({ message: "Không tìm thấy thẻ thành viên" });
    }

    return res.status(200).json(membership);
  } catch (error) {
    console.error("Error getting membership by ID:", error);
    return res.status(500).json({
      message: "Lỗi khi lấy thông tin thẻ thành viên",
      error: error.message,
    });
  }
};

// Xóa thẻ thành viên vĩnh viễn
export const deleteMembership = async (req, res) => {
  try {
    const { membershipId } = req.params;

    // Kiểm tra xem thẻ có tồn tại không
    const membership = await Membership.findById(membershipId);
    if (!membership) {
      return res.status(404).json({ message: "Không tìm thấy thẻ thành viên" });
    }

    // Kiểm tra xem thẻ có ở trạng thái cancelled không
    if (membership.status !== "cancelled") {
      return res.status(400).json({
        message: "Chỉ có thể xóa các thẻ đã được hủy",
      });
    }

    // Xóa thẻ thành viên khỏi database
    await Membership.findByIdAndDelete(membershipId);

    return res.status(200).json({
      message: "Đã xóa thẻ thành viên thành công",
    });
  } catch (error) {
    console.error("Lỗi khi xóa thẻ thành viên:", error);
    return res.status(500).json({
      message: "Không thể xóa thẻ thành viên",
      error: error.message,
    });
  }
};

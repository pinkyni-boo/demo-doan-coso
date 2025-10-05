import ScheduleChangeRequest from "../models/ScheduleChangeRequest.js";
import Class from "../models/Class.js";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import Room from "../models/Room.js";
import NotificationService from "../services/NotificationService.js";
import mongoose from "mongoose";

// Lấy tất cả yêu cầu thay đổi lịch cho admin
export const getAllScheduleChangeRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    // Tạo filter
    const filter = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    // Tính toán pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Lấy danh sách yêu cầu
    const requests = await ScheduleChangeRequest.find(filter)
      .populate({
        path: "class",
        select: "className serviceName location schedule startDate endDate",
      })
      .populate({
        path: "trainer",
        select: "fullName email phone",
      })
      .populate({
        path: "approvedBy",
        select: "fullName",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Đếm tổng số yêu cầu
    const total = await ScheduleChangeRequest.countDocuments(filter);

    // Thống kê theo status
    const stats = await ScheduleChangeRequest.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusStats = {
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    stats.forEach((stat) => {
      statusStats[stat._id] = stat.count;
    });

    res.json({
      success: true,
      requests,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
      stats: statusStats,
    });
  } catch (error) {
    console.error("Error fetching schedule change requests:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách yêu cầu thay đổi lịch",
    });
  }
};

// Cập nhật trạng thái yêu cầu thay đổi lịch (approve/reject)
export const updateScheduleChangeRequestStatus = async (req, res) => {
  try {
    const { id, action } = req.params;
    const { adminResponse } = req.body;
    const adminId = req.user.id;

    // Validate action
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message:
          "Hành động không hợp lệ. Chỉ chấp nhận 'approve' hoặc 'reject'",
      });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID yêu cầu không hợp lệ",
      });
    }

    // Tìm yêu cầu
    const request = await ScheduleChangeRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy yêu cầu thay đổi lịch",
      });
    }

    // Kiểm tra trạng thái hiện tại
    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Yêu cầu này đã được xử lý trước đó",
      });
    }

    // Cập nhật trạng thái
    const updateData = {
      status: action === "approve" ? "approved" : "rejected",
      adminResponse: adminResponse || "",
      approvedBy: adminId,
      approvedAt: new Date(),
    };

    const updatedRequest = await ScheduleChangeRequest.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate([
      { path: "class", select: "className serviceName location" },
      { path: "trainer", select: "fullName email" },
      { path: "approvedBy", select: "fullName" },
    ]);

    // Gửi thông báo cho huấn luyện viên
    try {
      const admin = await User.findById(adminId);
      if (action === "approve") {
        await NotificationService.notifyTrainerScheduleApproved(
          updatedRequest,
          admin
        );
      } else {
        await NotificationService.notifyTrainerScheduleRejected(
          updatedRequest,
          admin
        );
      }
    } catch (notificationError) {
      console.error("Error sending notification:", notificationError);
      // Không làm gián đoạn flow chính nếu thông báo lỗi
    }

    res.json({
      success: true,
      message: `Đã ${
        action === "approve" ? "phê duyệt" : "từ chối"
      } yêu cầu thành công`,
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating schedule change request status:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật trạng thái yêu cầu",
    });
  }
};

// Thêm lịch dạy bù
export const addMakeupSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime, location, roomId } = req.body;

    // Validate input
    if (!date || !startTime || !endTime || (!location && !roomId)) {
      return res.status(400).json({
        success: false,
        message:
          "Vui lòng cung cấp đầy đủ thông tin: date, startTime, endTime, và location hoặc roomId",
      });
    }

    // Validate roomId if provided
    let roomData = null;
    if (roomId) {
      if (!mongoose.Types.ObjectId.isValid(roomId)) {
        return res.status(400).json({
          success: false,
          message: "Room ID không hợp lệ",
        });
      }

      // Import Room model if not already imported
      roomData = await Room.findById(roomId);
      if (!roomData) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy phòng tập",
        });
      }

      // Check room status
      if (roomData.status !== "active") {
        return res.status(400).json({
          success: false,
          message: `Phòng ${roomData.roomName} hiện không khả dụng (${roomData.status})`,
        });
      }
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID yêu cầu không hợp lệ",
      });
    }

    // Tìm yêu cầu và populate class information
    const request = await ScheduleChangeRequest.findById(id).populate("class");
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy yêu cầu thay đổi lịch",
      });
    }

    // Kiểm tra trạng thái
    if (request.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể thêm lịch bù cho yêu cầu đã được phê duyệt",
      });
    }

    // Kiểm tra đã có lịch bù chưa
    if (request.makeupSchedule && request.makeupSchedule.date) {
      return res.status(400).json({
        success: false,
        message: "Yêu cầu này đã có lịch dạy bù",
      });
    }

    // Validate date (không được trong quá khứ)
    const makeupDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (makeupDate < today) {
      return res.status(400).json({
        success: false,
        message: "Ngày dạy bù không thể trong quá khứ",
      });
    }

    // Validate makeup date phải nằm trong thời gian lớp học
    if (request.class) {
      const classStartDate = new Date(request.class.startDate);
      const classEndDate = new Date(request.class.endDate);

      classStartDate.setHours(0, 0, 0, 0);
      classEndDate.setHours(0, 0, 0, 0);
      makeupDate.setHours(0, 0, 0, 0);

      if (makeupDate < classStartDate || makeupDate > classEndDate) {
        return res.status(400).json({
          success: false,
          message: `Ngày dạy bù phải nằm trong thời gian lớp học (${classStartDate.toLocaleDateString(
            "vi-VN"
          )} - ${classEndDate.toLocaleDateString("vi-VN")})`,
        });
      }
    }

    // Validate time
    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: "Giờ bắt đầu phải trước giờ kết thúc",
      });
    }

    // Cập nhật lịch bù
    const updatedRequest = await ScheduleChangeRequest.findByIdAndUpdate(
      id,
      {
        makeupSchedule: {
          date: new Date(date),
          startTime,
          endTime,
          location: roomData
            ? `${roomData.roomName} - ${roomData.location}`
            : location.trim(),
          ...(roomId && { roomId: roomId }),
        },
      },
      { new: true }
    ).populate([
      { path: "class", select: "className serviceName location" },
      { path: "trainer", select: "fullName email" },
      { path: "approvedBy", select: "fullName" },
    ]);

    // TODO: Tự động cập nhật vào lịch dạy của huấn luyện viên
    // Có thể tạo một collection riêng cho MakeupSchedule hoặc
    // thêm field makeupSchedules vào Class model

    res.json({
      success: true,
      message: "Đã thêm lịch dạy bù thành công",
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Error adding makeup schedule:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi thêm lịch dạy bù",
    });
  }
};

// Lấy danh sách tất cả trainer cho admin
export const getAllTrainers = async (req, res) => {
  try {
    const trainers = await User.find({ role: "trainer" })
      .select("fullName email phone gender status createdAt")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      trainers,
    });
  } catch (error) {
    console.error("Error fetching trainers:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách trainer",
    });
  }
};

// Lấy lịch dạy của một trainer cụ thể
export const getTrainerSchedule = async (req, res) => {
  try {
    const { trainerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(trainerId)) {
      return res.status(400).json({
        success: false,
        message: "ID trainer không hợp lệ",
      });
    }

    // Kiểm tra trainer có tồn tại không
    const trainer = await User.findOne({
      _id: trainerId,
      role: "trainer",
    }).select("fullName email");

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy trainer",
      });
    }

    // Lấy các lớp học của trainer
    const classes = await Class.find({ trainerId })
      .populate("roomId", "name")
      .select(
        "className serviceName location schedule startDate endDate currentStudents maxStudents roomId"
      )
      .sort({ startDate: 1 });

    res.json({
      success: true,
      trainer,
      classes,
    });
  } catch (error) {
    console.error("Error fetching trainer schedule:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy lịch dạy",
    });
  }
};

// Lấy thống kê dashboard cho admin
export const getDashboardStats = async (req, res) => {
  try {
    // Lấy số liệu tổng quan - đếm tất cả tài khoản trong hệ thống
    const [totalAccountsCount, trainerCount, classCount, revenueData] =
      await Promise.all([
        User.countDocuments(), // Đếm tất cả tài khoản (user, trainer, admin)
        User.countDocuments({ role: "trainer" }),
        Class.countDocuments(),
        Payment.aggregate([
          { $match: { status: "approved" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
      ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    res.json({
      success: true,
      stats: {
        totalUsers: totalAccountsCount, // Tổng số tài khoản trong website
        totalTrainers: trainerCount,
        totalClasses: classCount,
        totalRevenue: totalRevenue,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thống kê dashboard",
    });
  }
};

// Lấy tất cả users cho admin
export const getAllUsers = async (req, res) => {
  try {
    // Lấy tất cả tài khoản trong hệ thống (bao gồm user, trainer, admin)
    const users = await User.find()
      .select("fullName email phone role createdAt membership")
      .populate("membership", "type status")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách users",
    });
  }
};

// Lấy tất cả classes cho admin
export const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .select(
        "className serviceName location schedule startDate endDate currentMembers maxMembers status"
      )
      .sort({ startDate: -1 });

    res.json({
      success: true,
      classes,
    });
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách classes",
    });
  }
};

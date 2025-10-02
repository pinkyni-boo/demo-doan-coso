import IssueReport from "../models/IssueReport.js";
import Equipment from "../models/Equipment.js";
import Room from "../models/Room.js";
import MaintenanceSchedule from "../models/MaintenanceSchedule.js";
import NotificationService from "../services/NotificationService.js";
import User from "../models/User.js";

// TRAINER FUNCTIONS - Báo cáo vấn đề

// Tạo báo cáo vấn đề mới (trainer)
export const createIssueReport = async (req, res) => {
  try {
    const {
      reportType,
      equipmentId,
      roomId,
      issueType,
      title,
      description,
      severity,
    } = req.body;

    // Validate trainer role
    if (req.user.role !== "trainer" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Chỉ huấn luyện viên mới có thể tạo báo cáo vấn đề",
      });
    }

    // Validate required fields based on report type
    if (reportType === "equipment" && !equipmentId) {
      return res.status(400).json({
        success: false,
        message: "Thiết bị không được để trống",
      });
    }

    if (reportType === "room" && !roomId) {
      return res.status(400).json({
        success: false,
        message: "Phòng tập không được để trống",
      });
    }

    // Xử lý hình ảnh đã upload
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        images.push({
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: `/uploads/issue-reports/${file.filename}`,
        });
      });
    }

    // Tạo báo cáo mới
    const issueReport = new IssueReport({
      reportedBy: req.user._id,
      reportType,
      equipment: equipmentId || undefined,
      room: roomId || undefined,
      issueType,
      title,
      description,
      severity,
      images: images,
      priority:
        severity === "critical"
          ? "urgent"
          : severity === "high"
          ? "high"
          : "normal",
    });

    await issueReport.save();

    // Populate để trả về thông tin đầy đủ
    await issueReport.populate([
      { path: "reportedBy", select: "fullName email" },
      { path: "equipment", select: "equipmentName equipmentCode" },
      { path: "room", select: "roomName roomCode" },
    ]);

    // Cập nhật equipment hoặc room với thông tin báo cáo mới
    if (equipmentId) {
      await Equipment.findByIdAndUpdate(equipmentId, {
        $push: {
          reportHistory: {
            reportedBy: req.user._id,
            issueType,
            description,
            severity,
          },
        },
        lastReportedBy: req.user._id,
        lastReportedAt: new Date(),
        $addToSet: {
          currentIssues: description,
        },
      });
    }

    if (roomId) {
      await Room.findByIdAndUpdate(roomId, {
        $push: {
          reportHistory: {
            reportedBy: req.user._id,
            condition:
              severity === "critical"
                ? "poor"
                : severity === "high"
                ? "fair"
                : "good",
            issues: [description],
            description,
            priority:
              severity === "critical"
                ? "urgent"
                : severity === "high"
                ? "high"
                : "medium",
          },
        },
        lastInspectedBy: req.user._id,
        lastInspectedAt: new Date(),
      });
    }

    // Gửi thông báo cho admin
    const admins = await User.find({ role: "admin" }).select("_id");
    if (admins.length > 0) {
      // Gửi thông báo cho từng admin
      for (const admin of admins) {
        await NotificationService.createNotification({
          recipient: admin._id,
          type: "issue_reported",
          title: `Báo cáo vấn đề mới: ${title}`,
          message: `${req.user.fullName} đã báo cáo vấn đề ${issueType} với mức độ ${severity}`,
          sender: req.user._id,
          relatedId: issueReport._id,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: "Đã tạo báo cáo vấn đề thành công",
      data: issueReport,
    });
  } catch (error) {
    console.error("Error creating issue report:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo báo cáo vấn đề",
      error: error.message,
    });
  }
};

// Lấy danh sách báo cáo của trainer
export const getMyIssueReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, severity } = req.query;

    const filter = { reportedBy: req.user._id };
    if (status) filter.status = status;
    if (severity) filter.severity = severity;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reports = await IssueReport.find(filter)
      .populate("equipment", "equipmentName equipmentCode")
      .populate("room", "roomName roomCode")
      .populate("acknowledgedBy", "fullName")
      .populate("resolvedBy", "fullName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await IssueReport.countDocuments(filter);

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          total,
          hasNext: skip + reports.length < total,
          hasPrev: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error getting trainer issue reports:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách báo cáo",
    });
  }
};

// ADMIN FUNCTIONS - Xử lý báo cáo và tạo lịch bảo trì

// Lấy tất cả báo cáo vấn đề (admin)
export const getAllIssueReports = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      severity,
      reportType,
      priority,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (reportType) filter.reportType = reportType;
    if (priority) filter.priority = priority;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const reports = await IssueReport.find(filter)
      .populate("reportedBy", "fullName email phone")
      .populate("equipment", "equipmentName equipmentCode category status")
      .populate("room", "roomName roomCode status")
      .populate("acknowledgedBy", "fullName")
      .populate("assignedTo", "fullName")
      .populate("resolvedBy", "fullName")
      .populate("maintenanceSchedule", "title scheduledDate status")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await IssueReport.countDocuments(filter);

    // Thống kê tổng quan
    const stats = await IssueReport.aggregate([
      {
        $group: {
          _id: null,
          totalReports: { $sum: 1 },
          pendingReports: {
            $sum: {
              $cond: [{ $in: ["$status", ["reported", "acknowledged"]] }, 1, 0],
            },
          },
          criticalReports: {
            $sum: {
              $cond: [{ $eq: ["$severity", "critical"] }, 1, 0],
            },
          },
          resolvedReports: {
            $sum: {
              $cond: [{ $eq: ["$status", "resolved"] }, 1, 0],
            },
          },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          total,
          hasNext: skip + reports.length < total,
          hasPrev: parseInt(page) > 1,
        },
        stats: stats[0] || {
          totalReports: 0,
          pendingReports: 0,
          criticalReports: 0,
          resolvedReports: 0,
        },
      },
    });
  } catch (error) {
    console.error("Error getting all issue reports:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách báo cáo",
    });
  }
};

// Xác nhận đã nhận báo cáo (admin)
export const acknowledgeIssueReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes, priority, assignedTo } = req.body;

    const report = await IssueReport.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy báo cáo",
      });
    }

    // Cập nhật trạng thái
    const updatedReport = await IssueReport.findByIdAndUpdate(
      id,
      {
        status: "acknowledged",
        acknowledgedBy: req.user._id,
        acknowledgedAt: new Date(),
        adminNotes,
        priority: priority || report.priority,
        assignedTo: assignedTo || undefined,
      },
      { new: true }
    ).populate([
      { path: "reportedBy", select: "fullName email" },
      { path: "equipment", select: "equipmentName equipmentCode" },
      { path: "room", select: "roomName roomCode" },
      { path: "acknowledgedBy", select: "fullName" },
    ]);

    // Thông báo cho trainer
    await NotificationService.createNotification({
      recipients: [report.reportedBy],
      type: "issue_acknowledged",
      title: "Báo cáo của bạn đã được xác nhận",
      message: `Admin đã xác nhận báo cáo "${report.title}" và sẽ xử lý sớm`,
      data: {
        issueReportId: report._id,
      },
    });

    res.json({
      success: true,
      message: "Đã xác nhận báo cáo thành công",
      data: updatedReport,
    });
  } catch (error) {
    console.error("Error acknowledging issue report:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xác nhận báo cáo",
    });
  }
};

// Tạo lịch bảo trì từ báo cáo (admin)
export const createMaintenanceFromReport = async (req, res) => {
  console.log("=== CREATE MAINTENANCE FROM REPORT CALLED ===");
  console.log("Report ID:", req.params.reportId);
  console.log("User:", req.user?.username, "Role:", req.user?.role);
  console.log("Request body:", req.body);

  try {
    const { reportId } = req.params;
    const {
      title,
      description,
      scheduledDate,
      estimatedDuration,
      maintenanceType,
      priority,
      estimatedCost,
      technician,
      internalStaff,
    } = req.body;

    console.log("Creating maintenance from report:", {
      reportId,
      body: req.body,
    });

    // Validate required fields
    if (!scheduledDate) {
      console.log("Missing scheduledDate");
      return res.status(400).json({
        success: false,
        message: "Ngày lên lịch không được để trống",
      });
    }

    if (!estimatedDuration || estimatedDuration <= 0) {
      console.log("Invalid estimatedDuration:", estimatedDuration);
      return res.status(400).json({
        success: false,
        message: "Thời lượng dự kiến phải lớn hơn 0",
      });
    }

    // Tìm báo cáo
    const report = await IssueReport.findById(reportId);
    if (!report) {
      console.log("Report not found:", reportId);
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy báo cáo",
      });
    }

    console.log("Found report:", {
      _id: report._id,
      title: report.title,
      reportType: report.reportType,
      equipment: report.equipment,
      room: report.room,
    });

    // Validate scheduled date
    const scheduleDate = new Date(scheduledDate);
    if (isNaN(scheduleDate.getTime())) {
      console.log("Invalid scheduledDate format:", scheduledDate);
      return res.status(400).json({
        success: false,
        message: "Ngày lên lịch không hợp lệ",
      });
    }

    // Ensure estimated cost is a number
    const validEstimatedCost =
      estimatedCost && !isNaN(Number(estimatedCost))
        ? Number(estimatedCost)
        : 0;
    const validEstimatedDuration =
      estimatedDuration && !isNaN(Number(estimatedDuration))
        ? Number(estimatedDuration)
        : 2;

    console.log("Validated data:", {
      scheduleDate,
      validEstimatedDuration,
      validEstimatedCost,
    });

    console.log("Creating maintenance schedule with data:", {
      issueReport: reportId,
      maintenanceType: maintenanceType || "repair",
      targetType: report.reportType,
      equipment: report.equipment || undefined,
      room: report.room || undefined,
      title: title || `Bảo trì: ${report.title}`,
      description: description || report.description,
      scheduledDate: scheduleDate,
      estimatedDuration: validEstimatedDuration,
      createdBy: req.user._id,
      priority: priority || report.severity || "medium",
      estimatedCost: validEstimatedCost,
    });

    // Tạo lịch bảo trì
    const maintenanceSchedule = new MaintenanceSchedule({
      issueReport: reportId,
      maintenanceType: maintenanceType || "repair",
      targetType: report.reportType,
      equipment: report.equipment || undefined,
      room: report.room || undefined,
      title: title || `Bảo trì: ${report.title}`,
      description: description || report.description,
      scheduledDate: scheduleDate,
      estimatedDuration: validEstimatedDuration,
      createdBy: req.user._id,
      priority: priority || report.severity || "medium",
      estimatedCost: validEstimatedCost,
      assignedTo: {
        technician: technician || undefined,
        internalStaff: internalStaff || undefined,
      },
    });

    console.log("About to save maintenance schedule...");

    await maintenanceSchedule.save();
    console.log(
      "Maintenance schedule saved successfully with ID:",
      maintenanceSchedule._id
    );

    // Cập nhật báo cáo
    await IssueReport.findByIdAndUpdate(reportId, {
      status: "in_progress",
      maintenanceSchedule: maintenanceSchedule._id,
      expectedResolutionDate: scheduleDate,
    });

    // Populate thông tin
    await maintenanceSchedule.populate([
      { path: "issueReport", select: "title reportedBy" },
      { path: "equipment", select: "equipmentName equipmentCode" },
      { path: "room", select: "roomName roomCode" },
      { path: "createdBy", select: "fullName" },
    ]);

    // Thông báo cho trainer
    try {
      await NotificationService.createNotification({
        recipients: [report.reportedBy],
        type: "maintenance_scheduled",
        title: "Đã lên lịch bảo trì",
        message: `Lịch bảo trì cho báo cáo "${
          report.title
        }" đã được tạo vào ${new Date(scheduledDate).toLocaleDateString(
          "vi-VN"
        )}`,
        data: {
          maintenanceId: maintenanceSchedule._id,
          scheduledDate,
        },
      });
      console.log("Notification sent successfully");
    } catch (notificationError) {
      console.error("Failed to send notification:", notificationError);
      // Continue execution even if notification fails
    }

    res.status(201).json({
      success: true,
      message: "Đã tạo lịch bảo trì thành công",
      data: maintenanceSchedule,
    });
  } catch (error) {
    console.error("Error creating maintenance schedule:", error);
    console.error("Error stack:", error.stack);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);

    // More specific error messages based on error type
    let errorMessage = "Lỗi server khi tạo lịch bảo trì";

    if (error.name === "ValidationError") {
      console.error("Validation errors:", error.errors);
      errorMessage =
        "Dữ liệu không hợp lệ: " +
        Object.values(error.errors)
          .map((e) => e.message)
          .join(", ");
    } else if (error.name === "CastError") {
      errorMessage = "Định dạng dữ liệu không đúng";
    } else if (error.code === 11000) {
      errorMessage = "Dữ liệu bị trùng lặp";
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
};

// Đánh dấu báo cáo đã được giải quyết (admin)
export const resolveIssueReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionNotes, repairCost, followUpRequired, followUpDate } =
      req.body;

    const report = await IssueReport.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy báo cáo",
      });
    }

    // Cập nhật trạng thái
    const updatedReport = await IssueReport.findByIdAndUpdate(
      id,
      {
        status: "resolved",
        resolvedBy: req.user._id,
        resolvedAt: new Date(),
        resolutionNotes,
        repairCost: repairCost || 0,
        followUpRequired: followUpRequired || false,
        followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      },
      { new: true }
    ).populate([
      { path: "reportedBy", select: "fullName email" },
      { path: "equipment", select: "equipmentName equipmentCode" },
      { path: "room", select: "roomName roomCode" },
      { path: "resolvedBy", select: "fullName" },
    ]);

    // Cập nhật equipment/room status
    if (report.equipment) {
      await Equipment.findByIdAndUpdate(report.equipment, {
        $pull: { currentIssues: report.description },
        condition: "good", // hoặc tùy thuộc vào kết quả sửa chữa
      });
    }

    if (report.room) {
      await Room.findByIdAndUpdate(report.room, {
        currentCondition: "good",
        status: "active",
      });
    }

    // Thông báo cho trainer
    await NotificationService.createNotification({
      recipients: [report.reportedBy],
      type: "issue_resolved",
      title: "Vấn đề đã được giải quyết",
      message: `Vấn đề "${report.title}" đã được giải quyết thành công`,
      data: {
        issueReportId: report._id,
        resolutionNotes,
      },
    });

    res.json({
      success: true,
      message: "Đã đánh dấu báo cáo là đã giải quyết",
      data: updatedReport,
    });
  } catch (error) {
    console.error("Error resolving issue report:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi giải quyết báo cáo",
    });
  }
};

// Lấy chi tiết báo cáo vấn đề theo ID (admin)
export const getIssueReportById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate admin role
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Chỉ admin mới có thể xem chi tiết báo cáo",
      });
    }

    const report = await IssueReport.findById(id)
      .populate("reportedBy", "fullName email role")
      .populate("equipment", "equipmentName equipmentCode category")
      .populate("room", "roomName roomCode location")
      .populate("acknowledgedBy", "fullName email")
      .populate("resolvedBy", "fullName email")
      .populate("assignedTo", "fullName email")
      .populate("maintenanceSchedule");

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy báo cáo",
      });
    }

    res.json({
      success: true,
      message: "Lấy chi tiết báo cáo thành công",
      data: report,
    });
  } catch (error) {
    console.error("Error getting issue report by ID:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy chi tiết báo cáo",
    });
  }
};

// Xóa báo cáo vấn đề (admin only)
export const deleteIssueReport = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra báo cáo có tồn tại không
    const report = await IssueReport.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy báo cáo",
      });
    }

    // Xóa báo cáo
    await IssueReport.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Đã xóa báo cáo thành công",
    });
  } catch (error) {
    console.error("Error deleting issue report:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa báo cáo",
      error: error.message,
    });
  }
};

export default {
  createIssueReport,
  getMyIssueReports,
  getAllIssueReports,
  getIssueReportById,
  acknowledgeIssueReport,
  createMaintenanceFromReport,
  resolveIssueReport,
  deleteIssueReport,
};

import MaintenanceSchedule from "../models/MaintenanceSchedule.js";
import IssueReport from "../models/IssueReport.js";
import Equipment from "../models/Equipment.js";
import Room from "../models/Room.js";
import NotificationService from "../services/NotificationService.js";
import User from "../models/User.js";

// Lấy danh sách lịch bảo trì
export const getAllMaintenanceSchedules = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      maintenanceType,
      targetType,
      dateFrom,
      dateTo,
      sortBy = "scheduledDate",
      sortOrder = "asc",
    } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (maintenanceType) filter.maintenanceType = maintenanceType;
    if (targetType) filter.targetType = targetType;

    // Date range filter
    if (dateFrom || dateTo) {
      filter.scheduledDate = {};
      if (dateFrom) filter.scheduledDate.$gte = new Date(dateFrom);
      if (dateTo) filter.scheduledDate.$lte = new Date(dateTo);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const schedules = await MaintenanceSchedule.find(filter)
      .populate("issueReport", "title reportedBy severity")
      .populate("equipment", "equipmentName equipmentCode category")
      .populate("room", "roomName roomCode")
      .populate("createdBy", "fullName")
      .populate("assignedTo.internalStaff", "fullName phone")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MaintenanceSchedule.countDocuments(filter);

    // Statistics
    const stats = await MaintenanceSchedule.aggregate([
      {
        $group: {
          _id: null,
          totalSchedules: { $sum: 1 },
          scheduledCount: {
            $sum: { $cond: [{ $eq: ["$status", "scheduled"] }, 1, 0] },
          },
          inProgressCount: {
            $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] },
          },
          completedCount: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          urgentCount: {
            $sum: { $cond: [{ $eq: ["$priority", "urgent"] }, 1, 0] },
          },
          totalCost: { $sum: "$actualCost" },
          estimatedCost: { $sum: "$estimatedCost" },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        schedules,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          total,
          hasNext: skip + schedules.length < total,
          hasPrev: parseInt(page) > 1,
        },
        stats: stats[0] || {
          totalSchedules: 0,
          scheduledCount: 0,
          inProgressCount: 0,
          completedCount: 0,
          urgentCount: 0,
          totalCost: 0,
          estimatedCost: 0,
        },
      },
    });
  } catch (error) {
    console.error("Error getting maintenance schedules:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách lịch bảo trì",
    });
  }
};

// Tạo lịch bảo trì mới (không từ báo cáo)
export const createMaintenanceSchedule = async (req, res) => {
  try {
    const {
      maintenanceType,
      targetType,
      equipmentId,
      roomId,
      title,
      description,
      scheduledDate,
      estimatedDuration,
      priority,
      estimatedCost,
      technician,
      internalStaff,
    } = req.body;

    // Validate required fields
    if (targetType === "equipment" && !equipmentId) {
      return res.status(400).json({
        success: false,
        message: "Thiết bị không được để trống",
      });
    }

    if (targetType === "room" && !roomId) {
      return res.status(400).json({
        success: false,
        message: "Phòng tập không được để trống",
      });
    }

    // Check for conflicting schedules
    const conflictingSchedule = await MaintenanceSchedule.findOne({
      $or: [{ equipment: equipmentId }, { room: roomId }],
      scheduledDate: {
        $gte: new Date(scheduledDate),
        $lt: new Date(
          new Date(scheduledDate).getTime() + estimatedDuration * 60 * 60 * 1000
        ),
      },
      status: { $in: ["scheduled", "in_progress"] },
    });

    if (conflictingSchedule) {
      return res.status(400).json({
        success: false,
        message: "Đã có lịch bảo trì khác trong thời gian này",
      });
    }

    const maintenanceSchedule = new MaintenanceSchedule({
      maintenanceType,
      targetType,
      equipment: equipmentId || undefined,
      room: roomId || undefined,
      title,
      description,
      scheduledDate: new Date(scheduledDate),
      estimatedDuration,
      createdBy: req.user._id,
      priority: priority || "medium",
      estimatedCost: estimatedCost || 0,
      assignedTo: {
        technician: technician || undefined,
        internalStaff: internalStaff || undefined,
      },
    });

    await maintenanceSchedule.save();

    // Populate thông tin
    await maintenanceSchedule.populate([
      { path: "equipment", select: "equipmentName equipmentCode" },
      { path: "room", select: "roomName roomCode" },
      { path: "createdBy", select: "fullName" },
      { path: "assignedTo.internalStaff", select: "fullName phone" },
    ]);

    // Update equipment/room status
    if (equipmentId) {
      await Equipment.findByIdAndUpdate(equipmentId, {
        status: "maintenance",
        nextMaintenanceDate: scheduledDate,
      });
    }

    if (roomId) {
      await Room.findByIdAndUpdate(roomId, {
        status: "maintenance",
      });
    }

    // Gửi thông báo cho assigned staff
    if (internalStaff) {
      await NotificationService.createNotification({
        recipients: [internalStaff],
        type: "maintenance_assigned",
        title: "Được phân công bảo trì",
        message: `Bạn được phân công bảo trì: ${title}`,
        data: {
          maintenanceId: maintenanceSchedule._id,
          scheduledDate,
        },
      });
    }

    res.status(201).json({
      success: true,
      message: "Đã tạo lịch bảo trì thành công",
      data: maintenanceSchedule,
    });
  } catch (error) {
    console.error("Error creating maintenance schedule:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo lịch bảo trì",
    });
  }
};

// Cập nhật thông tin lịch bảo trì
export const updateMaintenanceSchedule = async (req, res) => {
  try {
    const { id } = req.params;
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

    console.log("Updating maintenance schedule:", id);
    console.log("Update data:", req.body);

    const maintenance = await MaintenanceSchedule.findById(id);
    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch bảo trì",
      });
    }

    // Chỉ cho phép cập nhật nếu chưa bắt đầu hoặc đang thực hiện
    if (
      maintenance.status === "completed" ||
      maintenance.status === "cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message: "Không thể cập nhật lịch bảo trì đã hoàn thành hoặc đã hủy",
      });
    }

    // Validate scheduled date if provided
    let validScheduledDate = maintenance.scheduledDate;
    if (scheduledDate) {
      validScheduledDate = new Date(scheduledDate);
      if (isNaN(validScheduledDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Ngày lên lịch không hợp lệ",
        });
      }
    }

    // Validate estimated duration if provided
    let validEstimatedDuration = maintenance.estimatedDuration;
    if (estimatedDuration !== undefined) {
      validEstimatedDuration = Number(estimatedDuration);
      if (isNaN(validEstimatedDuration) || validEstimatedDuration <= 0) {
        return res.status(400).json({
          success: false,
          message: "Thời lượng dự kiến phải lớn hơn 0",
        });
      }
    }

    // Validate estimated cost if provided
    let validEstimatedCost = maintenance.estimatedCost;
    if (estimatedCost !== undefined) {
      validEstimatedCost = Number(estimatedCost);
      if (isNaN(validEstimatedCost) || validEstimatedCost < 0) {
        return res.status(400).json({
          success: false,
          message: "Chi phí dự kiến phải lớn hơn hoặc bằng 0",
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (scheduledDate) updateData.scheduledDate = validScheduledDate;
    if (estimatedDuration !== undefined)
      updateData.estimatedDuration = validEstimatedDuration;
    if (maintenanceType) updateData.maintenanceType = maintenanceType;
    if (priority) updateData.priority = priority;
    if (estimatedCost !== undefined)
      updateData.estimatedCost = validEstimatedCost;

    // Update assigned technician info
    if (technician) {
      updateData["assignedTo.technician"] = {
        name: technician.name || maintenance.assignedTo?.technician?.name,
        phone: technician.phone || maintenance.assignedTo?.technician?.phone,
        email: technician.email || maintenance.assignedTo?.technician?.email,
        company:
          technician.company || maintenance.assignedTo?.technician?.company,
      };
    }

    if (internalStaff) {
      updateData["assignedTo.internalStaff"] = internalStaff;
    }

    console.log("Final update data:", updateData);

    const updatedMaintenance = await MaintenanceSchedule.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: "issueReport", select: "title reportedBy" },
      { path: "equipment", select: "equipmentName equipmentCode" },
      { path: "room", select: "roomName roomCode" },
      { path: "createdBy", select: "fullName" },
      { path: "assignedTo.internalStaff", select: "fullName phone" },
    ]);

    // Send notification if schedule date changed
    if (
      scheduledDate &&
      scheduledDate !== maintenance.scheduledDate.toISOString()
    ) {
      try {
        // Notify the reporter if exists
        if (maintenance.issueReport) {
          const issueReport = await IssueReport.findById(
            maintenance.issueReport
          ).populate("reportedBy");
          if (issueReport && issueReport.reportedBy) {
            await NotificationService.createNotification({
              recipients: [issueReport.reportedBy._id],
              type: "maintenance_rescheduled",
              title: "Lịch bảo trì đã được cập nhật",
              message: `Lịch bảo trì "${
                updatedMaintenance.title
              }" đã được đổi sang ${validScheduledDate.toLocaleDateString(
                "vi-VN"
              )}`,
              data: {
                maintenanceId: updatedMaintenance._id,
                oldDate: maintenance.scheduledDate,
                newDate: validScheduledDate,
              },
            });
          }
        }

        // Notify assigned internal staff if exists
        if (updatedMaintenance.assignedTo?.internalStaff) {
          await NotificationService.createNotification({
            recipients: [updatedMaintenance.assignedTo.internalStaff._id],
            type: "maintenance_rescheduled",
            title: "Lịch bảo trì được phân công đã thay đổi",
            message: `Lịch bảo trì "${
              updatedMaintenance.title
            }" đã được đổi sang ${validScheduledDate.toLocaleDateString(
              "vi-VN"
            )}`,
            data: {
              maintenanceId: updatedMaintenance._id,
              oldDate: maintenance.scheduledDate,
              newDate: validScheduledDate,
            },
          });
        }
      } catch (notificationError) {
        console.error("Failed to send notification:", notificationError);
        // Continue execution even if notification fails
      }
    }

    res.json({
      success: true,
      message: "Đã cập nhật lịch bảo trì thành công",
      data: updatedMaintenance,
    });
  } catch (error) {
    console.error("Error updating maintenance schedule:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật lịch bảo trì",
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
};

// Cập nhật trạng thái bảo trì
export const updateMaintenanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      workPerformed,
      partsUsed,
      actualCost,
      qualityRating,
      afterImages,
      completionReport,
    } = req.body;

    const maintenance = await MaintenanceSchedule.findById(id);
    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch bảo trì",
      });
    }

    const updateData = { status };

    // Handle status-specific updates
    if (status === "in_progress") {
      updateData.startedAt = new Date();
    } else if (status === "completed") {
      updateData.completedAt = new Date();
      if (workPerformed) updateData.workPerformed = workPerformed;
      if (partsUsed) updateData.partsUsed = partsUsed;
      if (actualCost !== undefined) updateData.actualCost = actualCost;
      if (qualityRating) updateData.qualityRating = qualityRating;
      if (afterImages) updateData.afterImages = afterImages;
      if (completionReport) updateData.completionReport = completionReport;

      // Update equipment/room status back to active
      if (maintenance.equipment) {
        await Equipment.findByIdAndUpdate(maintenance.equipment, {
          status: "available",
          condition: "good", // or based on completion report
          lastMaintenanceDate: new Date(),
        });
      }

      if (maintenance.room) {
        await Room.findByIdAndUpdate(maintenance.room, {
          status: "active",
          currentCondition: "good",
        });
      }

      // Mark related issue report as resolved
      if (maintenance.issueReport) {
        await IssueReport.findByIdAndUpdate(maintenance.issueReport, {
          status: "resolved",
          resolvedAt: new Date(),
          resolvedBy: req.user._id,
          resolutionNotes: `Đã hoàn thành bảo trì: ${
            workPerformed || "Bảo trì thành công"
          }`,
        });
      }
    }

    const updatedMaintenance = await MaintenanceSchedule.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate([
      { path: "equipment", select: "equipmentName equipmentCode" },
      { path: "room", select: "roomName roomCode" },
      {
        path: "issueReport",
        populate: { path: "reportedBy", select: "fullName" },
      },
    ]);

    // Send notifications
    if (status === "completed") {
      // Notification for issue reporter (if exists)
      if (maintenance.issueReport) {
        const issueReport = await IssueReport.findById(
          maintenance.issueReport
        ).populate("reportedBy", "_id");

        if (issueReport && issueReport.reportedBy) {
          await NotificationService.createNotification({
            recipients: [issueReport.reportedBy._id],
            type: "maintenance_completed",
            title: "Bảo trì đã hoàn thành",
            message: `Bảo trì cho "${maintenance.title}" đã hoàn thành`,
            data: {
              maintenanceId: maintenance._id,
              issueReportId: maintenance.issueReport,
            },
          });
        }
      }
      
      // 🔔 Gửi thông báo cho tất cả trainers và users khi bảo trì hoàn thành
      await sendMaintenanceCompletionNotifications(updatedMaintenance);
    }

    res.json({
      success: true,
      message: `Đã cập nhật trạng thái thành ${status}`,
      data: updatedMaintenance,
    });
  } catch (error) {
    console.error("Error updating maintenance status:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật trạng thái bảo trì",
    });
  }
};

// Lấy lịch bảo trì sắp tới (dashboard)
export const getUpcomingMaintenance = async (req, res) => {
  try {
    const { days = 7 } = req.query;

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(days));

    const upcomingMaintenance = await MaintenanceSchedule.find({
      scheduledDate: {
        $gte: new Date(),
        $lte: endDate,
      },
      status: { $in: ["scheduled", "in_progress"] },
    })
      .populate("equipment", "equipmentName equipmentCode")
      .populate("room", "roomName roomCode")
      .populate("issueReport", "title severity")
      .sort({ scheduledDate: 1 })
      .limit(10);

    res.json({
      success: true,
      data: upcomingMaintenance,
    });
  } catch (error) {
    console.error("Error getting upcoming maintenance:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy lịch bảo trì sắp tới",
    });
  }
};

// Lấy lịch bảo trì quá hạn
export const getOverdueMaintenance = async (req, res) => {
  try {
    const overdueMaintenance = await MaintenanceSchedule.find({
      scheduledDate: { $lt: new Date() },
      status: { $in: ["scheduled", "in_progress"] },
    })
      .populate("equipment", "equipmentName equipmentCode")
      .populate("room", "roomName roomCode")
      .populate("issueReport", "title severity reportedBy")
      .populate("createdBy", "fullName")
      .sort({ scheduledDate: 1 });

    res.json({
      success: true,
      data: overdueMaintenance,
    });
  } catch (error) {
    console.error("Error getting overdue maintenance:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy lịch bảo trì quá hạn",
    });
  }
};

// Lấy báo cáo bảo trì
export const getMaintenanceReport = async (req, res) => {
  try {
    const { period = "month", year, month } = req.query;

    let startDate, endDate;

    if (period === "month") {
      const targetYear = year ? parseInt(year) : new Date().getFullYear();
      const targetMonth = month ? parseInt(month) - 1 : new Date().getMonth();
      startDate = new Date(targetYear, targetMonth, 1);
      endDate = new Date(targetYear, targetMonth + 1, 0);
    } else if (period === "year") {
      const targetYear = year ? parseInt(year) : new Date().getFullYear();
      startDate = new Date(targetYear, 0, 1);
      endDate = new Date(targetYear, 11, 31);
    }

    const report = await MaintenanceSchedule.aggregate([
      {
        $match: {
          scheduledDate: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalMaintenances: { $sum: 1 },
          completedMaintenances: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          totalCost: { $sum: "$actualCost" },
          avgCost: { $avg: "$actualCost" },
          byType: {
            $push: {
              type: "$maintenanceType",
              cost: "$actualCost",
              status: "$status",
            },
          },
          byPriority: {
            $push: {
              priority: "$priority",
              status: "$status",
            },
          },
        },
      },
    ]);

    res.json({
      success: true,
      data: report[0] || {
        totalMaintenances: 0,
        completedMaintenances: 0,
        totalCost: 0,
        avgCost: 0,
        byType: [],
        byPriority: [],
      },
    });
  } catch (error) {
    console.error("Error getting maintenance report:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo báo cáo bảo trì",
    });
  }
};

// Lấy lịch bảo trì cho trainer (chỉ xem)
export const getMaintenanceSchedulesForTrainer = async (req, res) => {
  try {
    const {
      dateFrom,
      dateTo,
      roomId,
      status = "scheduled,in_progress",
    } = req.query;

    // Build filter - chỉ lấy lịch bảo trì đang diễn ra hoặc sắp tới
    const filter = {};

    // Lọc theo trạng thái
    if (status) {
      filter.status = { $in: status.split(",") };
    }

    // Lọc theo phòng nếu có
    if (roomId) {
      filter.room = roomId;
    }

    // Date range filter - mặc định lấy từ hôm nay đến 30 ngày tới
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const defaultEndDate = new Date(today);
    defaultEndDate.setDate(today.getDate() + 30);

    filter.scheduledDate = {
      $gte: dateFrom ? new Date(dateFrom) : today,
      $lte: dateTo ? new Date(dateTo) : defaultEndDate,
    };

    const schedules = await MaintenanceSchedule.find(filter)
      .populate("equipment", "equipmentName equipmentCode category")
      .populate("room", "roomName roomCode")
      .populate("createdBy", "fullName")
      .select(
        "title description scheduledDate estimatedDuration maintenanceType priority status targetType equipment room"
      )
      .sort({ scheduledDate: 1 })
      .limit(50); // Giới hạn số lượng để không quá tải

    res.json({
      success: true,
      data: schedules,
      message: "Lấy lịch bảo trì thành công",
    });
  } catch (error) {
    console.error("Error getting maintenance schedules for trainer:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy lịch bảo trì",
    });
  }
};

// Kiểm tra xung đột bảo trì cho lịch học
export const checkMaintenanceConflicts = async (req, res) => {
  try {
    const { date, roomId, startTime, endTime } = req.query;
    
    if (!date) {
      return res.status(400).json({
        message: "Ngày kiểm tra là bắt buộc"
      });
    }

    // Convert date to start and end of day
    const checkDate = new Date(date);
    const startOfDay = new Date(checkDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(checkDate.setHours(23, 59, 59, 999));

    // Build filter for maintenance schedules
    const filter = {
      scheduledDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $in: ['scheduled', 'in_progress'] } // Only active maintenance
    };

    // If roomId is provided, filter by room
    if (roomId) {
      filter.room = roomId;
    }

    const conflicts = await MaintenanceSchedule.find(filter)
      .populate('room', 'roomName roomCode')
      .populate('equipment', 'equipmentName equipmentCode')
      .select('title maintenanceType scheduledDate estimatedDuration priority status')
      .sort({ scheduledDate: 1 });

    // If specific time range is provided, filter by time overlap
    let filteredConflicts = conflicts;
    if (startTime && endTime && conflicts.length > 0) {
      // For more detailed time checking, you can implement time overlap logic here
      // For now, we'll return all maintenance on that date
      filteredConflicts = conflicts;
    }

    res.status(200).json({
      conflicts: filteredConflicts,
      hasConflicts: filteredConflicts.length > 0,
      date: date,
      message: filteredConflicts.length > 0 
        ? `Có ${filteredConflicts.length} lịch bảo trì trong ngày này`
        : 'Không có xung đột bảo trì'
    });

  } catch (error) {
    console.error('Error checking maintenance conflicts:', error);
    res.status(500).json({
      message: 'Lỗi khi kiểm tra xung đột bảo trì',
      error: error.message
    });
  }
};

// Function gửi thông báo khi bảo trì hoàn thành
const sendMaintenanceCompletionNotifications = async (maintenance) => {
  try {
    const targetName = maintenance.equipment?.equipmentName || maintenance.room?.roomName || 'Thiết bị/Phòng';
    
    // Gửi thông báo cho tất cả trainers
    const trainers = await User.find({ role: 'trainer' });
    for (const trainer of trainers) {
      await NotificationService.createNotification({
        recipients: [trainer._id],
        type: 'maintenance_completed',
        title: '✅ Bảo trì hoàn thành',
        message: `Bảo trì ${maintenance.title} cho ${targetName} đã hoàn thành. Có thể sử dụng bình thường.`,
        data: {
          maintenanceId: maintenance._id,
          targetType: maintenance.targetType,
          equipmentId: maintenance.equipment?._id,
          roomId: maintenance.room?._id
        }
      });
    }
    
    // Gửi thông báo cho users (nếu là room maintenance)
    if (maintenance.targetType === 'room' && maintenance.room) {
      const users = await User.find({ role: 'user' });
      for (const user of users) {
        await NotificationService.createNotification({
          recipients: [user._id],
          type: 'maintenance_completed',
          title: '🎉 Phòng tập đã sẵn sàng',
          message: `Bảo trì phòng ${targetName} đã hoàn thành. Các lớp học có thể diễn ra bình thường.`,
          data: {
            maintenanceId: maintenance._id,
            roomId: maintenance.room._id
          }
        });
      }
    }
    
  } catch (error) {
    console.error('Error sending maintenance completion notifications:', error);
  }
};

export default {
  getAllMaintenanceSchedules,
  createMaintenanceSchedule,
  updateMaintenanceSchedule,
  updateMaintenanceStatus,
  getUpcomingMaintenance,
  getOverdueMaintenance,
  getMaintenanceReport,
  getMaintenanceSchedulesForTrainer,
  checkMaintenanceConflicts,
};

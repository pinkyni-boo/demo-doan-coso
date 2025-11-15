import Attendance from "../models/Attendance.js";
import Class from "../models/Class.js";
import ClassEnrollment from "../models/ClassEnrollment.js";
import User from "../models/User.js";
import mongoose from "mongoose";

export const createSession = async (req, res) => {
  try {
    const {
      classId,
      sessionNumber,
      sessionDate,
      isRescheduled,
      originalDate,
      rescheduleNote,
    } = req.body;

    console.log("Creating session request:", {
      classId,
      sessionNumber,
      sessionDate,
      isRescheduled,
      originalDate,
      rescheduleNote,
    });

    // Validate input
    if (!classId || !sessionNumber || !sessionDate) {
      return res.status(400).json({
        message:
          "Thiếu thông tin bắt buộc: classId, sessionNumber, sessionDate",
      });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ message: "ClassId không hợp lệ" });
    }

    // Kiểm tra lớp học có tồn tại không
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(404).json({ message: "Lớp học không tồn tại" });
    }

    // Kiểm tra nếu lớp đã hoàn thành
    if (classExists.status === "completed") {
      return res.status(400).json({
        message: "Lớp học đã hoàn thành, không thể tạo buổi học mới",
      });
    }

    // Kiểm tra nếu đã đạt số buổi tối đa
    if (sessionNumber > classExists.totalSessions) {
      return res.status(400).json({
        message: `Lớp học chỉ có ${classExists.totalSessions} buổi, không thể tạo buổi ${sessionNumber}`,
      });
    }

    // Kiểm tra session đã tồn tại chưa
    const existingSession = await Attendance.findOne({
      classId: new mongoose.Types.ObjectId(classId),
      sessionNumber,
    });

    if (existingSession) {
      return res.status(400).json({
        message: `Buổi học ${sessionNumber} đã tồn tại`,
      });
    }

    // Lấy danh sách học viên đã đăng ký VÀ ĐÃ THANH TOÁN
    const enrollments = await ClassEnrollment.find({
      class: classId,
      paymentStatus: true, // Chỉ lấy những học viên đã thanh toán
    }).populate("user", "_id username email");

    console.log("Paid enrollments found:", enrollments.length);

    // Kiểm tra nếu không có học viên đã thanh toán
    if (enrollments.length === 0) {
      return res.status(400).json({
        message:
          "Không thể tạo buổi học khi chưa có học viên nào đã thanh toán",
      });
    }

    // Tạo attendance records chỉ cho học viên đã thanh toán
    const attendanceRecords = enrollments.map((enrollment) => ({
      classId: new mongoose.Types.ObjectId(classId),
      userId: new mongoose.Types.ObjectId(enrollment.user._id),
      sessionNumber: parseInt(sessionNumber),
      sessionDate: new Date(sessionDate),
      isPresent: false,
      checkinTime: null,
      notes: rescheduleNote || "",
      isRescheduled: isRescheduled || false,
      originalDate: originalDate ? new Date(originalDate) : null,
    }));

    console.log("Attendance records to create:", attendanceRecords.length);

    try {
      // Sử dụng insertMany với ordered: false để bỏ qua duplicate errors
      const savedRecords = await Attendance.insertMany(attendanceRecords, {
        ordered: false,
      });
      console.log("Saved records:", savedRecords.length);
    } catch (error) {
      // Nếu có lỗi duplicate, kiểm tra xem có record nào được tạo không
      if (error.code === 11000) {
        console.log(
          "Some duplicate records detected, checking existing records..."
        );
        const existingRecords = await Attendance.find({
          classId: new mongoose.Types.ObjectId(classId),
          sessionNumber: parseInt(sessionNumber),
        });

        if (existingRecords.length === 0) {
          throw error; // Nếu không có record nào thì throw error
        }
        console.log(
          "Session already exists with",
          existingRecords.length,
          "records"
        );
      } else {
        throw error;
      }
    }

    // Kiểm tra nếu đây là buổi cuối cùng thì cập nhật status thành completed
    if (sessionNumber === classExists.totalSessions) {
      await Class.findByIdAndUpdate(classId, {
        status: "completed",
        currentSession: sessionNumber,
      });
      console.log("Class marked as completed");
    }

    res.status(201).json({
      message: "Tạo buổi học thành công",
      sessionNumber,
      totalStudents: attendanceRecords.length,
      paidStudentsOnly: true,
      isLastSession: sessionNumber === classExists.totalSessions,
    });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({
      message: "Lỗi server khi tạo buổi học",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Thêm function tạm thời để xóa hết dữ liệu
export const clearAttendanceData = async (req, res) => {
  try {
    await mongoose.connection.db.collection("attendances").drop();
    res.json({ message: "Đã xóa toàn bộ dữ liệu attendance và index cũ" });
  } catch (error) {
    console.error("Error clearing attendance data:", error);
    res.status(500).json({ message: "Lỗi khi xóa dữ liệu" });
  }
};

export const dropOldIndex = async (req, res) => {
  try {
    await mongoose.connection.db
      .collection("attendances")
      .dropIndex("class_1_sessionNumber_1");
    res.json({ message: "Đã xóa index cũ" });
  } catch (error) {
    console.error("Error dropping index:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi xóa index hoặc index không tồn tại" });
  }
};

// Cập nhật session hiện tại của lớp
export const updateClassSession = async (req, res) => {
  try {
    const { classId } = req.params;
    const { currentSession } = req.body;

    await Class.findByIdAndUpdate(classId, { currentSession });

    res.json({ message: "Cập nhật session thành công" });
  } catch (error) {
    console.error("Error updating class session:", error);
    res.status(500).json({ message: "Lỗi server khi cập nhật session" });
  }
};

// Điểm danh học viên
export const markAttendance = async (req, res) => {
  try {
    const { classId, userId, sessionNumber, isPresent, notes } = req.body;

    // Validate userId
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "User ID không hợp lệ" });
    }

    const attendance = await Attendance.findOneAndUpdate(
      { classId, userId, sessionNumber },
      {
        isPresent,
        checkinTime: isPresent ? new Date() : null,
        notes: notes || "",
      },
      { new: true, upsert: true }
    );

    res.json({ message: "Điểm danh thành công", attendance });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ message: "Lỗi server khi điểm danh" });
  }
};

// Lấy danh sách điểm danh của một buổi học
export const getSessionAttendance = async (req, res) => {
  try {
    const { classId, sessionNumber } = req.params;

    console.log("Getting attendance for:", { classId, sessionNumber });

    const attendanceList = await Attendance.find({
      classId,
      sessionNumber: parseInt(sessionNumber),
      notes: { $ne: "Empty session - no members enrolled" }, // Loại bỏ placeholder records
    })
      .populate("userId", "username email")
      .sort({ "userId.username": 1 });

    console.log("Attendance records found:", attendanceList.length);

    res.json(attendanceList);
  } catch (error) {
    console.error("Error fetching session attendance:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách điểm danh" });
  }
};

// Lấy báo cáo điểm danh của lớp
export const getClassReport = async (req, res) => {
  try {
    const { classId } = req.params;

    console.log("Getting class report for:", classId); // Debug

    // Lấy tất cả records điểm danh của lớp
    const attendanceRecords = await Attendance.find({ classId })
      .populate("userId", "username email")
      .sort({ sessionNumber: 1 });

    console.log("Attendance records found:", attendanceRecords.length); // Debug
    console.log("Sample records:", attendanceRecords.slice(0, 2)); // Debug

    // Group by session
    const sessionMap = {};
    attendanceRecords.forEach((record) => {
      const sessionNum = record.sessionNumber;
      if (!sessionMap[sessionNum]) {
        sessionMap[sessionNum] = {
          sessionNumber: sessionNum,
          sessionDate: record.sessionDate,
          totalStudents: 0,
          presentCount: 0,
        };
      }

      // Chỉ đếm nếu có userId thực sự (không phải placeholder)
      if (record.userId && record.notes !== "Empty session placeholder") {
        sessionMap[sessionNum].totalStudents++;
        if (record.isPresent) {
          sessionMap[sessionNum].presentCount++;
        }
      }
    });

    const sessions = Object.values(sessionMap).sort(
      (a, b) => a.sessionNumber - b.sessionNumber
    );

    console.log("Sessions to return:", sessions); // Debug

    res.json({
      sessions,
      totalSessions: sessions.length,
      classId,
    });
  } catch (error) {
    console.error("Error fetching class report:", error);
    res.status(500).json({ message: "Lỗi server khi lấy báo cáo" });
  }
};

// Thêm function mới để lấy danh sách sessions
export const getClassSessions = async (req, res) => {
  try {
    const { classId } = req.params;

    console.log("Getting sessions for class:", classId);

    // Lấy tất cả session numbers cho class này
    const sessions = await Attendance.aggregate([
      { $match: { classId: new mongoose.Types.ObjectId(classId) } },
      {
        $group: {
          _id: "$sessionNumber",
          sessionNumber: { $first: "$sessionNumber" },
          sessionDate: { $first: "$sessionDate" },
          totalStudents: {
            $sum: {
              $cond: [
                { $ne: ["$notes", "Empty session - no members enrolled"] },
                1,
                0,
              ],
            },
          },
          presentCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isPresent", true] },
                    { $ne: ["$notes", "Empty session - no members enrolled"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { sessionNumber: 1 } },
    ]);

    console.log("Aggregated sessions:", sessions);

    const formattedSessions = sessions.map((s) => ({
      sessionNumber: s.sessionNumber,
      sessionDate: s.sessionDate,
      totalStudents: s.totalStudents,
      presentCount: s.presentCount,
    }));

    res.json({
      sessions: formattedSessions,
      totalSessions: sessions.length,
      classId,
    });
  } catch (error) {
    console.error("Error fetching class sessions:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách sessions" });
  }
};

// Thêm function để lấy số lượng học viên đã thanh toán
export const getPaidStudentsCount = async (req, res) => {
  try {
    const { classId } = req.params;

    const paidEnrollments = await ClassEnrollment.countDocuments({
      class: classId,
      paymentStatus: true,
    });

    const totalEnrollments = await ClassEnrollment.countDocuments({
      class: classId,
    });

    res.json({
      paidStudents: paidEnrollments,
      totalStudents: totalEnrollments,
      unpaidStudents: totalEnrollments - paidEnrollments,
    });
  } catch (error) {
    console.error("Error getting paid students count:", error);
    res.status(500).json({ message: "Lỗi khi lấy thống kê học viên" });
  }
};

// ============================================
// ADMIN ATTENDANCE MANAGEMENT FUNCTIONS
// ============================================

/**
 * 1. Lấy danh sách điểm danh với filter
 * Filter theo: ngày, lớp, trainer, học viên, trạng thái
 */
export const getAttendanceList = async (req, res) => {
  try {
    const {
      date,
      classId,
      trainerId,
      userId,
      status, // 'present', 'absent', 'all'
      page = 1,
      limit = 20,
      sortBy = "sessionDate",
      sortOrder = "desc",
    } = req.query;

    console.log("Admin getting attendance list with filters:", req.query);

    // Build filter
    const filter = {};

    // Filter by date
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      filter.sessionDate = { $gte: startDate, $lte: endDate };
    }

    // Filter by class
    if (classId && mongoose.Types.ObjectId.isValid(classId)) {
      filter.classId = new mongoose.Types.ObjectId(classId);
    }

    // Filter by user/student
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      filter.userId = new mongoose.Types.ObjectId(userId);
    }

    // Filter by attendance status
    if (status && status !== "all") {
      filter.isPresent = status === "present";
    }

    // Exclude placeholder records
    filter.notes = { $ne: "Empty session - no members enrolled" };

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get attendance records
    let attendanceQuery = Attendance.find(filter)
      .populate("userId", "fullName email username phone")
      .populate({
        path: "classId",
        select: "className instructorName serviceName location",
        populate: {
          path: "service",
          select: "serviceName",
        },
      })
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // If filtering by trainer, need to filter after populate
    let attendanceRecords = await attendanceQuery;

    if (trainerId) {
      attendanceRecords = attendanceRecords.filter(
        (record) =>
          record.classId &&
          record.classId.instructorName &&
          record.classId.instructorName.includes(trainerId)
      );
    }

    // Count total
    const total = await Attendance.countDocuments(filter);

    // Get statistics
    const stats = await Attendance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          presentCount: {
            $sum: { $cond: ["$isPresent", 1, 0] },
          },
          absentCount: {
            $sum: { $cond: ["$isPresent", 0, 1] },
          },
        },
      },
    ]);

    const statistics =
      stats.length > 0
        ? {
            total: stats[0].totalRecords,
            present: stats[0].presentCount,
            absent: stats[0].absentCount,
            attendanceRate: (
              (stats[0].presentCount / stats[0].totalRecords) *
              100
            ).toFixed(2),
          }
        : { total: 0, present: 0, absent: 0, attendanceRate: 0 };

    res.json({
      success: true,
      data: attendanceRecords,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
      statistics,
    });
  } catch (error) {
    console.error("Error getting attendance list:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách điểm danh",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * 2. Xem thông tin chi tiết từng buổi học
 */
export const getSessionDetail = async (req, res) => {
  try {
    const { classId, sessionNumber } = req.params;

    console.log("Getting session detail:", { classId, sessionNumber });

    // Validate
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({
        success: false,
        message: "Class ID không hợp lệ",
      });
    }

    // Get class info
    const classInfo = await Class.findById(classId)
      .populate("service", "serviceName")
      .select(
        "className instructorName serviceName location schedule totalSessions currentSession"
      );

    if (!classInfo) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lớp học",
      });
    }

    // Get attendance records for this session
    const attendanceRecords = await Attendance.find({
      classId: new mongoose.Types.ObjectId(classId),
      sessionNumber: parseInt(sessionNumber),
      notes: { $ne: "Empty session - no members enrolled" },
    })
      .populate("userId", "fullName email phone username")
      .sort({ "userId.fullName": 1 });

    // Calculate statistics
    const totalStudents = attendanceRecords.length;
    const presentCount = attendanceRecords.filter((r) => r.isPresent).length;
    const absentCount = totalStudents - presentCount;
    const attendanceRate =
      totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(2) : 0;

    // Get trainer info
    const trainerInfo = await User.findOne({
      fullName: classInfo.instructorName,
    }).select("fullName email phone role");

    // Format session date
    const sessionDate =
      attendanceRecords.length > 0 ? attendanceRecords[0].sessionDate : null;

    // Get checkin time (earliest checkin)
    const checkinTimes = attendanceRecords
      .filter((r) => r.checkinTime)
      .map((r) => r.checkinTime)
      .sort((a, b) => a - b);
    const firstCheckinTime = checkinTimes.length > 0 ? checkinTimes[0] : null;

    res.json({
      success: true,
      session: {
        classId,
        className: classInfo.className,
        service: classInfo.service?.serviceName || classInfo.serviceName,
        location: classInfo.location,
        sessionNumber: parseInt(sessionNumber),
        sessionDate,
        totalSessions: classInfo.totalSessions,
        trainer: {
          name: trainerInfo?.fullName || classInfo.instructorName,
          email: trainerInfo?.email,
          phone: trainerInfo?.phone,
          role: trainerInfo?.role,
        },
        statistics: {
          totalStudents,
          presentCount,
          absentCount,
          attendanceRate: parseFloat(attendanceRate),
        },
        checkinInfo: {
          firstCheckinTime,
          totalCheckins: checkinTimes.length,
        },
        students: attendanceRecords.map((record) => ({
          id: record.userId?._id,
          name: record.userId?.fullName,
          email: record.userId?.email,
          phone: record.userId?.phone,
          isPresent: record.isPresent,
          checkinTime: record.checkinTime,
          notes: record.notes,
        })),
      },
    });
  } catch (error) {
    console.error("Error getting session detail:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy chi tiết buổi học",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * 3. Xem & lọc theo học viên (Student attendance report)
 */
export const getStudentAttendanceReport = async (req, res) => {
  try {
    const { userId } = req.params;
    const { classId, startDate, endDate } = req.query;

    console.log("Getting student attendance report:", {
      userId,
      classId,
      startDate,
      endDate,
    });

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "User ID không hợp lệ",
      });
    }

    // Get student info
    const student = await User.findById(userId).select(
      "fullName email phone username"
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy học viên",
      });
    }

    // Build filter
    const filter = {
      userId: new mongoose.Types.ObjectId(userId),
      notes: { $ne: "Empty session - no members enrolled" },
    };

    // Filter by class
    if (classId && mongoose.Types.ObjectId.isValid(classId)) {
      filter.classId = new mongoose.Types.ObjectId(classId);
    }

    // Filter by date range
    if (startDate || endDate) {
      filter.sessionDate = {};
      if (startDate) {
        filter.sessionDate.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.sessionDate.$lte = new Date(endDate);
      }
    }

    // Get attendance records
    const attendanceRecords = await Attendance.find(filter)
      .populate({
        path: "classId",
        select: "className instructorName serviceName totalSessions",
      })
      .sort({ sessionDate: -1 });

    // Calculate statistics
    const totalSessions = attendanceRecords.length;
    const presentCount = attendanceRecords.filter((r) => r.isPresent).length;
    const absentCount = totalSessions - presentCount;
    const attendanceRate =
      totalSessions > 0 ? ((presentCount / totalSessions) * 100).toFixed(2) : 0;

    // Group by class
    const classSummary = {};
    attendanceRecords.forEach((record) => {
      if (record.classId) {
        const classId = record.classId._id.toString();
        if (!classSummary[classId]) {
          classSummary[classId] = {
            classId,
            className: record.classId.className,
            instructorName: record.classId.instructorName,
            totalSessions: 0,
            presentCount: 0,
            absentCount: 0,
          };
        }
        classSummary[classId].totalSessions++;
        if (record.isPresent) {
          classSummary[classId].presentCount++;
        } else {
          classSummary[classId].absentCount++;
        }
      }
    });

    // Calculate attendance rate for each class
    Object.values(classSummary).forEach((cls) => {
      cls.attendanceRate =
        cls.totalSessions > 0
          ? ((cls.presentCount / cls.totalSessions) * 100).toFixed(2)
          : 0;
    });

    // Warning if absent count is high (more than 20% or 3 sessions)
    const absentWarning = absentCount > Math.max(totalSessions * 0.2, 3);

    res.json({
      success: true,
      student: {
        id: student._id,
        name: student.fullName,
        email: student.email,
        phone: student.phone,
      },
      summary: {
        totalSessions,
        presentCount,
        absentCount,
        attendanceRate: parseFloat(attendanceRate),
        warning: absentWarning
          ? `Học viên đã vắng ${absentCount} buổi (${(
              (absentCount / totalSessions) *
              100
            ).toFixed(1)}%)`
          : null,
      },
      classSummary: Object.values(classSummary),
      attendanceHistory: attendanceRecords.map((record) => ({
        date: record.sessionDate,
        className: record.classId?.className,
        sessionNumber: record.sessionNumber,
        isPresent: record.isPresent,
        checkinTime: record.checkinTime,
        notes: record.notes,
      })),
    });
  } catch (error) {
    console.error("Error getting student attendance report:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy báo cáo điểm danh học viên",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * 4. Xem & lọc theo trainer
 */
export const getTrainerAttendanceReport = async (req, res) => {
  try {
    const { trainerName } = req.params;
    const { startDate, endDate, classId } = req.query;

    console.log("Getting trainer attendance report:", {
      trainerName,
      startDate,
      endDate,
      classId,
    });

    // Get trainer info
    const trainer = await User.findOne({
      $or: [{ fullName: trainerName }, { username: trainerName }],
    }).select("fullName email phone username role");

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy trainer",
      });
    }

    // Build filter for classes taught by this trainer
    const classFilter = {
      instructorName: trainer.fullName,
    };

    if (classId && mongoose.Types.ObjectId.isValid(classId)) {
      classFilter._id = new mongoose.Types.ObjectId(classId);
    }

    // Get all classes taught by trainer
    const trainerClasses = await Class.find(classFilter).select(
      "className serviceName location totalSessions currentSession status startDate endDate"
    );

    if (trainerClasses.length === 0) {
      return res.json({
        success: true,
        trainer: {
          name: trainer.fullName,
          email: trainer.email,
          phone: trainer.phone,
        },
        summary: {
          totalClasses: 0,
          totalSessionsHeld: 0,
          totalStudentsPresent: 0,
          missingSessions: [],
        },
        classes: [],
      });
    }

    const classIds = trainerClasses.map((c) => c._id);

    // Build attendance filter
    const attendanceFilter = {
      classId: { $in: classIds },
      notes: { $ne: "Empty session - no members enrolled" },
    };

    // Filter by date range
    if (startDate || endDate) {
      attendanceFilter.sessionDate = {};
      if (startDate) {
        attendanceFilter.sessionDate.$gte = new Date(startDate);
      }
      if (endDate) {
        attendanceFilter.sessionDate.$lte = new Date(endDate);
      }
    }

    // Get attendance records
    const attendanceRecords = await Attendance.find(attendanceFilter)
      .populate("classId", "className")
      .sort({ sessionDate: -1 });

    // Group by class and session
    const classSessionMap = {};
    attendanceRecords.forEach((record) => {
      if (record.classId) {
        const classId = record.classId._id.toString();
        if (!classSessionMap[classId]) {
          classSessionMap[classId] = {};
        }
        if (!classSessionMap[classId][record.sessionNumber]) {
          classSessionMap[classId][record.sessionNumber] = {
            sessionNumber: record.sessionNumber,
            sessionDate: record.sessionDate,
            totalStudents: 0,
            presentCount: 0,
            absentCount: 0,
          };
        }
        classSessionMap[classId][record.sessionNumber].totalStudents++;
        if (record.isPresent) {
          classSessionMap[classId][record.sessionNumber].presentCount++;
        } else {
          classSessionMap[classId][record.sessionNumber].absentCount++;
        }
      }
    });

    // Check for missing sessions
    const missingSessions = [];
    trainerClasses.forEach((classItem) => {
      const classId = classItem._id.toString();
      const currentSession = classItem.currentSession || 0;
      const heldSessions = classSessionMap[classId]
        ? Object.keys(classSessionMap[classId]).length
        : 0;

      if (currentSession > heldSessions) {
        missingSessions.push({
          classId,
          className: classItem.className,
          expectedSessions: currentSession,
          heldSessions,
          missingSessions: currentSession - heldSessions,
        });
      }
    });

    // Calculate total statistics
    let totalSessionsHeld = 0;
    let totalStudentsPresent = 0;
    const classDetails = trainerClasses.map((classItem) => {
      const classId = classItem._id.toString();
      const sessions = classSessionMap[classId] || {};
      const sessionCount = Object.keys(sessions).length;
      totalSessionsHeld += sessionCount;

      let classPresentCount = 0;
      Object.values(sessions).forEach((session) => {
        classPresentCount += session.presentCount;
        totalStudentsPresent += session.presentCount;
      });

      return {
        classId: classItem._id,
        className: classItem.className,
        service: classItem.serviceName,
        location: classItem.location,
        totalSessions: classItem.totalSessions,
        currentSession: classItem.currentSession,
        sessionsHeld: sessionCount,
        status: classItem.status,
        totalStudentsPresent: classPresentCount,
        sessions: Object.values(sessions).sort(
          (a, b) => b.sessionNumber - a.sessionNumber
        ),
      };
    });

    res.json({
      success: true,
      trainer: {
        name: trainer.fullName,
        email: trainer.email,
        phone: trainer.phone,
        role: trainer.role,
      },
      summary: {
        totalClasses: trainerClasses.length,
        totalSessionsHeld,
        totalStudentsPresent,
        missingSessions: missingSessions.length > 0 ? missingSessions : null,
      },
      classes: classDetails,
    });
  } catch (error) {
    console.error("Error getting trainer attendance report:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy báo cáo điểm danh trainer",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get all students with attendance summary (for admin dropdown/filter)
 */
export const getAllStudentsWithAttendance = async (req, res) => {
  try {
    // Get all users who have attendance records
    const studentsWithAttendance = await Attendance.aggregate([
      {
        $match: {
          notes: { $ne: "Empty session - no members enrolled" },
        },
      },
      {
        $group: {
          _id: "$userId",
          totalSessions: { $sum: 1 },
          presentCount: {
            $sum: { $cond: ["$isPresent", 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: "$user._id",
          fullName: "$user.fullName",
          email: "$user.email",
          phone: "$user.phone",
          totalSessions: 1,
          presentCount: 1,
          absentCount: { $subtract: ["$totalSessions", "$presentCount"] },
          attendanceRate: {
            $multiply: [{ $divide: ["$presentCount", "$totalSessions"] }, 100],
          },
        },
      },
      {
        $sort: { fullName: 1 },
      },
    ]);

    res.json({
      success: true,
      students: studentsWithAttendance,
    });
  } catch (error) {
    console.error("Error getting students with attendance:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách học viên",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get all trainers with classes summary (for admin dropdown/filter)
 */
export const getAllTrainersWithClasses = async (req, res) => {
  try {
    const trainers = await User.find({
      $or: [{ role: "trainer" }, { role: "admin" }],
    }).select("fullName email phone role");

    const trainersWithStats = await Promise.all(
      trainers.map(async (trainer) => {
        const classCount = await Class.countDocuments({
          instructorName: trainer.fullName,
        });

        return {
          _id: trainer._id,
          fullName: trainer.fullName,
          email: trainer.email,
          phone: trainer.phone,
          role: trainer.role,
          classCount,
        };
      })
    );

    res.json({
      success: true,
      trainers: trainersWithStats.filter((t) => t.classCount > 0),
    });
  } catch (error) {
    console.error("Error getting trainers with classes:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách trainer",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get attendance history for a specific user in a specific class
 */
export const getUserClassAttendance = async (req, res) => {
  try {
    const { classId, userId } = req.params;

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(classId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "ID không hợp lệ",
      });
    }

    // Check authorization: user can only see their own attendance, or admin/trainer
    const requesterId = req.user.id || req.user._id;
    if (
      requesterId.toString() !== userId &&
      req.user.role !== "admin" &&
      req.user.role !== "trainer"
    ) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xem thông tin này",
      });
    }

    // Get attendance records
    const attendanceRecords = await Attendance.find({
      classId: new mongoose.Types.ObjectId(classId),
      userId: new mongoose.Types.ObjectId(userId),
    }).sort({ sessionNumber: 1 });

    res.json(attendanceRecords);
  } catch (error) {
    console.error("Error getting user class attendance:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy lịch sử điểm danh",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

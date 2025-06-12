import Attendance from "../models/Attendance.js";
import Class from "../models/Class.js";
import ClassEnrollment from "../models/ClassEnrollment.js";
import User from "../models/User.js";
import mongoose from "mongoose";

export const createSession = async (req, res) => {
  try {
    const { classId, sessionNumber, sessionDate } = req.body;

    console.log("Creating session request:", {
      classId,
      sessionNumber,
      sessionDate,
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
      notes: "",
    }));

    console.log("Attendance records to create:", attendanceRecords.length);

    // Lưu tất cả records
    const savedRecords = await Attendance.insertMany(attendanceRecords);
    console.log("Saved records:", savedRecords.length);

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

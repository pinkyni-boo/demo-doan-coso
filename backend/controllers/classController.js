import Class from "../models/Class.js";
import ClassEnrollment from "../models/ClassEnrollment.js";
import Attendance from "../models/Attendance.js";
import Service from "../models/Service.js";
import User from "../models/User.js";
import ScheduleChangeRequest from "../models/ScheduleChangeRequest.js";
import mongoose from "mongoose";

// Hàm helper để update status tự động
const updateClassStatus = (classItem) => {
  const now = new Date();
  const startDate = new Date(classItem.startDate);
  const endDate = new Date(classItem.endDate);

  if (classItem.status === "cancelled") {
    return classItem.status;
  }

  if (now < startDate) {
    return "upcoming";
  } else if (
    now >= startDate &&
    now <= endDate &&
    classItem.currentSession < classItem.totalSessions
  ) {
    return "ongoing";
  } else if (
    now > endDate ||
    classItem.currentSession >= classItem.totalSessions
  ) {
    return "completed";
  }

  return "upcoming";
};

// Lấy tất cả lớp học với status được update
export const getAllClasses = async (req, res) => {
  try {
    const { status, service, instructor, available } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (service) filter.serviceName = service;
    if (instructor)
      filter.instructorName = { $regex: instructor, $options: "i" };
    if (available === "true") {
      filter.$expr = { $lt: ["$currentMembers", "$maxMembers"] };
    }

    const classes = await Class.find(filter)
      .populate("service", "name image")
      .sort({ startDate: 1 });

    // Update status cho tất cả classes
    const updatedClasses = await Promise.all(
      classes.map(async (classItem) => {
        const newStatus = updateClassStatus(classItem);

        if (classItem.status !== newStatus) {
          classItem.status = newStatus;
          await classItem.save();
        }

        return classItem;
      })
    );

    res.status(200).json(updatedClasses);
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách lớp học",
      error: error.message,
    });
  }
};

// Tạo lớp học mới
export const createClass = async (req, res) => {
  try {
    const {
      className,
      serviceId,
      serviceName,
      instructorName,
      description,
      maxMembers,
      totalSessions,
      price,
      startDate,
      endDate,
      schedule,
      location,
      requirements,
    } = req.body;

    // Validate service exists
    if (serviceId) {
      const service = await Service.findById(serviceId);
      if (!service) {
        return res.status(404).json({ message: "Dịch vụ không tồn tại" });
      }
    }

    const newClass = new Class({
      className,
      service: serviceId, // Sử dụng service thay vì serviceId
      serviceName,
      instructorName,
      description,
      maxMembers,
      totalSessions,
      price,
      startDate,
      endDate,
      schedule,
      location,
      requirements,
    });

    await newClass.save();

    if (serviceId) {
      await newClass.populate("service", "name image");
    }

    res.status(201).json(newClass);
  } catch (error) {
    console.error("Error creating class:", error);
    res.status(500).json({
      message: "Lỗi khi tạo lớp học",
      error: error.message,
    });
  }
};

// Cập nhật lớp học
// Helper function để tính toán các ngày học dựa trên schedule
const calculateSessionDates = (startDate, endDate, schedule, totalSessions) => {
  const sessionDates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Lấy các ngày trong tuần có lớp (từ schedule)
  const classDays = schedule.map((s) => s.dayOfWeek).sort((a, b) => a - b);

  if (classDays.length === 0) {
    return sessionDates;
  }

  let currentDate = new Date(start);
  let sessionCount = 0;

  // Tìm ngày đầu tiên có lớp
  while (currentDate <= end && !classDays.includes(currentDate.getDay())) {
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Tạo danh sách các ngày học
  while (currentDate <= end && sessionCount < totalSessions) {
    const dayOfWeek = currentDate.getDay();

    if (classDays.includes(dayOfWeek)) {
      // Tìm thông tin schedule cho ngày này
      const scheduleInfo = schedule.find((s) => s.dayOfWeek === dayOfWeek);

      sessionDates.push({
        date: new Date(currentDate),
        sessionNumber: sessionCount + 1,
        dayOfWeek: dayOfWeek,
        startTime: scheduleInfo?.startTime || "00:00",
        endTime: scheduleInfo?.endTime || "00:00",
      });
      sessionCount++;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return sessionDates;
};

// Helper function để cập nhật attendance records sau khi update class
const updateAttendanceRecords = async (classId, oldClass, newClass) => {
  try {
    // Kiểm tra xem có thay đổi schedule, startDate, hoặc endDate không
    const scheduleChanged =
      JSON.stringify(oldClass.schedule) !== JSON.stringify(newClass.schedule);
    const dateChanged =
      oldClass.startDate.getTime() !== newClass.startDate.getTime() ||
      oldClass.endDate.getTime() !== newClass.endDate.getTime();
    const totalSessionsChanged =
      oldClass.totalSessions !== newClass.totalSessions;

    if (!scheduleChanged && !dateChanged && !totalSessionsChanged) {
      console.log(
        "No schedule/date changes detected, skipping attendance update"
      );
      return;
    }

    console.log("Schedule or date changed, recalculating session dates...");

    // Tính toán lại các ngày học
    const newSessionDates = calculateSessionDates(
      newClass.startDate,
      newClass.endDate,
      newClass.schedule,
      newClass.totalSessions
    );

    console.log(`Calculated ${newSessionDates.length} new session dates`);

    // Lấy danh sách học viên đã thanh toán
    const enrollments = await ClassEnrollment.find({
      class: classId,
      paymentStatus: true,
    }).select("user");

    if (enrollments.length === 0) {
      console.log("No paid students, skipping attendance record update");
      return;
    }

    // Lấy các attendance records hiện có
    const existingAttendance = await Attendance.find({
      classId: new mongoose.Types.ObjectId(classId),
    });

    // Tạo map để kiểm tra session nào đã có attendance
    const attendanceMap = new Map();
    existingAttendance.forEach((att) => {
      const key = `${att.sessionNumber}-${att.userId}`;
      attendanceMap.set(key, att);
    });

    // Cập nhật hoặc tạo mới attendance records
    const bulkOps = [];

    for (const sessionDate of newSessionDates) {
      for (const enrollment of enrollments) {
        const key = `${sessionDate.sessionNumber}-${enrollment.user}`;
        const existingRecord = attendanceMap.get(key);

        if (existingRecord) {
          // Cập nhật ngày cho record đã tồn tại (chỉ nếu chưa điểm danh)
          if (!existingRecord.isPresent) {
            bulkOps.push({
              updateOne: {
                filter: { _id: existingRecord._id },
                update: {
                  sessionDate: sessionDate.date,
                  notes: `Updated: Schedule changed on ${new Date().toISOString()}`,
                },
              },
            });
          }
        } else {
          // Tạo record mới cho session mới
          bulkOps.push({
            insertOne: {
              document: {
                classId: new mongoose.Types.ObjectId(classId),
                userId: new mongoose.Types.ObjectId(enrollment.user),
                sessionNumber: sessionDate.sessionNumber,
                sessionDate: sessionDate.date,
                isPresent: false,
                checkinTime: null,
              },
            },
          });
        }
      }
    }

    // Thực hiện bulk operations
    if (bulkOps.length > 0) {
      await Attendance.bulkWrite(bulkOps, { ordered: false });
      console.log(
        `Processed ${bulkOps.length} attendance record updates/inserts`
      );
    }

    // Xóa các session cũ nếu giảm totalSessions (chỉ xóa những session chưa điểm danh)
    if (
      totalSessionsChanged &&
      newClass.totalSessions < oldClass.totalSessions
    ) {
      const deleteResult = await Attendance.deleteMany({
        classId: new mongoose.Types.ObjectId(classId),
        sessionNumber: { $gt: newClass.totalSessions },
        isPresent: false, // Chỉ xóa session chưa điểm danh
      });
      console.log(
        `Deleted ${deleteResult.deletedCount} old attendance records`
      );
    }
  } catch (error) {
    console.error("Error updating attendance records:", error);
    // Không throw error để không làm fail việc update class
  }
};

export const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Nếu có serviceId trong updateData, chuyển thành service
    if (updateData.serviceId) {
      updateData.service = updateData.serviceId;
      delete updateData.serviceId;
    }

    // Lấy thông tin lớp học cũ để so sánh
    const oldClass = await Class.findById(id);
    if (!oldClass) {
      return res.status(404).json({ message: "Không tìm thấy lớp học" });
    }

    const updatedClass = await Class.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("service", "name image");

    // Cập nhật attendance records nếu có thay đổi schedule/date
    await updateAttendanceRecords(id, oldClass, updatedClass);

    res.status(200).json(updatedClass);
  } catch (error) {
    console.error("Error updating class:", error);
    res.status(500).json({
      message: "Lỗi khi cập nhật lớp học",
      error: error.message,
    });
  }
};

// Xóa lớp học
export const deleteClass = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    // Kiểm tra xem có học viên đã đăng ký chưa
    const enrollmentCount = await ClassEnrollment.countDocuments({ class: id });
    if (enrollmentCount > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Không thể xóa lớp học đã có học viên đăng ký",
      });
    }

    // Xóa lớp học
    const deletedClass = await Class.findByIdAndDelete(id).session(session);
    if (!deletedClass) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Không tìm thấy lớp học" });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Xóa lớp học thành công" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error deleting class:", error);
    res.status(500).json({
      message: "Lỗi khi xóa lớp học",
      error: error.message,
    });
  }
};

// Lấy chi tiết một lớp học
export const getClassById = async (req, res) => {
  try {
    const { id } = req.params;

    const classItem = await Class.findById(id).populate(
      "service",
      "name image description"
    );

    if (!classItem) {
      return res.status(404).json({ message: "Không tìm thấy lớp học" });
    }

    // Update status
    const newStatus = updateClassStatus(classItem);
    if (classItem.status !== newStatus) {
      classItem.status = newStatus;
      await classItem.save();
    }

    res.status(200).json(classItem);
  } catch (error) {
    console.error("Error fetching class details:", error);
    res.status(500).json({
      message: "Lỗi khi lấy thông tin lớp học",
      error: error.message,
    });
  }
};

// Lấy chi tiết lớp học với thống kê
export const getClassDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const classItem = await Class.findById(id)
      .populate("service", "name image description benefits")
      .lean();

    if (!classItem) {
      return res.status(404).json({ message: "Không tìm thấy lớp học" });
    }

    // Update status
    const newStatus = updateClassStatus(classItem);
    if (classItem.status !== newStatus) {
      await Class.findByIdAndUpdate(id, { status: newStatus });
      classItem.status = newStatus;
    }

    // Lấy thông tin enrollment statistics
    const enrollmentStats = await ClassEnrollment.aggregate([
      { $match: { class: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: null,
          totalEnrollments: { $sum: 1 },
          paidEnrollments: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", true] }, 1, 0] },
          },
          pendingPayments: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", false] }, 1, 0] },
          },
        },
      },
    ]);

    const stats = enrollmentStats[0] || {
      totalEnrollments: 0,
      paidEnrollments: 0,
      pendingPayments: 0,
    };

    // Lấy danh sách học viên gần đây
    const recentEnrollments = await ClassEnrollment.find({ class: id })
      .populate("user", "username email")
      .sort({ enrollmentDate: -1 })
      .limit(5);

    res.json({
      ...classItem,
      enrollmentStats: stats,
      recentEnrollments,
    });
  } catch (error) {
    console.error("Error fetching class details:", error);
    res.status(500).json({
      message: "Lỗi khi lấy chi tiết lớp học",
      error: error.message,
    });
  }
};

// Đăng ký lớp học
export const enrollClass = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { classId } = req.body;
    // Sửa lại để handle cả userId và id
    const userId = req.user.userId || req.user.id;

    console.log("User from middleware:", req.user);
    console.log("Enrolling user:", userId, "to class:", classId);

    // Validate userId
    if (!userId) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(401)
        .json({ message: "Không tìm thấy thông tin người dùng" });
    }

    // Kiểm tra lớp học tồn tại
    const classDoc = await Class.findById(classId).session(session);
    if (!classDoc) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Lớp học không tồn tại" });
    }

    // Kiểm tra còn chỗ trống
    if (classDoc.currentMembers >= classDoc.maxMembers) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Lớp học đã đầy" });
    }

    // Kiểm tra user đã đăng ký chưa
    const existingEnrollment = await ClassEnrollment.findOne({
      user: userId,
      class: classId,
    }).session(session);

    if (existingEnrollment) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "Bạn đã đăng ký lớp học này rồi" });
    }

    // Tạo đăng ký mới
    const enrollment = new ClassEnrollment({
      user: userId,
      class: classId,
      remainingSessions: classDoc.totalSessions,
    });

    await enrollment.save({ session });

    // Cập nhật số lượng thành viên trong lớp
    await Class.findByIdAndUpdate(
      classId,
      { $inc: { currentMembers: 1 } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Đăng ký lớp học thành công",
      enrollment,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error enrolling class:", error);
    res.status(500).json({
      message: "Lỗi khi đăng ký lớp học",
      error: error.message,
    });
  }
};

// Lấy danh sách học viên của lớp
export const getClassMembers = async (req, res) => {
  try {
    const { classId } = req.params;

    const enrollments = await ClassEnrollment.find({ class: classId })
      .populate("user", "username email phone")
      .populate("class", "className")
      .sort({ enrollmentDate: -1 });

    res.status(200).json(enrollments);
  } catch (error) {
    console.error("Error fetching class members:", error);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách học viên",
      error: error.message,
    });
  }
};

// Cập nhật trạng thái thanh toán của enrollment
export const updateEnrollmentPayment = async (req, res) => {
  try {
    const { classId, userId, paymentStatus } = req.body;

    console.log("Updating payment status:", { classId, userId, paymentStatus });

    const enrollment = await ClassEnrollment.findOneAndUpdate(
      {
        class: classId,
        user: userId,
      },
      {
        paymentStatus: paymentStatus,
      },
      {
        new: true,
      }
    )
      .populate("user", "username email")
      .populate("class", "className");

    if (!enrollment) {
      return res.status(404).json({
        message: "Không tìm thấy enrollment",
      });
    }

    console.log("Payment status updated:", enrollment);

    res.status(200).json({
      message: "Cập nhật trạng thái thanh toán thành công",
      enrollment,
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({
      message: "Lỗi khi cập nhật trạng thái thanh toán",
      error: error.message,
    });
  }
};

// Lấy lớp học của user với status update
export const getUserClasses = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    // Xác định userId thực tế cần query
    let targetUserId = userId;

    // Nếu userId trong params khớp với user hiện tại (bao gồm admin), luôn query theo ID đó
    if (userId === req.user._id.toString()) {
      targetUserId = userId;
    } else if (req.user.role === "admin") {
      // Admin có thể xem lớp học của bất kỳ user nào
      targetUserId = userId;
    } else {
      // User thường chỉ có thể xem lớp của mình
      targetUserId = req.user._id.toString();
    }

    const filter = { user: targetUserId };
    if (status) filter.status = status;

    const enrollments = await ClassEnrollment.find(filter)
      .populate({
        path: "class",
        select:
          "className serviceName instructorName description maxMembers currentMembers totalSessions currentSession price startDate endDate schedule status location requirements", // Explicitly include schedule
        populate: {
          path: "service",
          select: "name image",
        },
      })
      .sort({ enrollmentDate: -1 });

    // Update status cho tất cả classes
    const updatedEnrollments = await Promise.all(
      enrollments.map(async (enrollment) => {
        if (enrollment.class) {
          const newStatus = updateClassStatus(enrollment.class);

          if (enrollment.class.status !== newStatus) {
            enrollment.class.status = newStatus;
            await enrollment.class.save();
          }
        }

        return enrollment;
      })
    );

    res.status(200).json(updatedEnrollments);
  } catch (error) {
    console.error("Error fetching user classes:", error);
    res.status(500).json({
      message: "Lỗi khi lấy lớp học của user",
      error: error.message,
    });
  }
};

// Xóa đăng ký lớp học - cũng cần sửa tương tự
export const deleteEnrollment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { enrollmentId } = req.params;
    // Sửa lại để handle cả userId và id
    const userId = req.user.userId || req.user.id;

    console.log("User from middleware:", req.user);
    console.log("Deleting enrollment:", enrollmentId, "by user:", userId);

    // Validate userId
    if (!userId) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(401)
        .json({ message: "Không tìm thấy thông tin người dùng" });
    }

    // Tìm enrollment
    const enrollment = await ClassEnrollment.findById(enrollmentId).session(
      session
    );
    if (!enrollment) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Không tìm thấy đăng ký" });
    }

    // Kiểm tra quyền (chỉ user tạo hoặc admin mới được xóa)
    const isAdmin = req.user.role === "admin" || req.user.isAdmin;
    if (enrollment.user.toString() !== userId && !isAdmin) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(403)
        .json({ message: "Không có quyền xóa đăng ký này" });
    }

    // Kiểm tra trạng thái lớp học
    const classDoc = await Class.findById(enrollment.class).session(session);
    if (classDoc && classDoc.status === "ongoing") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Không thể hủy đăng ký khi lớp học đang diễn ra",
      });
    }

    // Xóa đăng ký
    await ClassEnrollment.findByIdAndDelete(enrollmentId).session(session);

    // Giảm số lượng thành viên trong lớp
    if (classDoc) {
      await Class.findByIdAndUpdate(
        enrollment.class,
        { $inc: { currentMembers: -1 } },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Hủy đăng ký thành công" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error deleting enrollment:", error);
    res.status(500).json({
      message: "Lỗi khi hủy đăng ký",
      error: error.message,
    });
  }
};

// Lấy danh sách lớp học - chỉ admin
export const getClasses = async (req, res) => {
  try {
    let classes = await Class.find().sort({ createdAt: -1 });

    // Cập nhật thông tin currentMembers chỉ tính học viên đã thanh toán
    const classesWithMembers = await Promise.all(
      classes.map(async (classItem) => {
        const paidMembersCount = await ClassEnrollment.countDocuments({
          class: classItem._id,
          paymentStatus: true, // Chỉ đếm học viên đã thanh toán
        });

        // Cập nhật trạng thái lớp học
        const updatedClass = updateClassStatus(classItem.toObject());
        updatedClass.currentMembers = paidMembersCount;

        return updatedClass;
      })
    );

    res.json(classesWithMembers);
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách lớp học" });
  }
};

// Lấy thông tin thay đổi lịch cho các lớp học của user
export const getUserScheduleChanges = async (req, res) => {
  try {
    const userId = req.user.id;
    const { dateFrom, dateTo } = req.query;

    // Lấy danh sách các lớp học mà user đã đăng ký
    const enrollments = await ClassEnrollment.find({
      user: userId,
      paymentStatus: true, // Chỉ lấy các lớp đã thanh toán
    }).select('class');

    const classIds = enrollments.map(e => e.class);

    // Lấy các yêu cầu thay đổi lịch đã được duyệt cho các lớp này
    const filter = {
      class: { $in: classIds },
      status: 'approved',
    };

    // Thêm filter theo ngày nếu có
    if (dateFrom || dateTo) {
      filter.$or = [];
      if (dateFrom && dateTo) {
        filter.$or.push({
          originalDate: {
            $gte: new Date(dateFrom),
            $lte: new Date(dateTo),
          }
        });
        filter.$or.push({
          'makeupSchedule.date': {
            $gte: new Date(dateFrom),
            $lte: new Date(dateTo),
          }
        });
      } else if (dateFrom) {
        filter.$or.push({
          originalDate: { $gte: new Date(dateFrom) }
        });
        filter.$or.push({
          'makeupSchedule.date': { $gte: new Date(dateFrom) }
        });
      } else if (dateTo) {
        filter.$or.push({
          originalDate: { $lte: new Date(dateTo) }
        });
        filter.$or.push({
          'makeupSchedule.date': { $lte: new Date(dateTo) }
        });
      }
    }

    const scheduleChanges = await ScheduleChangeRequest.find(filter)
      .populate('class', 'className location service')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: scheduleChanges,
    });
  } catch (error) {
    console.error('Error fetching user schedule changes:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin thay đổi lịch',
    });
  }
};

// Get schedule changes for a specific class
export const getClassScheduleChanges = async (req, res) => {
  try {
    const { classId } = req.params;

    // Lấy các yêu cầu thay đổi lịch đã được duyệt cho lớp này
    const scheduleChanges = await ScheduleChangeRequest.find({
      class: classId,
      status: 'approved',
    })
      .populate('class', 'className location service')
      .sort({ originalDate: 1 });

    res.json({
      success: true,
      data: scheduleChanges,
    });
  } catch (error) {
    console.error('Error fetching class schedule changes:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin thay đổi lịch',
    });
  }
};

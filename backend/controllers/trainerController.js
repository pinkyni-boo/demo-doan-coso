import Trainer from "../models/Trainer.js";
import Class from "../models/Class.js";
import User from "../models/User.js";
import ClassEnrollment from "../models/ClassEnrollment.js";
import Attendance from "../models/Attendance.js";
import ScheduleChangeRequest from "../models/ScheduleChangeRequest.js";
import NotificationService from "../services/NotificationService.js";
import mongoose from "mongoose";

// Lấy danh sách lớp học được gán cho trainer
export const getAssignedClasses = async (req, res) => {
  try {
    const userId = req.user.id;

    // Tìm thông tin trainer dựa trên userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin người dùng",
      });
    }

    // Tìm các lớp học có instructorName trùng với fullName của user (bao gồm admin)
    const classes = await Class.find({
      instructorName: user.fullName,
    }).populate("service", "serviceName");

    res.json({
      success: true,
      classes: classes.map((classItem) => ({
        _id: classItem._id,
        className: classItem.className,
        instructorName: classItem.instructorName,
        service: classItem.service?.serviceName || classItem.serviceName,
        schedule: formatScheduleDisplay(classItem.schedule),
        rawSchedule: classItem.schedule, // Add raw schedule for conflict checking
        location: classItem.location,
        maxStudents: classItem.maxMembers,
        enrolledStudents: classItem.currentMembers || 0,
        currentSession: classItem.currentSession || 1,
        totalSessions: classItem.totalSessions || 12,
        startDate: classItem.startDate,
        endDate: classItem.endDate,
        status: classItem.status || "ongoing",
        description: classItem.description,
      })),
      message:
        user.role === "admin"
          ? `Admin ${user.fullName} - Lớp học được gán: ${classes.length}`
          : `Trainer ${user.fullName} - Lớp học được gán: ${classes.length}`,
    });
  } catch (error) {
    console.error("Error fetching assigned classes:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách lớp học",
    });
  }
};

// Helper function để format schedule display
const formatScheduleDisplay = (schedule) => {
  if (!schedule || schedule.length === 0) return "Chưa xác định";

  const dayMap = {
    0: "CN",
    1: "T2",
    2: "T3",
    3: "T4",
    4: "T5",
    5: "T6",
    6: "T7",
  };

  const days = schedule.map((s) => dayMap[s.dayOfWeek]).join(",");
  const timeRange =
    schedule.length > 0
      ? `${schedule[0].startTime}-${schedule[0].endTime}`
      : "";

  return `${days} - ${timeRange}`;
};

// Lấy chi tiết lớp học cho trainer
export const getClassDetail = async (req, res) => {
  try {
    const { classId } = req.params;
    const userId = req.user.id;

    console.log("=== GET CLASS DETAIL ===");
    console.log("Class ID:", classId);
    console.log("User ID:", userId);

    // Validate classId format
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({
        success: false,
        message: "ID lớp học không hợp lệ",
      });
    }

    // Tìm thông tin user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin người dùng",
      });
    }

    console.log("User found:", user.fullName, "Role:", user.role);

    let classItem;

    // Nếu là admin, cho phép xem bất kỳ lớp học nào
    if (user.role === "admin") {
      classItem = await Class.findById(classId).populate(
        "service",
        "serviceName"
      );
      console.log(
        "Admin access - Class found:",
        classItem ? classItem.className : "Not found"
      );
    } else {
      // Trainer thông thường chỉ xem lớp của mình
      classItem = await Class.findOne({
        _id: classId,
        instructorName: user.fullName,
      }).populate("service", "serviceName");
      console.log(
        "Trainer access - Class found:",
        classItem ? classItem.className : "Not found"
      );
    }

    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lớp học hoặc bạn không có quyền truy cập",
      });
    }

    // Lấy danh sách học viên đã đăng ký (nếu có)
    const enrollments = await ClassEnrollment.find({
      class: classItem._id,
    }).populate("user", "fullName email phone");

    console.log("Enrollments found:", enrollments.length);

    res.json({
      success: true,
      class: {
        _id: classItem._id,
        className: classItem.className,
        service: classItem.service?.serviceName || classItem.serviceName,
        description: classItem.description,
        schedule: formatScheduleDisplay(classItem.schedule),
        location: classItem.location,
        maxStudents: classItem.maxMembers,
        currentStudents: classItem.currentMembers || 0,
        currentSession: classItem.currentSession || 1,
        totalSessions: classItem.totalSessions || 12,
        startDate: classItem.startDate,
        endDate: classItem.endDate,
        price: classItem.price,
        status: classItem.status,
        students:
          enrollments?.map((enrollment) => ({
            id: enrollment.user?._id,
            name: enrollment.user?.fullName || "N/A",
            email: enrollment.user?.email || "N/A",
            phone: enrollment.user?.phone || "N/A",
            paymentStatus: enrollment.paymentStatus,
            joinDate: enrollment.createdAt,
            attendanceRate: 85, // Tạm thời hardcode
            totalAttended: Math.floor(
              Math.random() * (classItem.currentSession || 1)
            ),
            totalSessions: classItem.currentSession || 1,
          })) || [],
      },
    });
  } catch (error) {
    console.error("Error fetching class detail:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy chi tiết lớp học",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Lấy danh sách HLV
export const getAllTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find()
      .populate("specialty", "name")
      .populate("userId", "isAccountLocked lockReason");
    res.json(trainers);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách HLV." });
  }
};

// Tạo HLV mới
export const createTrainer = async (req, res) => {
  try {
    const { fullName, email, phone, gender, specialty, experience } = req.body;
    console.log("Dữ liệu tạo HLV:", {
      fullName,
      email,
      phone,
      gender,
      specialty,
      experience,
    });

    if (
      !fullName ||
      !email ||
      !phone ||
      !gender ||
      !specialty ||
      experience === undefined
    ) {
      return res
        .status(400)
        .json({ error: "Vui lòng nhập đầy đủ thông tin HLV." });
    }

    // Kiểm tra email và phone có trùng không trong bảng Trainer
    const existingTrainer = await Trainer.findOne({
      $or: [{ email: email }, { phone: phone }],
    });

    if (existingTrainer) {
      if (existingTrainer.email === email) {
        return res.status(400).json({
          error: `Email ${email} đã được sử dụng bởi huấn luyện viên khác.`,
        });
      }
      if (existingTrainer.phone === phone) {
        return res.status(400).json({
          error: `Số điện thoại ${phone} đã được sử dụng bởi huấn luyện viên khác.`,
        });
      }
    }

    // Kiểm tra email và phone có trùng không trong bảng User
    const existingUser = await User.findOne({
      $or: [{ email: email }, { phone: phone }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({
          error: `Email ${email} đã được sử dụng bởi tài khoản khác trong hệ thống.`,
        });
      }
      if (existingUser.phone === phone) {
        return res.status(400).json({
          error: `Số điện thoại ${phone} đã được sử dụng bởi tài khoản khác trong hệ thống.`,
        });
      }
    }

    // Tạo trainer sau khi đã kiểm tra trùng lặp
    const trainer = await Trainer.create(req.body);
    console.log("Tạo trainer thành công:", trainer._id);

    // Tự động tạo tài khoản người dùng cho HLV
    try {
      // Tạo username từ email (bỏ @domain) và kiểm tra unique
      let username = email.split("@")[0] + "_trainer";
      const existingUsername = await User.findOne({ username: username });
      if (existingUsername) {
        username = email.split("@")[0] + "_trainer_" + Date.now();
      }

      // Mật khẩu mặc định (nên thay đổi sau lần đăng nhập đầu)
      const defaultPassword = "Trainer123!";

      const newUser = new User({
        username: username,
        email: email,
        fullName: fullName,
        phone: phone,
        gender: gender,
        password: defaultPassword,
        role: "trainer",
        address: "",
      });

      await newUser.save();
      console.log("Tạo user thành công:", newUser._id);

      // Cập nhật trainer với userId
      const updatedTrainer = await Trainer.findByIdAndUpdate(
        trainer._id,
        { userId: newUser._id },
        { new: true }
      );
      console.log("Cập nhật trainer với userId:", updatedTrainer.userId);

      res.status(201).json({
        trainer: updatedTrainer,
        message: `Tạo HLV thành công. Tài khoản đăng nhập: ${username}, mật khẩu mặc định: ${defaultPassword}`,
      });
    } catch (userError) {
      // Nếu tạo user thất bại, vẫn giữ trainer nhưng thông báo chi tiết lỗi
      console.error("Lỗi tạo tài khoản user:", userError);
      let errorMessage =
        "Tạo HLV thành công nhưng không thể tạo tài khoản đăng nhập. ";

      if (userError.code === 11000) {
        if (userError.keyPattern?.username) {
          errorMessage += "Username đã tồn tại.";
        } else {
          errorMessage += "Dữ liệu bị trùng lặp.";
        }
      } else if (userError.name === "ValidationError") {
        errorMessage +=
          "Dữ liệu không hợp lệ: " +
          Object.values(userError.errors)
            .map((e) => e.message)
            .join(", ");
      } else {
        errorMessage += "Lỗi hệ thống.";
      }

      res.status(201).json({
        trainer,
        warning: errorMessage,
      });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Cập nhật HLV
export const updateTrainer = async (req, res) => {
  try {
    const { status, terminatedReason, email, newPassword } = req.body;
    if (status === "terminated" && !terminatedReason) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập lý do nghỉ việc." });
    }

    const isLocked = status === "terminated";

    // Cập nhật thông tin trainer
    const trainerData = {
      ...req.body,
      terminatedReason: status === "terminated" ? terminatedReason : undefined,
      isLocked,
    };

    // Xóa newPassword khỏi dữ liệu trainer vì nó không thuộc schema trainer
    delete trainerData.newPassword;

    const updated = await Trainer.findByIdAndUpdate(
      req.params.id,
      trainerData,
      { new: true }
    );

    // Nếu có mật khẩu mới, cập nhật trong User
    if (newPassword && newPassword.trim() !== "") {
      console.log("Cập nhật mật khẩu cho trainer:", updated.userId);
      try {
        // Tìm user và cập nhật password để trigger pre-save hook
        const user = await User.findById(updated.userId);
        if (user) {
          console.log("Tìm thấy user, đang cập nhật mật khẩu...");
          user.password = newPassword; // Pre-save hook sẽ hash password
          await user.save();
          console.log("Cập nhật mật khẩu thành công");

          res.json({
            ...updated.toObject(),
            message: "Cập nhật HLV và mật khẩu thành công!",
          });
        } else {
          console.log("Không tìm thấy user với ID:", updated.userId);
          res.json({
            ...updated.toObject(),
            warning:
              "Cập nhật HLV thành công nhưng không tìm thấy tài khoản người dùng để đổi mật khẩu.",
          });
        }
      } catch (userError) {
        console.error("Lỗi cập nhật mật khẩu:", userError);
        res.json({
          ...updated.toObject(),
          warning:
            "Cập nhật HLV thành công nhưng không thể cập nhật mật khẩu: " +
            userError.message,
        });
      }
    } else {
      res.json(updated);
    }
  } catch (err) {
    res.status(400).json({ error: "Lỗi khi cập nhật HLV." });
  }
};

// Cập nhật trạng thái HLV
export const updateTrainerStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    if (status === "terminated" && !reason) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập lý do nghỉ việc." });
    }

    const updateData = {
      status,
      terminatedReason: status === "terminated" ? reason : undefined,
      isLocked: status === "terminated",
    };

    const trainer = await Trainer.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    if (!trainer)
      return res.status(404).json({ message: "Trainer không tồn tại." });

    // Nếu chuyển sang trạng thái nghỉ việc, khóa tài khoản User
    if (status === "terminated" && trainer.userId) {
      try {
        await User.findByIdAndUpdate(trainer.userId, {
          isAccountLocked: true,
          lockReason: `Huấn luyện viên nghỉ việc: ${reason}`,
          lockUntil: null, // Khóa vĩnh viễn cho đến khi admin mở
        });
        console.log(
          `Đã khóa tài khoản User ${trainer.userId} do HLV nghỉ việc`
        );
      } catch (userError) {
        console.error("Lỗi khóa tài khoản User:", userError);
      }
    }

    // Nếu chuyển về trạng thái active, mở khóa tài khoản
    if (status === "active" && trainer.userId) {
      try {
        await User.findByIdAndUpdate(trainer.userId, {
          isAccountLocked: false,
          lockReason: null,
          lockUntil: null,
        });
        console.log(
          `Đã mở khóa tài khoản User ${trainer.userId} do HLV quay lại làm việc`
        );
      } catch (userError) {
        console.error("Lỗi mở khóa tài khoản User:", userError);
      }
    }

    res.json(trainer);
  } catch (err) {
    res.status(400).json({ error: "Lỗi khi cập nhật trạng thái HLV." });
  }
};

// Xóa HLV
export const deleteTrainer = async (req, res) => {
  try {
    await Trainer.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa HLV thành công." });
  } catch (err) {
    res.status(400).json({ error: "Lỗi khi xóa HLV." });
  }
};

// Schedule Change Request Controllers

// Tạo yêu cầu thay đổi lịch
export const createScheduleChangeRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      classId,
      originalDate,
      requestedDate,
      startTime,
      endTime,
      reason,
      urgency,
    } = req.body;

    console.log("Received request data:", {
      classId,
      originalDate,
      requestedDate,
      startTime,
      endTime,
      reason,
      urgency,
      userId,
    });

    // Kiểm tra dữ liệu đầu vào
    if (
      !classId ||
      !originalDate ||
      !requestedDate ||
      !startTime ||
      !endTime ||
      !reason
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Vui lòng cung cấp đầy đủ thông tin: classId, originalDate, requestedDate, startTime, endTime, reason",
      });
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({
        success: false,
        message: "Định dạng thời gian không hợp lệ. Vui lòng sử dụng HH:mm",
      });
    }

    // Validate endTime > startTime
    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: "Giờ kết thúc phải sau giờ bắt đầu",
      });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({
        success: false,
        message: "ID lớp học không hợp lệ",
      });
    }

    // Tìm thông tin user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin người dùng",
      });
    }

    // Kiểm tra lớp học có thuộc về trainer này không
    const classItem = await Class.findOne({
      _id: classId,
      instructorName: user.fullName,
    });

    if (!classItem) {
      return res.status(404).json({
        success: false,
        message:
          "Không tìm thấy lớp học hoặc bạn không có quyền thay đổi lịch của lớp này",
      });
    }

    // Kiểm tra không được yêu cầu thay đổi sang ngày trong quá khứ
    const requestedDateObj = new Date(requestedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (requestedDateObj < today) {
      return res.status(400).json({
        success: false,
        message: "Không thể yêu cầu thay đổi lịch sang ngày trong quá khứ",
      });
    }

    // Kiểm tra ngày bù có nằm trong khoảng thời gian lớp học không
    const classStartDate = new Date(classItem.startDate);
    const classEndDate = new Date(classItem.endDate);

    if (requestedDateObj < classStartDate || requestedDateObj > classEndDate) {
      return res.status(400).json({
        success: false,
        message: `Ngày dạy bù phải trong khoảng thời gian lớp học (${classStartDate.toLocaleDateString(
          "vi-VN"
        )} - ${classEndDate.toLocaleDateString("vi-VN")})`,
      });
    }

    // Kiểm tra không có yêu cầu pending cho cùng lớp và ngày
    const existingRequest = await ScheduleChangeRequest.findOne({
      trainer: userId,
      class: classId,
      originalDate: new Date(originalDate),
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "Đã có yêu cầu thay đổi lịch đang chờ xử lý cho ngày này",
      });
    }

    // Tạo yêu cầu thay đổi lịch
    const scheduleChangeRequest = new ScheduleChangeRequest({
      trainer: userId,
      class: classId,
      originalDate: new Date(originalDate),
      requestedDate: new Date(requestedDate),
      reason: reason.trim(),
      urgency: urgency || "medium",
      makeupSchedule: {
        date: new Date(requestedDate),
        startTime: startTime,
        endTime: endTime,
        location: classItem.location || "Phòng tập chính",
      },
    });

    console.log("Creating schedule change request:", scheduleChangeRequest);
    await scheduleChangeRequest.save();
    console.log("Schedule change request saved successfully");

    // Populate thông tin để trả về
    await scheduleChangeRequest.populate([
      { path: "class", select: "className serviceName" },
      { path: "trainer", select: "fullName email" },
    ]);

    // Gửi thông báo cho admin
    try {
      const trainer = await User.findById(userId);
      await NotificationService.notifyAdminNewScheduleRequest(
        scheduleChangeRequest,
        trainer
      );
    } catch (notificationError) {
      console.error("Error sending notification to admin:", notificationError);
      // Không làm gián đoạn flow chính nếu thông báo lỗi
    }

    res.status(201).json({
      success: true,
      message: "Yêu cầu thay đổi lịch đã được gửi thành công",
      request: scheduleChangeRequest,
    });
  } catch (error) {
    console.error("Error creating schedule change request:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo yêu cầu thay đổi lịch",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Lấy danh sách yêu cầu thay đổi lịch của trainer
export const getScheduleChangeRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    // Tạo filter
    const filter = { trainer: userId };
    if (status && status !== "all") {
      filter.status = status;
    }

    // Tính toán pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Lấy danh sách yêu cầu
    const requests = await ScheduleChangeRequest.find(filter)
      .populate("class", "className serviceName location")
      .populate("approvedBy", "fullName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Đếm tổng số yêu cầu
    const total = await ScheduleChangeRequest.countDocuments(filter);

    // Thống kê theo status
    const stats = await ScheduleChangeRequest.aggregate([
      { $match: { trainer: new mongoose.Types.ObjectId(userId) } },
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

// Lấy lịch điểm danh đầy đủ của lớp (tính toán tất cả các buổi học)
export const getClassFullSchedule = async (req, res) => {
  try {
    const { classId } = req.params;
    const userId = req.user.id;

    console.log("=== GET CLASS FULL SCHEDULE ===");
    console.log("Class ID:", classId);
    console.log("User ID:", userId);

    // Validate classId
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({
        success: false,
        message: "ID lớp học không hợp lệ",
      });
    }

    // Tìm thông tin user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin người dùng",
      });
    }

    // Tìm lớp học
    let classItem;
    if (user.role === "admin") {
      classItem = await Class.findById(classId);
    } else {
      classItem = await Class.findOne({
        _id: classId,
        instructorName: user.fullName,
      });
    }

    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lớp học hoặc bạn không có quyền truy cập",
      });
    }

    // Lấy thông tin schedule changes đã được duyệt
    const scheduleChanges = await ScheduleChangeRequest.find({
      class: classId,
      status: "approved",
    });

    console.log("Schedule changes found:", scheduleChanges.length);
    scheduleChanges.forEach((change, idx) => {
      console.log(`Change ${idx + 1}:`, {
        originalDate: change.originalDate,
        makeupDate: change.makeupSchedule?.date,
        status: change.status,
      });
    });

    // Tính toán tất cả các ngày học dựa trên schedule
    let sessionDates = calculateSessionDates(
      classItem.startDate,
      classItem.endDate,
      classItem.schedule,
      classItem.totalSessions
    );

    // Áp dụng schedule changes vào sessionDates
    if (scheduleChanges.length > 0) {
      scheduleChanges.forEach((change) => {
        if (change.makeupSchedule && change.makeupSchedule.date) {
          const originalDate = new Date(change.originalDate);
          const makeupDate = new Date(change.makeupSchedule.date);

          // Tìm session có ngày gốc
          const sessionIndex = sessionDates.findIndex(
            (session) =>
              new Date(session.date).toDateString() ===
              originalDate.toDateString()
          );

          if (sessionIndex !== -1) {
            console.log(
              `Applying schedule change for session ${
                sessionDates[sessionIndex].sessionNumber
              }: ${originalDate.toDateString()} -> ${makeupDate.toDateString()}`
            );

            // Thay thế ngày gốc bằng ngày dạy bù
            sessionDates[sessionIndex] = {
              ...sessionDates[sessionIndex],
              date: makeupDate,
              originalDate: originalDate,
              isRescheduled: true,
              startTime:
                change.makeupSchedule.startTime ||
                sessionDates[sessionIndex].startTime,
              endTime:
                change.makeupSchedule.endTime ||
                sessionDates[sessionIndex].endTime,
            };
          }
        }
      });
    }

    // Lấy thông tin attendance đã tạo
    const attendanceRecords = await Attendance.find({
      classId: new mongoose.Types.ObjectId(classId),
    })
      .populate("userId", "fullName email")
      .sort({ sessionNumber: 1, userId: 1 });

    // Tạo map để tra cứu nhanh attendance
    const attendanceMap = new Map();
    attendanceRecords.forEach((record) => {
      const key = `${record.sessionNumber}`;
      if (!attendanceMap.has(key)) {
        attendanceMap.set(key, []);
      }
      attendanceMap.get(key).push(record);
    });

    // Format response với đầy đủ thông tin
    const fullSchedule = sessionDates.map((session) => {
      const attendanceList =
        attendanceMap.get(String(session.sessionNumber)) || [];
      const presentCount = attendanceList.filter((a) => a.isPresent).length;
      const totalStudents = attendanceList.filter(
        (a) => a.notes !== "Empty session - no members enrolled"
      ).length;

      // Logic hiển thị ngày: nếu có dạy bù thì dùng makeupDate, không thì dùng originalDate
      const hasReschedule = session.isRescheduled && session.originalDate;

      return {
        sessionNumber: session.sessionNumber,
        // Nếu có rescheduled, date là makeupDate, originalDate là ngày gốc
        // Nếu không, date là originalDate, makeupDate null
        originalDate: hasReschedule ? session.originalDate : session.date,
        makeupDate: hasReschedule ? session.date : null,
        isRescheduled: session.isRescheduled || false,
        dayOfWeek: session.dayOfWeek,
        startTime: session.startTime,
        endTime: session.endTime,
        hasAttendanceRecord: attendanceList.length > 0,
        totalStudents: totalStudents,
        presentCount: presentCount,
        absentCount: totalStudents - presentCount,
        attendanceRate:
          totalStudents > 0
            ? Math.round((presentCount / totalStudents) * 100)
            : 0,
        status:
          attendanceList.length === 0
            ? "not_created"
            : presentCount > 0
            ? "completed"
            : "pending",
      };
    });

    res.json({
      success: true,
      classInfo: {
        _id: classItem._id,
        className: classItem.className,
        instructorName: classItem.instructorName,
        totalSessions: classItem.totalSessions,
        currentSession: classItem.currentSession,
        startDate: classItem.startDate,
        endDate: classItem.endDate,
        schedule: classItem.schedule,
        status: classItem.status,
      },
      fullSchedule: fullSchedule,
      summary: {
        totalSessions: sessionDates.length,
        sessionsCreated: Array.from(attendanceMap.keys()).length,
        sessionsNotCreated:
          sessionDates.length - Array.from(attendanceMap.keys()).length,
      },
    });
  } catch (error) {
    console.error("Error fetching class full schedule:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy lịch học đầy đủ",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Helper function để tính toán các ngày học (dùng chung với classController)
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

/**
 * Kiểm tra trùng lịch dạy của HLV
 * GET /api/trainers/check-schedule-conflict
 */
export const checkTrainerScheduleConflict = async (req, res) => {
  try {
    const { trainerId, schedule, startDate, endDate, excludeClassId } =
      req.query;

    if (!trainerId || !schedule || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin: trainerId, schedule, startDate, endDate",
      });
    }

    // Parse schedule từ frontend
    // Format: [{dayOfWeek: 1, startTime: "14:00", endTime: "15:00"}]
    let scheduleArray;
    try {
      scheduleArray = JSON.parse(schedule);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Định dạng schedule không hợp lệ",
      });
    }

    // Tìm tất cả lớp học của trainer này (dùng instructorName)
    const query = {
      instructorName: trainerId,
      status: { $in: ["upcoming", "ongoing"] },
    };

    // Loại trừ lớp đang edit (nếu có)
    if (excludeClassId && mongoose.Types.ObjectId.isValid(excludeClassId)) {
      query._id = { $ne: excludeClassId };
    }

    const trainerClasses = await Class.find(query);

    console.log(`🔍 Checking schedule conflict for trainer: ${trainerId}`);
    console.log(`📅 New schedule:`, scheduleArray);
    console.log(`📚 Found ${trainerClasses.length} existing classes`);

    // Helper function: Chuyển time string thành phút
    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    };

    // Helper function: Kiểm tra 2 khoảng thời gian có overlap không
    const isTimeOverlap = (start1, end1, start2, end2) => {
      const start1Min = timeToMinutes(start1);
      const end1Min = timeToMinutes(end1);
      const start2Min = timeToMinutes(start2);
      const end2Min = timeToMinutes(end2);

      return start1Min < end2Min && end1Min > start2Min;
    };

    // Kiểm tra từng slot thời gian mới
    const conflicts = [];

    for (const newSlot of scheduleArray) {
      const newDayOfWeek = parseInt(newSlot.dayOfWeek);
      const newStartTime = newSlot.startTime;
      const newEndTime = newSlot.endTime;

      // Kiểm tra với từng lớp học hiện tại
      for (const existingClass of trainerClasses) {
        if (!existingClass.schedule || existingClass.schedule.length === 0) {
          continue;
        }

        // Kiểm tra từng slot của lớp hiện tại
        for (const existingSlot of existingClass.schedule) {
          const existingDayOfWeek = parseInt(existingSlot.dayOfWeek);

          // Chỉ kiểm tra nếu cùng ngày trong tuần
          if (existingDayOfWeek !== newDayOfWeek) {
            continue;
          }

          const existingStartTime = existingSlot.startTime;
          const existingEndTime = existingSlot.endTime;

          // Kiểm tra overlap thời gian
          if (
            isTimeOverlap(
              newStartTime,
              newEndTime,
              existingStartTime,
              existingEndTime
            )
          ) {
            const dayNames = [
              "Chủ nhật",
              "Thứ 2",
              "Thứ 3",
              "Thứ 4",
              "Thứ 5",
              "Thứ 6",
              "Thứ 7",
            ];

            conflicts.push({
              conflictClass: {
                _id: existingClass._id,
                className: existingClass.className,
                serviceName: existingClass.serviceName,
              },
              conflictSlot: {
                dayOfWeek: existingDayOfWeek,
                dayName: dayNames[existingDayOfWeek],
                startTime: existingStartTime,
                endTime: existingEndTime,
              },
              newSlot: {
                dayOfWeek: newDayOfWeek,
                dayName: dayNames[newDayOfWeek],
                startTime: newStartTime,
                endTime: newEndTime,
              },
              overlapDescription: `${dayNames[newDayOfWeek]}: ${newStartTime}-${newEndTime} trùng với ${existingStartTime}-${existingEndTime}`,
            });

            console.log(`❌ Conflict found:`, conflicts[conflicts.length - 1]);
          }
        }
      }
    }

    if (conflicts.length > 0) {
      return res.status(200).json({
        success: false,
        hasConflict: true,
        message: `Huấn luyện viên đã có ${conflicts.length} lịch dạy trùng`,
        conflicts: conflicts,
        details: conflicts
          .map(
            (c) =>
              `Trùng với lớp "${c.conflictClass.className}" vào ${c.overlapDescription}`
          )
          .join("\n"),
      });
    }

    return res.status(200).json({
      success: true,
      hasConflict: false,
      message: "Không có xung đột lịch dạy",
    });
  } catch (error) {
    console.error("❌ Error checking trainer schedule conflict:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi kiểm tra lịch dạy",
      error: error.message,
    });
  }
};

/**
 * Kiểm tra trùng lịch dạy bù của HLV
 * GET /api/trainers/check-makeup-schedule-conflict
 */
export const checkMakeupScheduleConflict = async (req, res) => {
  try {
    const { trainerId, requestedDate, startTime, endTime } = req.query;

    if (!trainerId || !requestedDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message:
          "Thiếu thông tin: trainerId, requestedDate, startTime, endTime",
      });
    }

    const userId = req.user.id;

    // Parse requested date
    const makeupDate = new Date(requestedDate);
    const dayOfWeek = makeupDate.getDay(); // 0 = CN, 1 = T2, ...

    console.log(
      `🔍 Checking makeup schedule conflict for trainer: ${trainerId}`
    );
    console.log(
      `📅 Requested date: ${makeupDate.toDateString()}, Day: ${dayOfWeek}`
    );
    console.log(`🕒 Requested time: ${startTime} - ${endTime}`);

    // 1. Tìm tất cả lớp học thường của trainer này
    const trainerClasses = await Class.find({
      instructorName: trainerId,
      status: { $in: ["upcoming", "ongoing"] },
      startDate: { $lte: makeupDate },
      endDate: { $gte: makeupDate },
    });

    console.log(`📚 Found ${trainerClasses.length} active classes for trainer`);
    if (trainerClasses.length > 0) {
      console.log(
        `📚 Classes:`,
        trainerClasses.map((c) => ({
          id: c._id,
          name: c.className,
          schedule: c.schedule,
          startDate: c.startDate,
          endDate: c.endDate,
        }))
      );
    }

    const conflicts = [];
    const dayNames = [
      "Chủ nhật",
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
    ];

    // Helper: Chuyển time string thành phút
    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    };

    // Helper: Kiểm tra time overlap
    const isTimeOverlap = (start1, end1, start2, end2) => {
      const start1Min = timeToMinutes(start1);
      const end1Min = timeToMinutes(end1);
      const start2Min = timeToMinutes(start2);
      const end2Min = timeToMinutes(end2);
      return start1Min < end2Min && end1Min > start2Min;
    };

    const requestedStartMin = timeToMinutes(startTime);
    const requestedEndMin = timeToMinutes(endTime);

    // 2. Kiểm tra trùng với lịch học thường
    for (const classItem of trainerClasses) {
      if (!classItem.schedule || classItem.schedule.length === 0) {
        continue;
      }

      console.log(`\n📖 Checking class: ${classItem.className}`);

      // Kiểm tra xem ngày makeup có trùng với schedule của lớp không
      for (const slot of classItem.schedule) {
        // Parse dayOfWeek từ string "Thứ 2" -> 1, "Chủ nhật" -> 0
        let scheduleDayOfWeek;
        if (typeof slot.dayOfWeek === "number") {
          scheduleDayOfWeek = slot.dayOfWeek;
        } else if (typeof slot.dayOfWeek === "string") {
          const dayMap = {
            "Chủ nhật": 0,
            "Thứ 2": 1,
            "Thứ 3": 2,
            "Thứ 4": 3,
            "Thứ 5": 4,
            "Thứ 6": 5,
            "Thứ 7": 6,
          };
          scheduleDayOfWeek = dayMap[slot.dayOfWeek];
        }

        console.log(
          `  📅 Slot dayOfWeek (raw): ${
            slot.dayOfWeek
          } (type: ${typeof slot.dayOfWeek})`
        );
        console.log(`  📅 Parsed scheduleDayOfWeek: ${scheduleDayOfWeek}`);
        console.log(`  📅 Requested dayOfWeek: ${dayOfWeek}`);
        console.log(`  🕒 Slot time: ${slot.startTime} - ${slot.endTime}`);
        console.log(`  🕒 Requested time: ${startTime} - ${endTime}`);
        console.log(`  ✓ Same day? ${scheduleDayOfWeek === dayOfWeek}`);
        console.log(
          `  ✓ Time overlap? ${isTimeOverlap(
            startTime,
            endTime,
            slot.startTime,
            slot.endTime
          )}`
        );

        // Nếu cùng ngày trong tuần VÀ trùng giờ
        if (
          scheduleDayOfWeek === dayOfWeek &&
          isTimeOverlap(startTime, endTime, slot.startTime, slot.endTime)
        ) {
          // Tính overlap time
          const overlapStart = Math.max(
            requestedStartMin,
            timeToMinutes(slot.startTime)
          );
          const overlapEnd = Math.min(
            requestedEndMin,
            timeToMinutes(slot.endTime)
          );
          const overlapMinutes = overlapEnd - overlapStart;

          conflicts.push({
            type: "regular_class",
            conflictClass: {
              _id: classItem._id,
              className: classItem.className,
              serviceName: classItem.serviceName,
            },
            conflictSlot: {
              dayOfWeek: scheduleDayOfWeek,
              dayName: dayNames[scheduleDayOfWeek],
              startTime: slot.startTime,
              endTime: slot.endTime,
            },
            requestedTime: {
              startTime,
              endTime,
            },
            overlapMinutes,
            message:
              `Trùng lịch dạy thường lớp "${classItem.className}" vào ${dayNames[dayOfWeek]}\n` +
              `Lịch hiện tại: ${slot.startTime} - ${slot.endTime}\n` +
              `Lịch muốn đổi: ${startTime} - ${endTime}\n` +
              `Trùng ${overlapMinutes} phút`,
          });

          console.log(
            `❌ Conflict with regular class:`,
            conflicts[conflicts.length - 1]
          );
        }
      }
    }

    // 3. Kiểm tra trùng với lịch dạy bù đã được duyệt
    const startOfDay = new Date(makeupDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(makeupDate);
    endOfDay.setHours(23, 59, 59, 999);

    const approvedMakeupRequests = await ScheduleChangeRequest.find({
      trainer: userId,
      status: "approved",
      "makeupSchedule.date": {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    }).populate("class", "className serviceName");

    console.log(
      `📋 Found ${approvedMakeupRequests.length} approved makeup schedules on this date`
    );

    for (const makeupReq of approvedMakeupRequests) {
      if (makeupReq.makeupSchedule && makeupReq.makeupSchedule.date) {
        const makeupStart = makeupReq.makeupSchedule.startTime;
        const makeupEnd = makeupReq.makeupSchedule.endTime;

        // Kiểm tra time overlap
        if (isTimeOverlap(startTime, endTime, makeupStart, makeupEnd)) {
          // Tính overlap time
          const overlapStart = Math.max(
            requestedStartMin,
            timeToMinutes(makeupStart)
          );
          const overlapEnd = Math.min(
            requestedEndMin,
            timeToMinutes(makeupEnd)
          );
          const overlapMinutes = overlapEnd - overlapStart;

          conflicts.push({
            type: "makeup_class",
            conflictClass: {
              _id: makeupReq.class._id,
              className: makeupReq.class.className,
              serviceName: makeupReq.class.serviceName,
            },
            conflictSlot: {
              date: makeupReq.makeupSchedule.date,
              startTime: makeupStart,
              endTime: makeupEnd,
              location: makeupReq.makeupSchedule.location,
            },
            requestedTime: {
              startTime,
              endTime,
            },
            overlapMinutes,
            message:
              `Trùng lịch dạy bù lớp "${
                makeupReq.class.className
              }" vào ${new Date(
                makeupReq.makeupSchedule.date
              ).toLocaleDateString("vi-VN")}\n` +
              `Lịch hiện tại: ${makeupStart} - ${makeupEnd}\n` +
              `Lịch muốn đổi: ${startTime} - ${endTime}\n` +
              `Trùng ${overlapMinutes} phút`,
          });

          console.log(
            `❌ Conflict with makeup class:`,
            conflicts[conflicts.length - 1]
          );
        }
      }
    }

    // 4. Trả về kết quả
    if (conflicts.length > 0) {
      return res.status(200).json({
        success: false,
        hasConflict: true,
        message: `HLV đã có ${conflicts.length} lịch dạy trùng vào ngày này`,
        conflicts: conflicts,
        details: conflicts.map((c) => c.message).join("\n"),
      });
    }

    return res.status(200).json({
      success: true,
      hasConflict: false,
      message: "Không có xung đột lịch dạy",
    });
  } catch (error) {
    console.error("❌ Error checking makeup schedule conflict:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi kiểm tra lịch dạy bù",
      error: error.message,
    });
  }
};

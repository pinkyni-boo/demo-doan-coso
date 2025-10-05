import Trainer from "../models/Trainer.js";
import Class from "../models/Class.js";
import User from "../models/User.js";
import ClassEnrollment from "../models/ClassEnrollment.js";
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
        message: 'Không tìm thấy thông tin người dùng'
      });
    }

    // Tìm các lớp học có instructorName trùng với fullName của user (bao gồm admin)
    const classes = await Class.find({ 
      instructorName: user.fullName 
    }).populate('service', 'serviceName');
    
    res.json({
      success: true,
      classes: classes.map(classItem => ({
        _id: classItem._id,
        className: classItem.className,
        service: classItem.service?.serviceName || classItem.serviceName,
        schedule: formatScheduleDisplay(classItem.schedule),
        location: classItem.location,
        maxStudents: classItem.maxMembers,
        enrolledStudents: classItem.currentMembers || 0,
        currentSession: classItem.currentSession || 1,
        totalSessions: classItem.totalSessions || 12,
        startDate: classItem.startDate,
        endDate: classItem.endDate,
        status: classItem.status || 'ongoing',
        description: classItem.description
      })),
      message: user.role === 'admin' 
        ? `Admin ${user.fullName} - Lớp học được gán: ${classes.length}` 
        : `Trainer ${user.fullName} - Lớp học được gán: ${classes.length}`
    });
  } catch (error) {
    console.error('Error fetching assigned classes:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách lớp học'
    });
  }
};

// Helper function để format schedule display
const formatScheduleDisplay = (schedule) => {
  if (!schedule || schedule.length === 0) return "Chưa xác định";
  
  const dayMap = {
    0: 'CN', 1: 'T2', 2: 'T3', 3: 'T4', 
    4: 'T5', 5: 'T6', 6: 'T7'
  };
  
  const days = schedule.map(s => dayMap[s.dayOfWeek]).join(',');
  const timeRange = schedule.length > 0 
    ? `${schedule[0].startTime}-${schedule[0].endTime}`
    : '';
  
  return `${days} - ${timeRange}`;
};

// Lấy chi tiết lớp học cho trainer
export const getClassDetail = async (req, res) => {
  try {
    const { classId } = req.params;
    const userId = req.user.id;
    
    // Tìm thông tin user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin người dùng'
      });
    }

    let classItem;
    
    // Nếu là admin, cho phép xem bất kỳ lớp học nào
    if (user.role === "admin") {
      classItem = await Class.findById(classId).populate('service', 'serviceName');
    } else {
      // Trainer thông thường chỉ xem lớp của mình
      classItem = await Class.findOne({ 
        _id: classId, 
        instructorName: user.fullName 
      }).populate('service', 'serviceName');
    }
    
    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lớp học hoặc bạn không có quyền truy cập'
      });
    }

    // Lấy danh sách học viên đã đăng ký (nếu có)
    const enrollments = await ClassEnrollment.find({ 
      class: classItem._id 
    }).populate('user', 'fullName email phone');
    
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
        students: enrollments?.map(enrollment => ({
          id: enrollment.user._id,
          name: enrollment.user.fullName,
          email: enrollment.user.email,
          phone: enrollment.user.phone,
          paymentStatus: enrollment.paymentStatus,
          joinDate: enrollment.createdAt,
          attendanceRate: 85, // Tạm thời hardcode
          totalAttended: Math.floor(Math.random() * (classItem.currentSession || 1)),
          totalSessions: classItem.currentSession || 1
        })) || []
      }
    });
  } catch (error) {
    console.error('Error fetching class detail:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy chi tiết lớp học'
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
    console.log('Dữ liệu tạo HLV:', { fullName, email, phone, gender, specialty, experience });
    
    if (!fullName || !email || !phone || !gender || !specialty || experience === undefined) {
      return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin HLV." });
    }

    // Kiểm tra email và phone có trùng không trong bảng Trainer
    const existingTrainer = await Trainer.findOne({
      $or: [{ email: email }, { phone: phone }]
    });

    if (existingTrainer) {
      if (existingTrainer.email === email) {
        return res.status(400).json({ error: `Email ${email} đã được sử dụng bởi huấn luyện viên khác.` });
      }
      if (existingTrainer.phone === phone) {
        return res.status(400).json({ error: `Số điện thoại ${phone} đã được sử dụng bởi huấn luyện viên khác.` });
      }
    }

    // Kiểm tra email và phone có trùng không trong bảng User
    const existingUser = await User.findOne({
      $or: [{ email: email }, { phone: phone }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ error: `Email ${email} đã được sử dụng bởi tài khoản khác trong hệ thống.` });
      }
      if (existingUser.phone === phone) {
        return res.status(400).json({ error: `Số điện thoại ${phone} đã được sử dụng bởi tài khoản khác trong hệ thống.` });
      }
    }

    // Tạo trainer sau khi đã kiểm tra trùng lặp
    const trainer = await Trainer.create(req.body);
    console.log('Tạo trainer thành công:', trainer._id);

    // Tự động tạo tài khoản người dùng cho HLV
    try {
      // Tạo username từ email (bỏ @domain) và kiểm tra unique
      let username = email.split('@')[0] + '_trainer';
      const existingUsername = await User.findOne({ username: username });
      if (existingUsername) {
        username = email.split('@')[0] + '_trainer_' + Date.now();
      }
      
      // Mật khẩu mặc định (nên thay đổi sau lần đăng nhập đầu)
      const defaultPassword = 'Trainer123!';
      
      const newUser = new User({
        username: username,
        email: email,
        fullName: fullName,
        phone: phone,
        gender: gender,
        password: defaultPassword,
        role: 'trainer',
        address: '',
      });

      await newUser.save();
      console.log('Tạo user thành công:', newUser._id);
      
      // Cập nhật trainer với userId
      const updatedTrainer = await Trainer.findByIdAndUpdate(
        trainer._id, 
        { userId: newUser._id },
        { new: true }
      );
      console.log('Cập nhật trainer với userId:', updatedTrainer.userId);
      
      res.status(201).json({
        trainer: updatedTrainer,
        message: `Tạo HLV thành công. Tài khoản đăng nhập: ${username}, mật khẩu mặc định: ${defaultPassword}`
      });
    } catch (userError) {
      // Nếu tạo user thất bại, vẫn giữ trainer nhưng thông báo chi tiết lỗi
      console.error('Lỗi tạo tài khoản user:', userError);
      let errorMessage = 'Tạo HLV thành công nhưng không thể tạo tài khoản đăng nhập. ';
      
      if (userError.code === 11000) {
        if (userError.keyPattern?.username) {
          errorMessage += 'Username đã tồn tại.';
        } else {
          errorMessage += 'Dữ liệu bị trùng lặp.';
        }
      } else if (userError.name === 'ValidationError') {
        errorMessage += 'Dữ liệu không hợp lệ: ' + Object.values(userError.errors).map(e => e.message).join(', ');
      } else {
        errorMessage += 'Lỗi hệ thống.';
      }
      
      res.status(201).json({
        trainer,
        warning: errorMessage
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
      return res.status(400).json({ message: "Vui lòng nhập lý do nghỉ việc." });
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
      console.log('Cập nhật mật khẩu cho trainer:', updated.userId);
      try {
        // Tìm user và cập nhật password để trigger pre-save hook
        const user = await User.findById(updated.userId);
        if (user) {
          console.log('Tìm thấy user, đang cập nhật mật khẩu...');
          user.password = newPassword; // Pre-save hook sẽ hash password
          await user.save();
          console.log('Cập nhật mật khẩu thành công');
          
          res.json({
            ...updated.toObject(),
            message: "Cập nhật HLV và mật khẩu thành công!"
          });
        } else {
          console.log('Không tìm thấy user với ID:', updated.userId);
          res.json({
            ...updated.toObject(),
            warning: "Cập nhật HLV thành công nhưng không tìm thấy tài khoản người dùng để đổi mật khẩu."
          });
        }
      } catch (userError) {
        console.error('Lỗi cập nhật mật khẩu:', userError);
        res.json({
          ...updated.toObject(),
          warning: "Cập nhật HLV thành công nhưng không thể cập nhật mật khẩu: " + userError.message
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
      return res.status(400).json({ message: "Vui lòng nhập lý do nghỉ việc." });
    }
    
    const updateData = {
      status,
      terminatedReason: status === "terminated" ? reason : undefined,
      isLocked: status === "terminated",
    };
    
    const trainer = await Trainer.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!trainer) return res.status(404).json({ message: "Trainer không tồn tại." });
    
    // Nếu chuyển sang trạng thái nghỉ việc, khóa tài khoản User
    if (status === "terminated" && trainer.userId) {
      try {
        await User.findByIdAndUpdate(trainer.userId, {
          isAccountLocked: true,
          lockReason: `Huấn luyện viên nghỉ việc: ${reason}`,
          lockUntil: null // Khóa vĩnh viễn cho đến khi admin mở
        });
        console.log(`Đã khóa tài khoản User ${trainer.userId} do HLV nghỉ việc`);
      } catch (userError) {
        console.error('Lỗi khóa tài khoản User:', userError);
      }
    }
    
    // Nếu chuyển về trạng thái active, mở khóa tài khoản
    if (status === "active" && trainer.userId) {
      try {
        await User.findByIdAndUpdate(trainer.userId, {
          isAccountLocked: false,
          lockReason: null,
          lockUntil: null
        });
        console.log(`Đã mở khóa tài khoản User ${trainer.userId} do HLV quay lại làm việc`);
      } catch (userError) {
        console.error('Lỗi mở khóa tài khoản User:', userError);
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
    const { classId, originalDate, requestedDate, reason, urgency } = req.body;

    console.log("Received request data:", { classId, originalDate, requestedDate, reason, urgency, userId });

    // Kiểm tra dữ liệu đầu vào
    if (!classId || !originalDate || !requestedDate || !reason) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đầy đủ thông tin: classId, originalDate, requestedDate, reason"
      });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({
        success: false,
        message: "ID lớp học không hợp lệ"
      });
    }

    // Tìm thông tin user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin người dùng"
      });
    }

    // Kiểm tra lớp học có thuộc về trainer này không
    const classItem = await Class.findOne({
      _id: classId,
      instructorName: user.fullName
    });

    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lớp học hoặc bạn không có quyền thay đổi lịch của lớp này"
      });
    }

    // Kiểm tra không được yêu cầu thay đổi sang ngày trong quá khứ
    const requestedDateObj = new Date(requestedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (requestedDateObj < today) {
      return res.status(400).json({
        success: false,
        message: "Không thể yêu cầu thay đổi lịch sang ngày trong quá khứ"
      });
    }

    // Kiểm tra ngày bù có nằm trong khoảng thời gian lớp học không
    const classStartDate = new Date(classItem.startDate);
    const classEndDate = new Date(classItem.endDate);
    
    if (requestedDateObj < classStartDate || requestedDateObj > classEndDate) {
      return res.status(400).json({
        success: false,
        message: `Ngày dạy bù phải trong khoảng thời gian lớp học (${classStartDate.toLocaleDateString('vi-VN')} - ${classEndDate.toLocaleDateString('vi-VN')})`
      });
    }

    // Kiểm tra không có yêu cầu pending cho cùng lớp và ngày
    const existingRequest = await ScheduleChangeRequest.findOne({
      trainer: userId,
      class: classId,
      originalDate: new Date(originalDate),
      status: "pending"
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "Đã có yêu cầu thay đổi lịch đang chờ xử lý cho ngày này"
      });
    }

    // Tạo yêu cầu thay đổi lịch
    const scheduleChangeRequest = new ScheduleChangeRequest({
      trainer: userId,
      class: classId,
      originalDate: new Date(originalDate),
      requestedDate: new Date(requestedDate),
      reason: reason.trim(),
      urgency: urgency || "medium"
    });

    console.log("Creating schedule change request:", scheduleChangeRequest);
    await scheduleChangeRequest.save();
    console.log("Schedule change request saved successfully");

    // Populate thông tin để trả về
    await scheduleChangeRequest.populate([
      { path: "class", select: "className serviceName" },
      { path: "trainer", select: "fullName email" }
    ]);

    // Gửi thông báo cho admin
    try {
      const trainer = await User.findById(userId);
      await NotificationService.notifyAdminNewScheduleRequest(scheduleChangeRequest, trainer);
    } catch (notificationError) {
      console.error("Error sending notification to admin:", notificationError);
      // Không làm gián đoạn flow chính nếu thông báo lỗi
    }

    res.status(201).json({
      success: true,
      message: "Yêu cầu thay đổi lịch đã được gửi thành công",
      request: scheduleChangeRequest
    });

  } catch (error) {
    console.error("Error creating schedule change request:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo yêu cầu thay đổi lịch",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
          count: { $sum: 1 }
        }
      }
    ]);

    const statusStats = {
      pending: 0,
      approved: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      statusStats[stat._id] = stat.count;
    });

    res.json({
      success: true,
      requests,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      },
      stats: statusStats
    });

  } catch (error) {
    console.error("Error fetching schedule change requests:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách yêu cầu thay đổi lịch"
    });
  }
};
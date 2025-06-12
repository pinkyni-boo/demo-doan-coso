import Class from "../models/Class.js";
import ClassEnrollment from "../models/ClassEnrollment.js";
import Service from "../models/Service.js";
import User from "../models/User.js";
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
export const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Nếu có serviceId trong updateData, chuyển thành service
    if (updateData.serviceId) {
      updateData.service = updateData.serviceId;
      delete updateData.serviceId;
    }

    const updatedClass = await Class.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("service", "name image");

    if (!updatedClass) {
      return res.status(404).json({ message: "Không tìm thấy lớp học" });
    }

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

// Lấy lớp học của user với status update
export const getUserClasses = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    const filter = { user: userId };
    if (status) filter.status = status;

    const enrollments = await ClassEnrollment.find(filter)
      .populate({
        path: "class",
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
